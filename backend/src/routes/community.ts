// 2026.04.10 주환 
import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();
const router = Router();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 1. [게시글 목록 불러오기] GET /api/community
router.get('/', async (req: Request, res: Response) => {
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
router.post('/', async (req: Request, res: Response) => {
  try {
    // author_email 추가 추출 및 저장
    const { author, author_email, title, content, category, images } = req.body;

    const { data, error } = await supabase
      .from('community_posts')
      .insert([{ author, author_email, title, content, category, images: images || [] }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, post: data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: '글 작성 실패' });
  }
});

// 3. [게시글 삭제] DELETE /api/community/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { author_email } = req.body; // 검증용 이메일 받기

    // 권한 검증: id와 author_email이 모두 일치해야만 삭제
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
router.post('/:postId/comments', async (req: Request, res: Response) => {
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
router.delete('/:postId/comments/:commentId', async (req: Request, res: Response) => {
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
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { author_email, title, content, images } = req.body; 

    const { data, error } = await supabase
      .from('community_posts')
      .update({ title, content, images })
      .eq('id', id)
      .eq('author_email', author_email) // 작성자 검증
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