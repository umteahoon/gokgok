// 2026.04.10 주환 
import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();
const router = Router();

// Supabase 연결 설정
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 1. [게시글 목록 불러오기] GET /api/community
router.get('/', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('community_posts')
      .select(`
        *,
        commentsList:comments(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, posts: data });
  } catch (error: any) {
    console.error('게시글 불러오기 에러:', error);
    res.status(500).json({ success: false, message: '게시글을 불러오지 못했습니다.' });
  }
});

// 2. [새 게시글 작성] POST /api/community
router.post('/', async (req: Request, res: Response) => {
  try {
    // [수정] 프론트에서 community_images 버킷에 올린 후 받은 URL 배열(images)을 받습니다.
    const { author, title, content, category, images } = req.body;

    const { data, error } = await supabase
      .from('community_posts')
      .insert([
        { 
          author, 
          title, 
          content, 
          category, 
          images: images || [] // 이미지 URL 배열 저장 (없으면 빈 배열)
        }
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, post: data });
  } catch (error: any) {
    console.error('글쓰기 에러:', error);
    res.status(500).json({ success: false, message: '글을 작성하지 못했습니다.' });
  }
});

// 3. [게시글 삭제] DELETE /api/community/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('community_posts').delete().eq('id', id);
    
    if (error) throw error;
    res.json({ success: true, message: '삭제되었습니다.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: '삭제 실패' });
  }
});

// 4. [새 댓글 작성] POST /api/community/:postId/comments
router.post('/:postId/comments', async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const { author, text } = req.body;

    const { data, error } = await supabase
      .from('comments')
      .insert([{ post_id: postId, author, text }])
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
    const { error } = await supabase.from('comments').delete().eq('id', commentId);
    
    if (error) throw error;
    res.json({ success: true, message: '댓글이 삭제되었습니다.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: '댓글 삭제 실패' });
  }
});

// 6. [게시글 수정] PUT /api/community/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // [수정] 수정 시에도 이미지 목록을 업데이트할 수 있도록 images 추가
    const { title, content, images } = req.body;

    const { data, error } = await supabase
      .from('community_posts')
      .update({ 
        title, 
        content,
        images: images // 수정된 이미지 배열 반영
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, post: data });
  } catch (error: any) {
    console.error('글 수정 에러:', error);
    res.status(500).json({ success: false, message: '글 수정 실패' });
  }
});

export default router;