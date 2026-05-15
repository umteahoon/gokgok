import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

const router = Router();
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

// 모든 축제 리스트 가져오기 (검색 및 필터 포함)
router.get('/', async (req: Request, res: Response) => {
  try {
    const { query, category, is_top } = req.query;

    let dbQuery = supabase.from('festivals').select('*');

    // 1. 검색어 필터링
    if (query) {
      dbQuery = dbQuery.ilike('title', `%${query}%`);
    }

    // 2. 카테고리 필터링
    if (category && category !== '전체') {
      dbQuery = dbQuery.eq('category', category);
    }

    // 3. 베스트 축제만 보기
    if (is_top === 'true') {
      dbQuery = dbQuery.eq('is_top', true).order('rank', { ascending: true });
    } else {
      dbQuery = dbQuery.order('created_at', { ascending: false });
    }

    const { data, error } = await dbQuery;

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;