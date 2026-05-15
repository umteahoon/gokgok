/**
 * 문의사항 관리 라우터 - 통합본
 * 파일 위치: backend/src/routes/contact.ts
 * 업데이트: 사용자 이메일 기반 답변 조회 로직 추가
 */
import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';

const router = Router();
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * 1. [사용자] 문의사항 접수: POST /api/contact
 * (index.ts에서 app.use('/api', contactRouter)로 연결됨)
 */
router.post('/contact', async (req, res) => {
  try {
    const { name, email, category, message } = req.body;
    const { data, error } = await supabase
      .from('contacts')
      .insert([{ name, email, category, message, status: 'pending' }])
      .select();

    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 2. [사용자] 내 문의사항 답변 조회: GET /api/contact/:email
 * 사용자가 "답변 조회하기" 버튼을 눌렀을 때 호출되는 API입니다.
 */
router.get('/contact/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('email', email) // 입력한 이메일과 일치하는 데이터만 필터링
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "문의 내역을 불러오는데 실패했습니다." });
  }
});

/**
 * 3. [관리자] 문의 목록 전체 조회: GET /api/admin/contacts
 * (index.ts에서 app.use('/api/admin', contactRouter)로 연결됨)
 */
router.get('/contacts', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * 4. [관리자] 답변 등록: PUT /api/admin/contacts/:id/reply
 */
router.put('/contacts/:id/reply', async (req, res) => {
  try {
    const { id } = req.params;
    const { reply_content } = req.body;

    const { data, error } = await supabase
      .from('contacts')
      .update({ 
        reply_content, 
        status: 'completed', 
        replied_at: new Date().toISOString() 
      })
      .eq('id', id)
      .select();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;