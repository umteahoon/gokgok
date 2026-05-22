import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// [회원가입 API]
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { id, email, password, name } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const { error } = await supabase
      .from('profiles')
      .insert([
        { 
          id: id,       // 아이디
          email: email, // 이메일
          password: hashedPassword, 
          name: name,   // 이름
          role: email === 'am2869@naver.com' ? 'ADMIN' : 'USER' 
        }
      ]);

    if (error) throw error;

    res.status(201).json({ success: true, message: '회원가입 성공!' });
  } catch (err: any) {
    res.status(400).json({ success: false, message: '중복된 아이디나 이메일입니다.' });
  }
});

// [로그인 API]
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { id, password } = req.body;

    const { data: user, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !user) {
      return res.status(400).json({ success: false, message: '존재하지 않는 아이디입니다.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: '비밀번호가 틀렸습니다.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '30m' }
    );

    res.json({ 
      success: true, 
      token, 
      user: { id: user.id, name: user.name, email: user.email, role: user.role } 
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: '서버 오류' });
  }
});

// [아이디 찾기] 이메일로 가입된 아이디(id) 조회
router.post('/find-id', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (error || !data) {
      return res.status(404).json({ success: false, message: '해당 이메일로 가입된 아이디가 없습니다.' });
    }

    res.json({ success: true, userId: data.id });
  } catch (err: any) {
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// [비밀번호 변경] 아이디와 이메일이 일치하는 유저의 비밀번호를 새로 덮어씌움
router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { id, email, newPassword } = req.body;

    // 1. 해당 아이디와 이메일을 가진 유저가 있는지 먼저 확인
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', id)
      .eq('email', email)
      .maybeSingle();

    if (userError || !user) {
      return res.status(404).json({ success: false, message: '일치하는 사용자 정보를 찾을 수 없습니다.' });
    }

    // 2. 새 비밀번호 암호화
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 3. 비밀번호 업데이트
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ password: hashedPassword })
      .eq('id', id);

    if (updateError) throw updateError;

    res.json({ success: true, message: '비밀번호가 성공적으로 변경되었습니다.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: '비밀번호 변경 중 오류가 발생했습니다.' });
  }
});

// [Supabase 비밀번호 재설정 링크 발송 API]
router.post('/send-reset-link', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: '이메일을 입력해주세요.' });
    }

    // 🎯 Supabase 공식 가이드라인 Auth 링크 발송 트리거 활성화
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      // 🚩 메일 링크 클릭 시 사용자를 강제로 복귀시킬 로컬/실서버 주소 매핑
      redirectTo: 'http://localhost:8080/#/reset-password', 
    });

    if (error) throw error;

    res.json({ success: true, message: '비밀번호 재설정 이메일이 발송되었습니다.' });
  } catch (err: any) {
    console.error('메일 발송 오류:', err);
    res.status(500).json({ success: false, message: err.message || '인증 메일 발송 중 오류 발생' });
  }
});

export default router;