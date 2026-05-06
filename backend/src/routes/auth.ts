import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Supabase 연결 설정 (환경변수 사용)
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * [회원가입] POST /api/auth/signup
 */
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { id, email, password, name } = req.body;

    // 1. 비밀번호 암호화 (보안 필수!)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 2. Supabase DB에 사용자 정보 저장
    const { data, error } = await supabase
      .from('profiles')
      .insert([
        { 
          id,
          email, 
          password: hashedPassword, 
          name, 
          //  ADMIN, 아니면 USER 부여
          role: email === 'am2869@naver.com' ? 'ADMIN' : 'USER' 
        }
      ]);

    if (error) throw error;

    res.status(201).json({ 
      success: true, 
      message: '회원가입이 완료되었습니다.' 
    });
  } catch (err: any) {
    console.error('회원가입 에러:', err.message);
    res.status(400).json({ 
      success: false, 
      message: '회원가입에 실패했습니다. (이미 존재하는 이메일일 수 있습니다.)' 
    });
  }
});

/**
 * [로그인] POST /api/auth/login
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { id, password } = req.body;

    // 1. DB에서 해당 이메일 사용자 찾기
    const { data: user, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !user) {
      return res.status(400).json({ 
        success: false, 
        message: '등록되지 않은 이메일입니다.' 
      });
    }

    // 2. 비밀번호 비교
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false, 
        message: '비밀번호가 일치하지 않습니다.' 
      });
    }

    // 3. JWT 토큰 발행 (30분 유효)
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your_jwt_secret_key',
      { expiresIn: '30m' }
    );

    // 4. 성공 응답 (토큰과 유저 정보를 함께 보냄)
    res.json({ 
      success: true, 
      message: '로그인 성공!',
      token, 
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePhoto: user.profilePhoto
      } 
    });
  } catch (err: any) {
    console.error('로그인 에러:', err.message);
    res.status(500).json({ 
      success: false, 
      message: '서버 내부 오류가 발생했습니다.' 
    });
  }
});



export default router;