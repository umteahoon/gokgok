import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { createClient } from '@supabase/supabase-js';

// .env 환경변수 로드
dotenv.config();

const app = express();

// 포트 설정 (Render 환경 대응)
const PORT = process.env.PORT || 5000;

// Supabase 연결
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * [중요] CORS 설정
 * 모든 테스트 환경과 배포 환경을 허용합니다.
 */
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

// --- API 경로 설정 ---

/**
 * 1. 회원가입 API
 * @path POST /api/auth/signup
 */
app.post('/api/auth/signup', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    
    // 비밀번호 암호화
    const hashedPassword = await bcrypt.hash(password, 10);

    const { error } = await supabase
      .from('profiles')
      .insert([
        { 
          email, 
          password: hashedPassword, 
          name, 
          // 특정 이메일은 관리자로 설정
          role: email === 'am2869@naver.com' ? 'ADMIN' : 'USER' 
        }
      ]);

    if (error) {
      // 중복 이메일 에러 처리 (Duplicate key error)
      if (error.code === '23505') {
        return res.status(400).json({ success: false, message: '이미 가입된 이메일입니다.' });
      }
      throw error;
    }

    res.status(201).json({ success: true, message: '회원가입이 완료되었습니다.' });
  } catch (err: any) {
    console.error('Signup Error:', err.message);
    res.status(400).json({ success: false, message: '회원가입 중 오류가 발생했습니다.' });
  }
});

/**
 * 2. 로그인 API
 * @path POST /api/auth/login
 */
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // 유저 정보 조회
    const { data: user, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(400).json({ success: false, message: '등록되지 않은 이메일입니다.' });
    }

    // 비밀번호 검증
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(400).json({ success: false, message: '비밀번호가 일치하지 않습니다.' });
    }

    // JWT 토큰 생성
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
    console.error('Login Error:', err.message);
    res.status(500).json({ success: false, message: '서버 오류 발생' });
  }
});

/**
 * 3. 회원 탈퇴 API
 * @path DELETE /api/auth/delete
 */
app.delete('/api/auth/delete', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: '이메일 정보가 필요합니다.' });
    }

    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('email', email);

    if (error) throw error;

    res.json({ success: true, message: '회원 탈퇴가 정상적으로 처리되었습니다.' }); 
  } catch (err: any) {
    console.error('Delete Error:', err.message);
    res.status(500).json({ success: false, message: '탈퇴 처리 중 오류가 발생했습니다.' });
  }
});

// 기본 루트 경로
app.get('/', (req, res) => {
  res.send('곡곡 백엔드 서버 작동 중! 🚀');
});

// 서버 실행
app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`🚀 서버가 포트 ${PORT}에서 실행 중입니다!`);
});