import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';

const router = Router();
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

// 1. [사용자] 문의 접수 (POST /api/contact)
router.post('/contact', async (req, res) => {
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

// 2. [사용자] 내 답변 조회 (GET /api/contact/:email) -> 🚩 404 해결 포인트
router.get('/contact/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const { data, error } = await supabase.from('contacts').select('*').eq('email', email).order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. [관리자] 답변 등록 (PUT /api/admin/contact/:id/reply) -> 🚩 500 해결 포인트
// index.ts에서 /api/admin으로 연결했으므로 경로는 /contact/:id/reply가 됩니다.
router.put('/contact/:id/reply', async (req, res) => {
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
