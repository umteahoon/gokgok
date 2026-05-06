// 2026.04.10 주환
import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import multer from 'multer';



dotenv.config();
const router = Router();

// 메모리에 파일을 임시 저장하는 multer 설정
const upload = multer({ storage: multer.memoryStorage() });

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);



// 1. [게시글 목록 불러오기] GET /api/community

router.get('/', async (req: any, res: any) => {
  try {
    const { data, error } = await supabase
      .from('community_posts')
      .select('*, commentsList:comments(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, posts: data });

  } catch (error: any) {
    res.status(500).json({ success: false, message: '게시글을 불러오지 못했습니다.' });
  }

});



// 좋아요 토글 API: POST /api/community/:id/like

// 프론트엔드에서 handleLike 호출 시 이 경로를 때리게 됩니다.

router.post('/:id/like', async (req: any, res: any) => {
  try {
    const { id } = req.params; // 게시글 ID
    const { user_email } = req.body; // 좋아요를 누른 유저의 이메일

    if (!user_email) {
      return res.status(400).json({ success: false, message: "유저 이메일이 필요합니다." });
    }



    // 1. 이미 좋아요를 눌렀는지 post_likes 테이블 확인

    const { data: existingLike, error: fetchError } = await supabase
      .from('post_likes')
      .select('*')
      .eq('post_id', id)
      .eq('user_email', user_email)
      .single();

    // 2. 현재 게시글의 좋아요 수 가져오기

    const { data: postData } = await supabase
      .from('community_posts')
      .select('likes')
      .eq('id', id)
      .single();
   
    const currentLikes = postData?.likes || 0;



    if (existingLike) {
      // 3-A. 이미 눌렀다면: 좋아요 취소 (기록 삭제 + 카운트 감소)
      await supabase.from('post_likes').delete().eq('id', existingLike.id);
    
      const { data: updatedPost } = await supabase
        .from('community_posts')
        .update({ likes: Math.max(0, currentLikes - 1) })
        .eq('id', id)
        .select()
        .single();

      return res.json({ success: true, isLiked: false, likes: updatedPost.likes });

    } else {

      // 3-B. 안 눌렀다면: 좋아요 추가 (기록 생성 + 카운트 증가)

      await supabase.from('post_likes').insert([{ post_id: id, user_email }]);

     

      const { data: updatedPost } = await supabase
        .from('community_posts')
        .update({ likes: currentLikes + 1 })
        .eq('id', id)
        .select()
        .single();

      return res.json({ success: true, isLiked: true, likes: updatedPost.likes });

    }

  } catch (error: any) {
    console.error("좋아요 처리 에러:", error.message);
    res.status(500).json({ success: false, message: '좋아요 처리에 실패했습니다.' });

  }

});



// 2. [새 게시글 작성] POST /api/community


router.post('/', upload.array('images'), async (req: any, res: any) => {
  try {
    const { author, author_email, title, content, category } = req.body;
    const files = req.files as any[];
    const imageUrls: string[] = [];

    if (files && files.length > 0) {
      for (const file of files) {
        const safeName = file.originalname.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
        const fileName = `${Date.now()}_${safeName}`;
        const { error: uploadError } = await supabase.storage

          .from('community_images')

          .upload(fileName, file.buffer, {

            contentType: file.mimetype,

            upsert: true

          });



        if (uploadError) throw new Error(`이미지 서버 저장 실패: ${uploadError.message}`);



        const { data: { publicUrl } } = supabase.storage

          .from('community_images')

          .getPublicUrl(fileName);

       

        imageUrls.push(publicUrl);

      }

    }



    const { data, error: dbError } = await supabase

      .from('community_posts')

      .insert([{

        author: author || "익명",

        author_email: author_email || "",

        title: title || "제목 없음",

        content: content || "",

        category: category || "기타",

        images: imageUrls,

        status: 'active',

        likes: 0 // 초기 좋아요는 0

      }])

      .select();



    if (dbError) throw new Error(`데이터베이스 저장 실패: ${dbError.message}`);



    res.status(201).json({ success: true, post: data?.[0] });

  } catch (error: any) {

    res.status(500).json({ success: false, message: error.message });

  }

});



// 3. [게시글 삭제] DELETE /api/community/:id

router.delete('/:id', async (req: any, res: any) => {

  try {

    const { id } = req.params;

    const { author_email } = req.body;



    const { data, error } = await supabase

      .from('community_posts')

      .delete()

      .eq('id', id)

      .eq('author_email', author_email)

      .select();



    if (error) throw error;

    if (data.length === 0) {

      return res.status(403).json({ success: false, message: '삭제 권한이 없습니다.' });

    }



    res.json({ success: true, message: '삭제되었습니다.' });

  } catch (error: any) {

    res.status(500).json({ success: false, message: '삭제 실패' });

  }

});



// 4. [새 댓글 작성] POST /api/community/:postId/comments

router.post('/:postId/comments', async (req: any, res: any) => {

  try {

    const { postId } = req.params;

    const { author, author_email, text } = req.body;



    const { data, error } = await supabase

      .from('comments')

      .insert([{ post_id: postId, author, author_email, text }])

      .select()

      .single();



    if (error) throw error;

    res.status(201).json({ success: true, comment: data });

  } catch (error: any) {

    res.status(500).json({ success: false, message: '댓글 작성 실패' });

  }

});



// 5. [댓글 삭제] DELETE /api/community/:postId/comments/:commentId

router.delete('/:postId/comments/:commentId', async (req: any, res: any) => {

  try {

    const { commentId } = req.params;

    const { author_email } = req.body;



    const { data, error } = await supabase

      .from('comments')

      .delete()

      .eq('id', commentId)

      .eq('author_email', author_email)

      .select();

   

    if (error) throw error;

    if (data.length === 0) {

      return res.status(403).json({ success: false, message: '삭제 권한이 없습니다.' });

    }



    res.json({ success: true, message: '댓글이 삭제되었습니다.' });

  } catch (error: any) {

    res.status(500).json({ success: false, message: '댓글 삭제 실패' });

  }

});



// 6. [게시글 수정] PUT /api/community/:id

router.put('/:id', upload.array('images'), async (req: any, res: any) => {

  try {

    const { id } = req.params;

    const { author_email, title, content } = req.body;

    const files = req.files as any[];

    let finalImages = req.body.images;



    if (files && files.length > 0) {

      const newUrls: string[] = [];

      for (const file of files) {

        const fileName = `${Date.now()}_${file.originalname}`;

        await supabase.storage.from('community_images').upload(fileName, file.buffer);

        const { data: { publicUrl } } = supabase.storage.from('community_images').getPublicUrl(fileName);

        newUrls.push(publicUrl);

      }

      finalImages = newUrls;

    }



    const { data, error } = await supabase

      .from('community_posts')

      .update({ title, content, images: finalImages })

      .eq('id', id)

      .eq('author_email', author_email)

      .select()

      .single();



    if (error) throw error;

    if (!data) return res.status(403).json({ success: false, message: '수정 권한이 없습니다.' });



    res.json({ success: true, post: data });

  } catch (error: any) {

    res.status(500).json({ success: false, message: '글 수정 실패' });

  }

});



export default router;