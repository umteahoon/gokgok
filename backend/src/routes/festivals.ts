import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

const router = Router();
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const tourismApiKey = process.env.TOURISM_API_KEY;

/**
 * [축제 리스트 조회 API]
 * GET /api/festivals?query=진주&category=전통문화&is_top=true
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { query, category, is_top } = req.query;

    let dbQuery = supabase.from('festivals').select('*');

    // 1. 검색어 필터링 (제목 또는 지역에 검색어가 포함된 경우)
    if (query) {
      dbQuery = dbQuery.or(`title.ilike.%${query}%,location.ilike.%${query}%`);
    }

    // 2. 카테고리 필터링 (카테고리가 '전체'가 아닐 때만)
    if (category && category !== '전체') {
      dbQuery = dbQuery.eq('category', category);
    }

    // 3. 베스트 축제(TOP!) 필터링
    if (is_top === 'true') {
      dbQuery = dbQuery.eq('is_top', true).order('rank', { ascending: true });
    } else {
      // 일반 리스트는 최신순 정렬
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
    
    // 특정 ID가 'tourist-spots'나 'tour-api' 라우팅과 충돌하는 것을 방지하기 위한 예외 방어선
    if (id === 'tourist-spots' || id === 'tour-api') return;

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

/**
 * 🚀 [추가] 공공데이터포털 - 전국 관광지 정보 조회 API (CSV 덤프 기반)
 * GET /api/festivals/tourist-spots
 */
router.get('/tourist-spots', async (req: Request, res: Response) => {
  try {
    console.log('📍 [API] 전국 관광지 정보(854개) 요청 수신');

    const { data, error } = await supabase
      .from('tourist_spots')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error('❌ Supabase 관광지 조회 에러:', error);
      throw error;
    }

    res.json(data);
  } catch (err: any) {
    console.error('❌ 관광지 목록 로드 중 서버 내부 에러:', err);
    res.status(500).json({ error: '관광지 목록을 불러오는 중 오류가 발생했습니다.' });
  }
});

/**
 * 📸 [추가] 한국관광공사 국문 관광정보 실시간 연동 API (고화질 이미지 포함)
 * GET /api/festivals/tour-api
 */
router.get('/tour-api', async (req: Request, res: Response) => {
  try {
    console.log('📸 [API] 한국관광공사 실시간 관광지/사진 데이터 요청 수신');

    if (!tourismApiKey) {
      console.error('❌ [환경변수 에러] TOURISM_API_KEY가 설정되지 않았습니다.');
      return res.status(500).json({ success: false, error: '서버 API 키 설정 오류' });
    }

    const url = `https://apis.data.go.kr/B551011/KorService1/areaBasedList1`;

    const response = await axios.get(url, {
      params: {
        serviceKey: tourismApiKey, // 환경변수에서 꺼내온 마스터 인증키 주입
        MobileOS: 'ETC',
        MobileApp: 'GokGok',
        _type: 'json',             // 반드시 JSON 포맷으로 수신
        contentTypeId: 12,          // 12: 관광지 카테고리
        numOfRows: 15,             // 시연장에 최적화된 데이터 개수
        pageNo: 1
      }
    });

    const items = response.data?.response?.body?.items?.item || [];

    console.log(`✅ [API] 관광공사 데이터 수신 완료 (총 ${items.length}개 항목)`);
    res.json({ success: true, data: items });

  } catch (err: any) {
    console.error('❌ 한국관광공사 API 통신 중 치명적 오류 발생:', err.message);
    res.status(500).json({ success: false, error: '관광공사 서버 연동에 실패했습니다.' });
  }
});

export default router;