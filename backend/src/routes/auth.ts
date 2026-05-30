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
 * 🎯 UUID 타입 에러 완벽 해결 버전
 */
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { id, email, password, name } = req.body;

    // 데이터 유효성 검사
    if (!id || !email || !password) {
      return res.status(400).json({ success: false, message: '아이디, 이메일, 비밀번호는 필수 입력 사항입니다.' });
    }

    // 💡 아이디 중복 체크 (기존에는 id 컬럼에 저장했지만, 만약 다른 식별 컬럼이 없다면 이메일이나 생성 유무로 파악해야 할 수 있습니다.)
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', email)
      .maybeSingle();

    if (existingUser) {
      return res.status(409).json({ success: false, message: '이미 사용 중인 이메일입니다.' });
    }

    // A. Supabase Auth 계정 생성 (여기서 데이터베이스 표준 규격인 진짜 UUID가 발급됩니다)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true
    });

    if (authError) {
      return res.status(400).json({ success: false, message: authError.message });
    }

    // 🎯 중요: 생성된 계정의 진짜 고유 UUID를 획득합니다.
    const supabaseUuid = authData.user.id;

    // B. 비밀번호 암호화
    const hashedPassword = await bcrypt.hash(password, 10);

    // C. 커스텀 profiles 테이블 저장
    // 💡 해결핵: id 컬럼이 uuid 타입이므로, 일반 문자열(djaxogns) 대신 발급받은 supabaseUuid를 주입합니다.
    const { error: dbError } = await supabase
      .from('profiles')
      .insert([
        { 
          id: supabaseUuid, // 👈 uuid 타입 불일치 에러의 핵심 해결 지점!
          email: email, 
          password: hashedPassword, 
          name: name || '사용자', 
          role: email === 'am2869@naver.com' ? 'ADMIN' : 'USER' 
        }
      ]);

    if (dbError) {
      console.error('profiles 적재 실패:', dbError.message);
      throw dbError;
    }

    res.status(201).json({ success: true, message: '회원가입 성공!' });
  } catch (err: any) {
    console.error('회원가입 실패:', err);
    res.status(500).json({ success: false, message: '서버 내부 오류가 발생했습니다.' });
  }
});

/**
 * 2. [로그인 API]
 * 💡 팁: profiles의 id가 uuid로 바뀌었으므로, 사용자가 입력한 문자열 id 대신 email 등으로 비교해 찾아오는 것이 가장 안전합니다.
 * 만약 UI에서 id 입력창에 이메일을 입력하도록 유도하거나 백엔드 탐색 로직을 email 기준으로 매칭합니다.
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { id, password } = req.body; // 여기서 id는 사용자가 입력한 값 (이메일 포맷 권장)

    // profiles 테이블에서 email 매칭으로 유저 정보를 스캔합니다.
    const { data: user, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', id) // 👈 기존 .eq('id', id)에서 문자열 식별이 가능한 email 매칭으로 변경하여 안전성 확보
      .maybeSingle();

    if (error || !user) {
      return res.status(401).json({ success: false, message: '존재하지 않는 사용자 계정입니다.' });
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
      .select('email') // id가 uuid이므로 실질적 식별자인 email 확인으로 대체
      .eq('email', email)
      .maybeSingle();

    if (error || !data) {
      return res.status(404).json({ success: false, message: '해당 이메일로 가입된 계정이 없습니다.' });
    }
    res.json({ success: true, userId: data.email });
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