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

// [회원가입 API]
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { id, email, password, name } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const { error } = await supabase
      .from('profiles')
      .insert([
        { 
          id: id,       // 아이디
          email: email, // 이메일
          password: hashedPassword, 
          name: name,   // 이름
          role: email === 'am2869@naver.com' ? 'ADMIN' : 'USER' 
        }
      ]);

    if (error) throw error;

    res.status(201).json({ success: true, message: '회원가입 성공!' });
  } catch (err: any) {
    res.status(400).json({ success: false, message: '중복된 아이디나 이메일입니다.' });
  }
});

// [로그인 API]
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { id, password } = req.body;

    const { data: user, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !user) {
      return res.status(400).json({ success: false, message: '존재하지 않는 아이디입니다.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: '비밀번호가 틀렸습니다.' });
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
    res.status(500).json({ success: false, message: '서버 오류' });
  }
});

export default router;