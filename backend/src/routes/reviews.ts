import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

const router = Router();

// 🎯 Supabase 서비스 롤 주머니 인스턴스 초기화
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * 🚀 [리뷰 목록 조회 API]
 * GET /api/reviews/:festivalId
 */
router.get('/:festivalId', async (req: Request, res: Response) => {
  try {
    const { festivalId } = req.params;

    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('festival_id', festivalId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data });
  } catch (err: any) {
    console.error('❌ 리뷰 조회 중 서버 내부 에러:', err.message);
    res.status(500).json({ success: false, message: '리뷰를 불러오는 중 오류가 발생했습니다.' });
  }
});

/**
 * 🚀 [리뷰 등록 API]
 * POST /api/reviews
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { festivalId, userId, userName, content, rating } = req.body;

    if (!festivalId || !userId || !content) {
      return res.status(400).json({ success: false, message: '필수 데이터가 누락되었습니다.' });
    }

    const { data, error } = await supabase
      .from('reviews')
      .insert([
        {
          festival_id: festivalId,
          user_id: userId,
          user_name: userName || '익명 사용자',
          content,
          rating: rating || 5
        }
      ])
      .select();

    if (error) throw error;

    res.status(201).json({ success: true, data: data[0] });
  } catch (err: any) {
    console.error('❌ 리뷰 등록 중 서버 내부 에러:', err.message);
    res.status(500).json({ success: false, message: '리뷰 등록에 실패했습니다.' });
  }
});

/**
 * 🚀 [리뷰 삭제 API]
 * DELETE /api/reviews/:reviewId
 */
router.delete('/:reviewId', async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params;

    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId);

    if (error) throw error;

    res.json({ success: true, message: '리뷰가 성공적으로 삭제되었습니다.' });
  } catch (err: any) {
    console.error('❌ 리뷰 삭제 중 서버 내부 에러:', err.message);
    res.status(500).json({ success: false, message: '리뷰 삭제 처리 중 오류가 발생했습니다.' });
  }
});

// 🎯 Node.js Express 환경이 안전하게 라우팅 경로를 수신할 수 있도록 기본 내보내기 명시
export default router;