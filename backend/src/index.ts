import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { createClient } from '@supabase/supabase-js';

// .env 환경변수 로드
dotenv.config();

const app = express();

// Render는 환경 변수로 PORT를 제공합니다. 
// 기본값은 5000으로 설정하되, 포트 번호를 숫자로 변환합니다.
const PORT = process.env.PORT || 5000;

// Supabase 관리자 권한 연결
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * [중요] CORS 설정
 * Netlify에 배포된 프론트엔드 주소에서 오는 요청을 허용합니다.
 */
app.use(cors({
  origin: [
    'https://capstone-gokgok.netlify.app', // Netlify 주소
    'http://localhost:5173',               // 로컬 테스트용 (Vite)
    'http://localhost:3000'
  ],
  credentials: true, // 쿠키나 인증 헤더를 허용할 경우 필수
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// --- API 경로 설정 ---

// 1. 회원가입 API
app.post('/api/signup', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    // 비밀번호 암호화
    const hashedPassword = await bcrypt.hash(password, 10);

    // Supabase profiles 테이블에 데이터 삽입
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
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
    res.status(400).json({ success: false, message });
  }
});

// 2. 로그인 API (JWT 토큰 발행)
app.post('/api/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // DB에서 이메일로 유저 찾기
    const { data: user, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(400).json({ success: false, message: '등록되지 않은 이메일입니다.' });
    }

    // 암호화된 비밀번호 비교
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({ success: false, message: '비밀번호가 일치하지 않습니다.' });
    }

    // JWT 토큰 생성 (유효기간 30분)
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '30m' }
    );

    const userInfo = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      profile_photo: user.profile_photo
    };

    res.json({ success: true, token, user: userInfo });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '서버 오류가 발생했습니다.';
    res.status(500).json({ success: false, message });
  }
});

// [중요] Render 배포 시 '0.0.0.0' 주소 바인딩 필수
app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`--------------------------------------------------`);
  console.log(`🚀 GokGok Backend Server is running!`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`--------------------------------------------------`);
});