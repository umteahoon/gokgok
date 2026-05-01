/**
 * 문의사항 관리 라우터
 * 파일 위치: backend/src/routes/contact.ts
 */
import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';

const router = Router();
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 1. [사용자] 문의사항 접수: POST /api/contact/contact
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

// 2. [관리자] 문의 목록 조회: GET /api/admin/contacts
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

// 3. [관리자] 답변 등록: PUT /api/admin/contacts/:id/reply
router.put('/contacts/:id/reply', async (req, res) => {
  try {
    const { id } = req.params;
    const { reply_content } = req.body;

    const { data, error } = await supabase
      .from('contacts')
      .update({ reply_content, status: 'completed', replied_at: new Date() })
      .eq('id', id)
      .select();

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;