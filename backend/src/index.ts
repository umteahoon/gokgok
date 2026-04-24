import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { createClient } from '@supabase/supabase-js';
import authRouter from './routes/auth'; // auth 라우터
import communityRouter from './routes/community'; // 커뮤니티 라우터 - 주환
import reviewRouter from './routes/reviews ';           // 리뷰 라우터 추가
import favoritesRouter from "./routes/favorites"; // 즐겨찾기 라우터 추가
import adminRouter from './routes/admin';// 1. [추가] 관리자 라우터 임포트

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
 * 로컬 8080 포트와 Netlify 배포 주소를 모두 허용합니다.
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
 * [추가] 외부 라우터 연결
 * 분리된 파일들의 기능을 특정 경로에 할당합니다.
 */
app.use('/api/interactions', favoritesRouter); // 찜하기 관련 경로는 /api/interactions 로 시작
app.use('/api/reviews', reviewRouter);         // 리뷰 관련 경로는 /api/reviews 로 시작
app.use('/api/admin', adminRouter);            // 관리자 관련 경로는 /api/admin 으로 시작
app.use('/api/community', communityRouter);    // 커뮤니티 관련 경로는 /api/community 로 시작 - 주환

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
          role: email === 'am2869@naver.com' ? 'ADMIN' : 'USER' 
        }
      ]);

    if (error) {
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

    // [보안 강화] 환경 변수 키를 우선적으로 사용합니다.
    const secretKey = process.env.JWT_SECRET;
    if (!secretKey) {
        console.error("JWT_SECRET 환경변수가 없습니다.");
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      secretKey!, 
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

    // [중요 수정] 프론트엔드 undefined 방지를 위해 success: true를 확실히 포함합니다.
    res.status(200).json({ 
      success: true, 
      message: '회원 탈퇴가 정상적으로 처리되었습니다.' 
    }); 
  } catch (err: any) {
    console.error('Delete Error:', err.message);
    res.status(500).json({ 
      success: false, 
      message: '탈퇴 처리 중 오류가 발생했습니다.' 
    });
  }
});

// 기본 루트 경로
app.get('/', (req, res) => {
  res.send('곡곡 백엔드 서버 작동 중! 🚀');
});

// 서버 실행
app.listen(Number(PORT),  () => {
  console.log(`🚀 서버가 포트 ${PORT}에서 실행 중입니다!`);
});

/**
 * [게시판] 모든 게시글 가져오기
 * @path GET /api/auth/posts
 */
app.get('/api/auth/posts', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('community_posts')
      .select('*')
      .order('created_at', { ascending: false }); // 최신글이 위로 오게

    if (error) throw error;
    res.json({ success: true, posts: data });
  } catch (err: any) {
    res.status(500).json({ success: false, message: '게시글을 불러오지 못했습니다.' });
  }
});

/**
 * [게시판] 새로운 게시글 작성
 * @path POST /api/auth/posts
 */
app.post('/api/auth/posts', async (req: Request, res: Response) => {
  try {
    const { author, title, content, category, images } = req.body;

    const { data, error } = await supabase
      .from('community_posts')
      .insert([{ author, title, content, category, images }]);

    if (error) throw error;
    res.status(201).json({ success: true, message: '게시글이 등록되었습니다.' });
  } catch (err: any) {
    res.status(400).json({ success: false, message: '글 등록에 실패했습니다.' });
  }
});