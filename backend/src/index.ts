/**
 * 곡곡 백엔드 메인 서버 - 엄태훈 최종 통합본 (비밀번호 이메일 인증 패치 버전)
 * 수정일: 2026-05-22
 */

import dotenv from 'dotenv'; 
dotenv.config();

import express, { Request, Response } from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { createClient } from '@supabase/supabase-js';

// 라우터 임포트
import favoritesRouter from "./routes/favorites"; 
import reviewRouter from './routes/reviews '; 
import adminRouter from './routes/admin';
import communityRouter from './routes/community'; 
import contactRouter from './routes/contact'; 
import festivalRouter from './routes/festivals';

const app = express();
const PORT = process.env.PORT || 5000;

const secretKey = process.env.JWT_SECRET || 'gokgok-secret-key';

// 🎯 Supabase 공식 Auth 관리를 위해 SERVICE_ROLE_KEY를 사용하는 클라이언트 인스턴스
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

app.use(cors({
  origin: [
    'https://capstone-gokgok.netlify.app', 
    'http://localhost:5173', 
    'http://localhost:3000',
    'http://localhost:8080'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

/**
 * 관리자 인증 미들웨어
 */
const verifyAdminInternal = (req: Request, res: Response, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: "인증 토큰 없음" });

  try {
    const decoded: any = jwt.verify(token, secretKey!);
    if (decoded.role !== 'ADMIN') return res.status(403).json({ message: "권한 부족" });
    next();
  } catch (err) {
    res.status(401).json({ message: "유효하지 않은 토큰" });
  }
};

// --- [API 경로 매핑 - 순서 중요!] ---
app.use('/api/contact', contactRouter); 
app.use('/api/festivals', festivalRouter);
app.use('/api/interactions', favoritesRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/community', communityRouter);
app.use('/api/admin', adminRouter); 

// --- [인증 및 계정 관리 API] ---

/**
 * 1. 회원가입 (Supabase Auth 통합 가동 구조)
 */
app.post('/api/auth/signup', async (req: Request, res: Response) => {
  try {
    const { id, email, password, name } = req.body;

    // A. Supabase 공식 Auth 시스템에 계정 동시 생성 (이메일 인증 링크 전송의 핵심 기반)
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password, 
      email_confirm: true // 시연 편의성을 위해 이메일 소유권 확인 자동 통과 플래그 설정
    });

    if (authError) throw authError;

    // B. 기존 로그인 생태계 유지를 위한 bcrypt 암호화
    const hashedPassword = await bcrypt.hash(password, 10);

    const adminEmails = ['am2869@naver.com', 'phj03@naver.com', 'juhwan@test.com', 'qwer@1234.com'];
    const isAdmin = adminEmails.includes(email);  

    // C. 커스텀 profiles 테이블 데이터 적재
    const { error: dbError } = await supabase
      .from('profiles')
      .insert([{ id, email, password: hashedPassword, name, role: isAdmin ? 'ADMIN' : 'USER' }]);

    if (dbError) throw dbError;
    res.status(201).json({ success: true, message: '회원가입 완료' });
  } catch (err: any) {
    console.error('회원가입 오류:', err);
    res.status(400).json({ success: false, message: '이미 존재하는 아이디이거나 중복된 이메일입니다.' });
  }
});

/**
 * 2. 로그인
 */
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { id, password } = req.body;
    const { data: user, error } = await supabase.from('profiles').select('*').eq('id', id).single();

    if (error || !user) return res.status(400).json({ success: false, message: '등록되지 않은 아이디입니다.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: '비밀번호가 일치하지 않습니다.' });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, secretKey!, { expiresIn: '1h' });
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
 * 3. 아이디 찾기
 */
app.post('/api/auth/find-id', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const { data, error } = await supabase.from('profiles').select('id').eq('email', email).maybeSingle();

    if (error || !data) return res.status(404).json({ success: false, message: '해당 이메일로 가입된 아이디가 없습니다.' });
    res.json({ success: true, userId: data.id });
  } catch (err) {
    res.status(500).json({ success: false, message: '서버 오류' });
  }
});

/**
 * 4. 🚩 [새로 추가] Supabase 인증 메일 링크 발송 API
 * 주소 통로 명시: POST /api/auth/send-reset-link
 */
app.post('/api/auth/send-reset-link', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: '이메일을 입력해주세요.' });
    }

    // 🎯 Supabase 공식 가이드라인 메일 전송 모듈 활성화
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'http://localhost:8080/#/reset-password', 
    });

    if (error) throw error;

    return res.json({ success: true, message: '비밀번호 재설정 이메일이 발송되었습니다.' });
  } catch (err: any) {
    console.error('메일 발송 오류 로그:', err);
    return res.status(500).json({ success: false, message: '인증 메일 발송 중 서버 오류가 발생했습니다.' });
  }
});

