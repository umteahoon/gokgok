import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();
const router = Router();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * 1. 특정 축제 리뷰 목록 조회 (작성자 정보 포함)
 */
router.get('/festival/:festivalId', async (req: Request, res: Response) => {
  const { festivalId } = req.params;

  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('id, user_email, festival_id, rating, content, created_at, profiles(name, profilePhoto)') 
      // 🚩 profile_photo -> profilePhoto (DB 컬럼명 확인 필요)
      .eq('festival_id', festivalId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.status(200).json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * 2. 내 리뷰 목록 조회 (마이페이지용)
 */
router.get('/user/:userEmail', async (req: Request, res: Response) => {
  const { userEmail } = req.params;

  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*') // 필요 시 축제 정보 테이블과 조인 가능
      .eq('user_email', userEmail)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.status(200).json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: '리뷰 조회 중 오류가 발생했습니다.' });
  }
});

/**
 * 3. 리뷰 등록
 */
router.post('/', async (req: Request, res: Response) => {
  const { user_email, festival_id, rating, content } = req.body;

  if (!user_email || !festival_id || !rating || !content) {
    return res.status(400).json({ success: false, message: '필수값이 누락되었습니다.' });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ success: false, message: '별점은 1~5 사이여야 합니다.' });
  }

  try {
    const { data, error } = await supabase
      .from('reviews')
      .insert([{ user_email, festival_id, rating, content }])
      .select();

    if (error) {
      if (error.code === '23505') { // UNIQUE 제약 조건 위반 (이미 작성함)
        return res.status(409).json({ success: false, message: '이미 리뷰를 작성한 축제입니다.' });
      }
      throw error;
    }

    return res.status(201).json({ success: true, message: '리뷰 등록 완료', data });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * 4. 리뷰 수정
 */
router.put('/:reviewId', async (req: Request, res: Response) => {
  const { reviewId } = req.params;
  const { rating, content } = req.body;

  try {
    const { data, error } = await supabase
      .from('reviews')
      .update({
        rating,
        content,
        updated_at: new Date().toISOString(),
      })
      .eq('id', reviewId)
      .select();

    if (error) throw error;
    return res.status(200).json({ success: true, message: '리뷰 수정 완료', data });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: '리뷰 수정 중 오류가 발생했습니다.' });
  }
});

/**
 * 5. 리뷰 삭제
 */
router.delete('/:reviewId', async (req: Request, res: Response) => {
  const { reviewId } = req.params;

  try {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId);

    if (error) throw error;
    return res.status(200).json({ success: true, message: '리뷰 삭제 완료' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: '리뷰 삭제 중 오류가 발생했습니다.' });
  }
});

export default router;