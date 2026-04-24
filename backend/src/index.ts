/**
 * 곡곡 백엔드 메인 서버 - 엄태훈 최종 수정본
 * 주요 기능: 회원가입(권한 분기), 로그인(JWT 발급), 라우터 통합 관리
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

// [보안] 필수 환경변수 체크 (서버 시작 시 즉시 확인 가능)
const secretKey = process.env.JWT_SECRET;
if (!secretKey) {
  console.error("❌ Critical Error: JWT_SECRET 환경변수가 설정되지 않았습니다!");
}

// Supabase 클라이언트 초기화
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// CORS 설정: Netlify 배포 주소 및 로컬 환경 허용
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

// API 경로 매핑
app.use('/api/interactions', favoritesRouter); 
app.use('/api/reviews', reviewRouter);         
app.use('/api/admin', adminRouter);            
app.use('/api/community', communityRouter);    

/**
 * 1. 회원가입 API
 * 관리자 권한 이메일: am2869@naver.com, qwe@qwe.com, juhwan@test.com
 */
app.post('/api/auth/signup', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    
    // 비밀번호 해싱 (보안성 강화)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 관리자 여부 확인 로직
    const adminEmails = ['am2869@naver.com', 'qwe@qwe.com', 'juhwan@test.com', 'qwer@1234.com'];
    const isAdmin = adminEmails.includes(email);

    const { error } = await supabase
      .from('profiles')
      .insert([
        { 
          email, 
          password: hashedPassword, 
          name, 
          role: isAdmin ? 'ADMIN' : 'USER' 
        }
      ]);

    if (error) throw error;
    res.status(201).json({ success: true, message: '회원가입이 완료되었습니다.' });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

/**
 * 2. 로그인 API
 * 유저 인증 후 1시간 유효한 JWT 토큰 발급
 */
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // DB에서 유저 조회
    const { data: user, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) return res.status(400).json({ success: false, message: '등록되지 않은 이메일입니다.' });

    // 비밀번호 검증
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) return res.status(400).json({ success: false, message: '비밀번호가 일치하지 않습니다.' });

    // JWT 토큰 생성 (Payload에 id, email, role 포함)
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      secretKey!, 
      { expiresIn: '1h' } 
    );

    res.json({ 
      success: true, 
      token, 
      user: { id: user.id, name: user.name, email: user.email, role: user.role } 
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.' });
  }
});

// 서버 헬스체크용 루트 경로
app.get('/', (req, res) => res.send('곡곡(GokGok) 서버 가동 중! 🚀'));

// 서버 리스닝
app.listen(Number(PORT), () => {
  console.log(`🚀 [Server] Port ${PORT} 에서 곡곡 엔진 가동 시작!`);
});