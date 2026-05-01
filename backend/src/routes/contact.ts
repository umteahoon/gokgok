// backend/src/routes/contact.ts
import { Router } from 'express';
import { createClient } from '@supabase/supabase-js';

const router = Router();
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

// 💡 문의사항 저장 (POST /api/contact)
router.post('/', async (req, res) => {
  try {
    const { name, email, category, message } = req.body;

    const { data, error } = await supabase
      .from('contacts') // 💡 Supabase에 'contacts' 테이블이 있어야 합니다.
      .insert([{ name, email, category, message, status: 'pending' }])
      .select();

    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 💡 관리자용 문의 목록 조회 (GET /api/contact)
router.get('/', async (req, res) => {
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

// backend/src/routes/contact.ts 에 추가
// 💡 문의 답변 등록 (PUT /api/contact/:id/reply)
router.put('/:id/reply', async (req, res) => {
  try {
    const { id } = req.params;
    const { reply_content } = req.body;

    const { data, error } = await supabase
      .from('contacts')
      .update({ 
        reply_content: reply_content,
        status: 'completed', // 답변 완료 시 상태 변경
        replied_at: new Date() 
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