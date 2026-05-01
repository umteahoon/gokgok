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
// 💡 (router.post as any)를 사용하여 multer와 express 타입 충돌을 강제로 해결했습니다.
(router.post as any)('/', upload.array('images'), async (req: any, res: any) => {
  try {
    const { author, author_email, title, content, category } = req.body;
    
    const files = req.files as any[]; 
    const imageUrls: string[] = [];

    if (files && files.length > 0) {
      for (const file of files) {
        const fileName = `${Date.now()}_${file.originalname}`;
        
        const { error: uploadError } = await supabase.storage
          .from('community_images') 
          .upload(fileName, file.buffer, {
            contentType: file.mimetype,
            upsert: true
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('community_images')
          .getPublicUrl(fileName);
        
        imageUrls.push(publicUrl);
      }
    }

    const { data, error } = await supabase
      .from('community_posts')
      .insert([{ 
        author, 
        author_email, 
        title, 
        content, 
        category, 
        images: imageUrls, 
        status: 'active' 
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, post: data });
  } catch (error: any) {
    console.error("작성 에러 상세:", error.message);
    res.status(500).json({ success: false, message: '글 작성 실패' });
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
// 💡 PUT 요청도 타입 충돌 방지를 위해 any로 처리했습니다.
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