/**
 * 5. 비밀번호 재설정 & 완전 동기화 (기존 코드 확장 고도화)
 * 메일 링크를 타고 진입하여 변경 시 Auth 시스템과 profiles 테이블을 연달아 갱신합니다.
 */
app.post('/api/auth/reset-password', async (req: Request, res: Response) => {
  try {
    const { id, email, currentPassword, newPassword, isFromEmailLink } = req.body;

    // A. 이메일 인증 링크를 타고 들어온 특수 케이스 예외 처리
    if (isFromEmailLink || !currentPassword) {
      if (!email || !newPassword) return res.status(400).json({ success: false, message: '데이터 누락' });

      // Supabase Auth 계정 정보 동기화 강제 수정
      const { data: userList } = await supabase.auth.admin.listUsers();
      const targetUser = userList?.users.find(u => u.email === email);
      
      if (targetUser) {
        await supabase.auth.admin.updateUserById(targetUser.id, { password: newPassword });
      }

      // 우리 profiles 서비스 테이블 동기화
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await supabase.from('profiles').update({ password: hashedPassword }).eq('email', email);

      return res.json({ success: true, message: '이메일 인증 비밀번호 재설정 완료' });
    }

    // B. 마이페이지 등에서 현재 패스워드를 대조하고 직접 변경하는 기존 로직 유지 스코프
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id, password')
      .eq('id', id)
      .eq('email', email)
      .maybeSingle();

    if (userError || !user) {
      return res.status(404).json({ success: false, message: '사용자 정보를 찾을 수 없습니다.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: '현재 비밀번호가 일치하지 않습니다.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const { error: updateError } = await supabase.from('profiles').update({ password: hashedPassword }).eq('id', id);

    if (updateError) throw updateError;

    res.json({ success: true, message: '비밀번호가 성공적으로 변경되었습니다.' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

/**
 * 6. 회원 탈퇴
 */
app.delete('/api/auth/delete', async (req: Request, res: Response) => {
  try {
    const { id } = req.body;
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true, message: '회원 탈퇴가 완료되었습니다.' });
  } catch (err) {
    res.status(500).json({ success: false, message: '탈퇴 처리 중 오류 발생' });
  }
});

/**
 * 7. 토큰 연장
 */
app.post('/api/auth/refresh', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false });

    const decoded: any = jwt.verify(token, secretKey!);
    const newToken = jwt.sign({ id: decoded.id, email: decoded.email, role: decoded.role }, secretKey!, { expiresIn: '1h' });

    res.json({ success: true, token: newToken });
  } catch (err) {
    res.status(401).json({ success: false, message: "인증 만료" });
  }
});

// --- [관리자 보안 기능] ---
app.post('/api/admin/report-threat', async (req: Request, res: Response) => {
  try {
    const { email, violationType, count } = req.body;
    await supabase.from('security_logs').insert([{ user_email: email || 'Anonymous', violation_type: violationType, request_count: count }]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Log Error" });
  }
});

app.get('/api/admin/security-logs', verifyAdminInternal, async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from('security_logs').select('*').order('created_at', { ascending: false }).limit(20);
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "로그 조회 실패" });
  }
});

app.get('/', (req, res) => res.send('곡곡(GokGok) 서버 가동 중! 🚀'));

app.listen(Number(PORT), () => {
  console.log(`🚀 [Server] Port ${PORT} 에서 곡곡 엔진 가동 시작!`);
});