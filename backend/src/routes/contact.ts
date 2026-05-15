import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const router = Router();
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
const secretKey = process.env.JWT_SECRET || 'gokgok-secret-key';

/**
 * [내부 미들웨어] 토큰을 검증하여 요청자와 타겟 이메일이 일치하는지 확인
 */
const verifyUserSelf = (req: Request, res: Response, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  const { email } = req.params;

  if (!token) return res.status(401).json({ success: false, message: "인증 토큰이 없습니다." });

  try {
    const decoded: any = jwt.verify(token, secretKey);
    // 🚩 핵심 보안: 토큰의 이메일과 조회하려는 이메일이 다르면 차단
    if (decoded.email !== email) {
      return res.status(403).json({ success: false, message: "본인의 내역만 조회할 수 있습니다." });
    }
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: "유효하지 않은 토큰입니다." });
  }
};



/**
 * [사용자 영역]
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
// ✅ 보안 미들웨어(verifyUserSelf)를 추가하여 자기 것만 조회 가능하게 함
router.get('/contact/search/:email', verifyUserSelf, async (req, res) => {
  try {
    const { email } = req.params;
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * [관리자 영역]
 */

// 3. 전체 목록 조회: GET /api/admin/contacts/all
router.get('/all', async (req, res) => {
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