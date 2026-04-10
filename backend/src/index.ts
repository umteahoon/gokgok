import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { createClient } from '@supabase/supabase-js';

// .env 환경변수 로드
dotenv.config();

const app = express();

// 포트 설정
const PORT = process.env.PORT || 5000;

// Supabase 연결
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * [중요] CORS 설정
 */
app.use(cors({
  origin: [
    'https://capstone-gokgok.netlify.app', 
    'http://localhost:5173', 
    'http://localhost:3000',
    'http://localhost:8080' // 태훈님이 사용중인 포트
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// --- API 경로 설정 ---
// 프론트엔드의 /api/auth/signup 경로와 일치시켰습니다.

// 1. 회원가입 API
app.post('/api/auth/signup', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const { error } = await supabase
      .from('profiles')
      .insert([
        { 
          email, 
          password: hashedPassword, 
          name, 
          role: email === 'am2869@naver.com' ? 'ADMIN' : 'USER' 
        }
      ]);

    if (error) throw error;
    res.status(201).json({ success: true, message: '회원가입이 완료되었습니다.' });
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// 2. 로그인 API
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const { data: user, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(400).json({ success: false, message: '등록되지 않은 이메일입니다.' });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({ success: false, message: '비밀번호가 일치하지 않습니다.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '30m' }
    );

    res.json({ 
      success: true, 
      token, 
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      } 
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: '서버 오류 발생' });
  }
});

// 기본 루트 경로
app.get('/', (req, res) => {
  res.send('곡곡 서버 실행 중! 🚀');
});

app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`🚀 서버가 포트 ${PORT}에서 실행 중입니다!`);
});
// 이곳은 내가 접수한다 내이름은 이주환