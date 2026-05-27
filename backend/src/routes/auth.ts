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

/**
 * 1. [회원가입 API]
 * 중복 체크 및 데이터 검증 강화
 */
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { id, email, password, name } = req.body;

    // 데이터 유효성 검사
    if (!id || !email || !password) {
      return res.status(400).json({ success: false, message: '아이디, 이메일, 비밀번호는 필수 입력 사항입니다.' });
    }

    // 아이디 중복 체크 (기존 profiles 테이블 기준)
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', id)
      .maybeSingle();

    if (existingUser) {
      return res.status(409).json({ success: false, message: '이미 사용 중인 아이디입니다.' });
    }

    // A. Supabase Auth 계정 생성
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true
    });

    if (authError) {
      return res.status(400).json({ success: false, message: authError.message });
    }

    // B. 비밀번호 암호화
    const hashedPassword = await bcrypt.hash(password, 10);

    // C. 커스텀 profiles 테이블 저장
    const { error: dbError } = await supabase
      .from('profiles')
      .insert([
        { 
          id: id, 
          email: email, 
          password: hashedPassword, 
          name: name || '사용자', 
          role: email === 'am2869@naver.com' ? 'ADMIN' : 'USER' 
        }
      ]);

    if (dbError) throw dbError;

    res.status(201).json({ success: true, message: '회원가입 성공!' });
  } catch (err: any) {
    console.error('회원가입 실패:', err);
    res.status(500).json({ success: false, message: '서버 내부 오류가 발생했습니다.' });
  }
});

/**
 * 2. [로그인 API]
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { id, password } = req.body;

    const { data: user, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !user) {
      return res.status(401).json({ success: false, message: '존재하지 않는 아이디입니다.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: '비밀번호가 틀렸습니다.' });
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
    res.status(500).json({ success: false, message: '로그인 서버 오류' });
  }
});

/**
 * 3. [아이디 찾기]
 */
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

/**
 * 4. [비밀번호 재설정 링크 발송]
 */
router.post('/send-reset-link', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:8080/#/reset-password', 
    });
    if (error) throw error;
    res.json({ success: true, message: '메일이 발송되었습니다.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: '메일 발송 실패' });
  }
});

/**
 * 5. [비밀번호 최종 변경]
 */
router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { email, newPassword } = req.body;
    
    // Auth 업데이트
    const { data: userList } = await supabase.auth.admin.listUsers();
    const targetUser = userList.users.find(u => u.email === email);
    
    if (targetUser) {
      await supabase.auth.admin.updateUserById(targetUser.id, { password: newPassword });
    }

    // Profiles 동기화
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await supabase.from('profiles').update({ password: hashedPassword }).eq('email', email);

    res.json({ success: true, message: '비밀번호 변경 완료' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: '비밀번호 변경 실패' });
  }
});

export default router;