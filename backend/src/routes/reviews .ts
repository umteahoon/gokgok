import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';

dotenv.config();
const router = Router();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface FestivalParams extends ParamsDictionary {
  festivalId: string;
}

interface UserParams extends ParamsDictionary {
  userEmail: string;
}

interface ReviewIdParams extends ParamsDictionary {
  reviewId: string;
}

interface CreateReviewBody {
  user_email: string;
  festival_id: string;
  rating: number;
  content: string;
}

interface UpdateReviewBody {
  user_email: string;
  rating?: number;
  content?: string;
}

interface DeleteReviewQuery extends ParsedQs {
  user_email?: string;
}

/**
 * 1. 특정 축제 리뷰 목록 조회 (작성자 정보 포함)
 */
router.get('/festival/:festivalId', async (req: Request<FestivalParams>, res: Response) => {
  const { festivalId } = req.params;
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('id, user_email, festival_id, rating, content, created_at, profiles(name, profilePhoto)') 
      .eq('festival_id', festivalId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.status(200).json({ success: true, data });
  } catch (err: unknown) {
    console.error('리뷰 조회 중 오류:', err);
    return res.status(500).json({ success: false, message: '리뷰 목록을 불러오지 못했습니다.' });
  }
});

/**
 * 2. 내 리뷰 목록 조회 (마이페이지용)
 */
router.get('/user/:userEmail', async (req: Request<UserParams>, res: Response) => {
  const { userEmail } = req.params;
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*') 
      .eq('user_email', userEmail)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.status(200).json({ success: true, data });
  } catch (err: unknown) {
    console.error('내 리뷰 조회 중 오류:', err);
    return res.status(500).json({ success: false, message: '리뷰 조회 중 오류가 발생했습니다.' });
  }
});

/**
 * 3. 리뷰 등록
 */
router.post('/', async (req: Request<{}, {}, CreateReviewBody>, res: Response) => {
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
      if (error.code === '23505') { 
        return res.status(409).json({ success: false, message: '이미 리뷰를 작성한 축제입니다.' });
      }
      throw error;
    }
    return res.status(201).json({ success: true, message: '리뷰 등록 완료', data });
  } catch (err: unknown) {
    console.error('리뷰 등록 중 오류:', err);
    return res.status(500).json({ success: false, message: '리뷰 등록에 실패했습니다.' });
  }
});

/**
 * 4. 리뷰 수정
 */
router.put('/:reviewId', async (req: Request<ReviewIdParams, {}, UpdateReviewBody>, res: Response) => {
  const { reviewId } = req.params;
  const { rating, content, user_email } = req.body;

  if (!user_email) return res.status(400).json({ success: false, message: '사용자 인증 정보가 필요합니다.' });
  if (rating && (rating < 1 || rating > 5)) return res.status(400).json({ success: false, message: '별점은 1~5 사이여야 합니다.' });

  try {
    const { data: existingReview, error: fetchError } = await supabase
      .from('reviews')
      .select('user_email')
      .eq('id', reviewId)
      .single();

    if (fetchError || !existingReview) return res.status(404).json({ success: false, message: '존재하지 않는 리뷰입니다.' });
    if (existingReview.user_email !== user_email) return res.status(403).json({ success: false, message: '본인이 작성한 리뷰만 수정할 수 있습니다.' });

    const { data, error } = await supabase
      .from('reviews')
      .update({ rating, content, updated_at: new Date().toISOString() })
      .eq('id', reviewId)
      .select();

    if (error) throw error;
    return res.status(200).json({ success: true, message: '리뷰 수정 완료', data });
  } catch (err: unknown) {
    console.error('리뷰 수정 중 오류:', err);
    return res.status(500).json({ success: false, message: '리뷰 수정 중 오류가 발생했습니다.' });
  }
});

/**
 * 5. 리뷰 삭제
 */
router.delete('/:reviewId', async (req: Request<ReviewIdParams, {}, {}, DeleteReviewQuery>, res: Response) => {
  const { reviewId } = req.params;
  const { user_email } = req.query;

  if (!user_email) return res.status(400).json({ success: false, message: '사용자 인증 정보가 필요합니다.' });

  try {
    const { data: existingReview, error: fetchError } = await supabase
      .from('reviews')
      .select('user_email')
      .eq('id', reviewId)
      .single();

    if (fetchError || !existingReview) return res.status(404).json({ success: false, message: '존재하지 않는 리뷰입니다.' });
    if (existingReview.user_email !== String(user_email)) return res.status(403).json({ success: false, message: '본인이 작성한 리뷰만 삭제할 수 있습니다.' });

    const { error } = await supabase.from('reviews').delete().eq('id', reviewId);
    if (error) throw error;

    return res.status(200).json({ success: true, message: '리뷰 삭제 완료' });
  } catch (err: unknown) {
    console.error('리뷰 삭제 중 오류:', err);
    return res.status(500).json({ success: false, message: '리뷰 삭제 중 오류가 발생했습니다.' });
  }
});

export default router;