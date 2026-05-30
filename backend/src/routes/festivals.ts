import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
const router = Router();
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * [축제 리스트 조회 API]
 * GET /api/festivals?query=진주&category=전통문화&is_top=true
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { query, category, is_top } = req.query;

    let dbQuery = supabase.from('festivals').select('*');

    // 1. 검색어 필터링
    if (query) {
      dbQuery = dbQuery.or(`title.ilike.%${query}%,location.ilike.%${query}%`);
    }

    // 2. 카테고리 필터링
    if (category && category !== '전체') {
      dbQuery = dbQuery.eq('category', category);
    }

    // 3. 베스트 축제 필터링
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

/**
 * [축제 상세 조회 API]
 * GET /api/festivals/:id
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('festivals')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(404).json({ success: false, message: "축제 정보를 찾을 수 없습니다." });
  }
});
// routes/festivals.ts 라우터에 추가
router.get('/gallery-images', async (req: Request, res: Response) => {
  try {
    const response = await axios.get(`https://apis.data.go.kr/B551011/KorService1/galleryList1`, {
      params: {
        serviceKey: process.env.TOURISM_API_KEY,
        MobileOS: 'ETC',
        MobileApp: 'GokGok',
        _type: 'json',
        numOfRows: 10,
        pageNo: 1
      }
    });

    // 📸 API 응답에서 사진 데이터(galWebImageUrl)를 추출
    const items = response.data.response.body.items.item;
    res.json({ success: true, images: items });
  } catch (err) {
    res.status(500).json({ success: false, message: '이미지 불러오기 실패' });
  }
});
export default router;