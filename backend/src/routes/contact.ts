import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';

const router = Router();
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

/**
 * [사용자 영역] - app.use('/api', contactRouter)와 연결됨
 */

// 1. 문의 접수: POST /api/contact/submit
router.post('/contact/submit', async (req, res) => {
  try {
    const { name, email, category, message } = req.body;
    const { data, error } = await supabase
      .from('contacts')
      .insert([{ name, email, category, message, status: 'pending' }]).select();
    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. 내 답변 조회: GET /api/contact/search/:email
router.get('/contact/search/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const { data, error } = await supabase.from('contacts').select('*').eq('email', email).order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * [관리자 영역] - app.use('/api/admin', contactRouter)와 연결됨
 */

// 3. 전체 목록 조회: GET /api/admin/contacts/all
router.get('/contacts/all', async (req, res) => {
  try {
    const { data, error } = await supabase.from('contacts').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 4. 관리자 답변 등록: PUT /api/admin/contacts/:id/reply
router.put('/contacts/:id/reply', async (req, res) => {
  try {
    const { id } = req.params;
    const { reply_content } = req.body;
    const { data, error } = await supabase
      .from('contacts')
      .update({ reply_content, status: 'answered', replied_at: new Date().toISOString() })
      .eq('id', id).select();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;