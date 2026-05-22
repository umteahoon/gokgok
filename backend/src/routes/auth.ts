import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

// 🎯 중요: auth 관리를 위해 SERVICE_ROLE_KEY를 사용하는 클라이언트 유지
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * 1. [회원가입 API] 
 * Supabase Auth 엔진 등록 + profiles 테이블 동시 적재 구조로 고도화
 */
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { id, email, password, name } = req.body;

    // A. Supabase 공식 Auth 시스템에 계정 생성 (이메일 인증 연동의 핵심)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password, // Supabase Auth 내부에서 자체 암호화되므로 평문으로 전달합니다.
      email_confirm: true // 시연 및 테스트를 위해 이메일 소유권 확인 절차 자동 통과 처리
    });

    if (authError) throw authError;

    // B. 기존 로그인 생태계 호환을 위해 profiles 테이블용 bcrypt 암호화 진행
    const hashedPassword = await bcrypt.hash(password, 10);

    // C. 커스텀 profiles 테이블에 매핑 데이터 insert
    const { error: dbError } = await supabase
      .from('profiles')
      .insert([
        { 
          id: id,       // 유저가 사용하는 고유 아이디
          email: email, 
          password: hashedPassword, 
          name: name,   
          role: email === 'am2869@naver.com' ? 'ADMIN' : 'USER' 
        }
      ]);

    if (dbError) throw dbError;

    res.status(201).json({ success: true, message: '회원가입 및 통합 인증 등록 성공!' });
  } catch (err: any) {
    console.error('회원가입 실패:', err);
    res.status(400).json({ success: false, message: '이미 가입된 아이디나 이메일입니다.' });
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
 * 4. [Supabase 이메일 링크 발송 API]
 * 이제 Auth 엔진에 계정이 존재하므로 정상 작동합니다.
 */
router.post('/send-reset-link', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: '이메일을 입력해주세요.' });
    }

    // 🎯 Supabase 공식 가이드라인 Auth 링크 발송 활성화
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:8080/#/reset-password', 
    });

    if (error) throw error;

    res.json({ success: true, message: '비밀번호 재설정 이메일이 발송되었습니다.' });
  } catch (err: any) {
    console.error('메일 발송 오류:', err);
    res.status(500).json({ success: false, message: '인증 메일 발송 중 오류가 발생했습니다.' });
  }
});

/**
 * 5. [비밀번호 최종 확정 및 변경 API]
 * 사용자가 메일 링크를 눌러 들어왔을 때 양쪽 주머니(Auth, profiles)를 모두 업데이트합니다.
 */
router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ success: false, message: '필수 데이터가 누락되었습니다.' });
    }

    // A. Supabase Auth 관리자 권한으로 유저 메일 조회 후 패스워드 강제 변경
    const { data: userList, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) throw listError;

    const targetUser = userList.users.find(u => u.email === email);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: '인증 계정을 찾을 수 없습니다.' });
    }

    const { error: authUpdateError } = await supabase.auth.admin.updateUserById(
      targetUser.id,
      { password: newPassword }
    );
    if (authUpdateError) throw authUpdateError;

    // B. 우리 서비스용 profiles 테이블 패스워드도 bcrypt 암호화하여 갱신 동기화
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const { error: dbUpdateError } = await supabase
      .from('profiles')
      .update({ password: hashedPassword })
      .eq('email', email);

    if (dbUpdateError) throw dbUpdateError;

    res.json({ success: true, message: '비밀번호가 완전히 재설정되었습니다.' });
  } catch (err: any) {
    console.error('비밀번호 변경 오류:', err);
    res.status(500).json({ success: false, message: '비밀번호 재설정 처리 중 오류가 발생했습니다.' });
  }
});

export default router;