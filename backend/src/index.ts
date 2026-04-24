// index.ts 전체 코드 - 엄태훈
import dotenv from 'dotenv'; 
dotenv.config(); // 최상단에서 환경변수 로드

import express, { Request, Response } from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { createClient } from '@supabase/supabase-js';
import favoritesRouter from "./routes/favorites"; 
import reviewRouter from './routes/reviews ';           
import adminRouter from './routes/admin';
import communityRouter from './routes/community'; 

const app = express();
const PORT = process.env.PORT || 5000;

// [보안] 환경변수 체크
const secretKey = process.env.JWT_SECRET;
if (!secretKey) {
  console.error("❌ Critical Error: JWT_SECRET 환경변수가 설정되지 않았습니다!");
}

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

// API 경로 설정
app.use('/api/interactions', favoritesRouter); 
app.use('/api/reviews', reviewRouter);         
app.use('/api/admin', adminRouter);            
app.use('/api/community', communityRouter);    

/**
 * 1. 회원가입 API
 * am2869@naver.com 또는 qwe@qwe.com 이면 ADMIN 권한 부여
 */
app.post('/api/auth/signup', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    // 관리자 여부 확인 로직 (이메일 추가 시 여기에 || 로 연결)
    const isAdmin = email === 'am2869@naver.com' || email === 'qwe@qwe.com'|| email === 'qwe@juhwan@test.com';

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

    const { data: user, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) return res.status(400).json({ success: false, message: '유저 없음' });

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) return res.status(400).json({ success: false, message: '비번 틀림' });

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
    res.status(500).json({ success: false, message: '서버 오류' });
  }
});

app.get('/', (req, res) => res.send('곡곡 서버 작동 중! 🚀'));

app.listen(Number(PORT), () => {
  console.log(`🚀 서버가 포트 ${PORT}에서 실행 중입니다!`);
});