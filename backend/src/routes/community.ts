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

// 2. [새 게시글 작성] POST /api/community
// 💡 타입 충돌 방지를 위해 router.post를 any로 캐스팅합니다.
(router.post as any)('/', upload.array('images'), async (req: any, res: any) => {
  try {
    // 프론트엔드 FormData 추출
    const { author, author_email, title, content, category } = req.body;
    const files = req.files as any[]; 
    const imageUrls: string[] = [];

    // 💡 이미지 업로드 프로세스
    if (files && files.length > 0) {
      for (const file of files) {
        // 파일명 보안 처리 (특수문자 제거)
        const safeName = file.originalname.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
        const fileName = `${Date.now()}_${safeName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('community_images') 
          .upload(fileName, file.buffer, {
            contentType: file.mimetype,
            upsert: true
          });

        if (uploadError) {
          console.error("STORAGE 업로드 실패:", uploadError.message);
          throw new Error(`이미지 서버 저장 실패: ${uploadError.message}`);
        }

        const { data: { publicUrl } } = supabase.storage
          .from('community_images')
          .getPublicUrl(fileName);
        
        imageUrls.push(publicUrl);
      }
    }

    // 💡 DB 저장 시 필수 값(status: active) 강제 부여
    const { data, error: dbError } = await supabase
      .from('community_posts')
      .insert([{ 
        author: author || "익명", 
        author_email: author_email || "", 
        title: title || "제목 없음", 
        content: content || "", 
        category: category || "기타", 
        images: imageUrls, 
        status: 'active' 
      }])
      .select();

    if (dbError) {
      console.error("DB 저장 실패:", dbError.message);
      throw new Error(`데이터베이스 저장 실패: ${dbError.message}`);
    }

    res.status(201).json({ success: true, post: data?.[0] });
  } catch (error: any) {
    // 💡 에러 메시지를 구체적으로 반환하여 프론트엔드에서 원인을 알 수 있게 함
    console.error("최종 catch 에러:", error.message);
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
(router.put as any)('/:id', upload.array('images'), async (req: any, res: any) => {
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
    if (!data) {
       return res.status(403).json({ success: false, message: '수정 권한이 없습니다.' });
    }

    res.json({ success: true, post: data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: '글 수정 실패' });
  }
});

export default router;