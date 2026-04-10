import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();
const router = Router();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 1. 내 찜 목록 조회 (email 기반으로 변경)
router.get('/favorites/:userEmail', async (req: Request, res: Response) => {
  const { userEmail } = req.params;

  try {
    const { data, error } = await supabase
      .from('user_favorite_festivals')
      .select(`
        id,
        user_email,
        festival_id,
        created_at
        /* festivals 테이블이 실제 DB에 있을 때만 아래 줄 주석 해제 */
        /* , festivals (*) */
      `)
      .eq('user_email', userEmail)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.status(200).json({ success: true, data });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '조회 중 오류 발생' });
  }
});

// 2. 찜 등록 (중복 체크는 DB UNIQUE 제약조건이 처리해주므로 더 간소화 가능)
router.post('/favorites', async (req: Request, res: Response) => {
  const { user_email, festival_id } = req.body;

  if (!user_email || !festival_id) {
    return res.status(400).json({ success: false, message: '필수 값이 누락되었습니다.' });
  }

  try {
    const { data, error } = await supabase
      .from('user_favorite_festivals')
      .insert([{ user_email, festival_id }])
      .select();

    if (error) {
      // DB의 UNIQUE 제약조건에 걸렸을 때의 처리 (에러코드 23505)
      if (error.code === '23505') {
        return res.status(409).json({ success: false, message: '이미 찜한 축제입니다.' });
      }
      throw error;
    }

    return res.status(201).json({ success: true, message: '찜 등록 완료', data });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 3. 찜 취소 (Query Parameter 방식 권장)
router.delete('/favorites', async (req: Request, res: Response) => {
  const { user_email, festival_id } = req.query; // body 대신 query 사용 가능

  try {
    const { error } = await supabase
      .from('user_favorite_festivals')
      .delete()
      .eq('user_email', user_email)
      .eq('festival_id', festival_id);

    if (error) throw error;
    return res.status(200).json({ success: true, message: '찜 취소 완료' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 4. 찜 여부 확인
router.get('/check/:userEmail/:festivalId', async (req: Request, res: Response) => {
  const { userEmail, festivalId } = req.params;

  try {
    const { data, error } = await supabase
      .from('user_favorite_festivals')
      .select('id')
      .eq('user_email', userEmail)
      .eq('festival_id', festivalId)
      .maybeSingle();

    if (error) throw error;
    return res.status(200).json({ success: true, isFavorite: !!data });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;