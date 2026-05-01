/**
 * 곡곡 백엔드 메인 서버 - 엄태훈 최종 수정본
 * 주요 기능: 회원가입, 로그인, 세션 연장, 보안 위협 로그 기록 및 관리자 통합 조회
 */

import dotenv from 'dotenv'; 
dotenv.config(); // 최상단에서 환경변수 로드

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

const app = express();
const PORT = process.env.PORT || 5000;

// [보안] 필수 환경변수 체크
const secretKey = process.env.JWT_SECRET;
if (!secretKey) {
  console.error("❌ Critical Error: JWT_SECRET 환경변수가 설정되지 않았습니다!");
}

// Supabase 클라이언트 초기화 (Service Role Key 사용으로 RLS 우회 기록 가능)
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// CORS 설정
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
 * 관리자 인증 미들웨어 (내부 API 보안용)
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

// API 경로 매핑
app.use('/api/interactions', favoritesRouter); 
app.use('/api/reviews', reviewRouter);         
app.use('/api/admin', adminRouter);            
app.use('/api/community', communityRouter);    

/**
 * 1. 회원가입 API
 */
app.post('/api/auth/signup', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const adminEmails = ['am2869@naver.com', 'qwe@qwe.com', 'juhwan@test.com', 'qwer@1234.com','phj03@naver.com'];
    const isAdmin = adminEmails.includes(email);

    const { error } = await supabase
      .from('profiles')
      .insert([{ email, password: hashedPassword, name, role: isAdmin ? 'ADMIN' : 'USER' }]);

    if (error) throw error;
    res.status(201).json({ success: true, message: '회원가입 완료' });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

/**
 * 2. 로그인 API
 */
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const { data: user, error } = await supabase.from('profiles').select('*').eq('email', email).single();

    if (error || !user) return res.status(400).json({ success: false, message: '등록되지 않은 유저' });

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) return res.status(400).json({ success: false, message: '비밀번호 불일치' });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, secretKey!, { expiresIn: '1h' });
    res.json({ success: true, token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: '서버 오류' });
  }
});

/**
 * 3. 토큰 연장 API (Refresh)
 */
app.post('/api/auth/refresh', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];
    if (!token) return res.status(401).json({ success: false });

    const decoded: any = jwt.verify(token, secretKey!);
    const newToken = jwt.sign({ id: decoded.id, email: decoded.email, role: decoded.role }, secretKey!, { expiresIn: '1h' });

    res.json({ success: true, token: newToken });
  } catch (err: any) {
    res.status(401).json({ success: false, message: "인증 만료" });
  }
});

/**
 * 4. 보안 위협 로그 기록 API
 * 클라이언트에서 이상 징후 감지 시 서버 DB에 실시간 기록
 */
app.post('/api/admin/report-threat', async (req: Request, res: Response) => {
  try {
    const { email, violationType, count } = req.body;

    const { error } = await supabase
      .from('security_logs')
      .insert([
        { 
          user_email: email || 'Anonymous', 
          violation_type: violationType, 
          request_count: count 
        }
      ]);

    if (error) throw error;
    res.json({ success: true, message: "Security log recorded" });
  } catch (err: any) {
    console.error("Log Error:", err.message);
    res.status(500).json({ message: "Failed to record log" });
  }
});

/**
 * 5. 보안 위협 로그 조회 API (관리자 전용)
 * DB에 저장된 모든 유저의 위협 로그를 최신순으로 반환
 */
app.get('/api/admin/security-logs', verifyAdminInternal, async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('security_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: "로그 조회 실패" });
  }
});

app.get('/', (req, res) => res.send('곡곡(GokGok) 서버 가동 중! 🚀'));

app.listen(Number(PORT), () => {
  console.log(`🚀 [Server] Port ${PORT} 에서 곡곡 엔진 가동 시작!`);
});