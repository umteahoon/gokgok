// routes/admin.ts - 엄태훈
import express, { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 관리자 인증 미들웨어
const verifyAdmin = (req: Request, res: Response, next: any) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: "인증 토큰이 없습니다." });
  }

  try {
    // [보안 강화] 환경변수를 직접 가져오고, 없으면 서버 오류 반환
    const secret = process.env.JWT_SECRET;
    
    if (!secret) {
      return res.status(500).json({ message: "서버 내부 설정 오류" });
    }

    // 토큰 검증 - index.ts와 동일한 secret 사용
    const decoded: any = jwt.verify(token, secret);
    
    if (decoded.role !== 'ADMIN') {
      return res.status(403).json({ message: "관리자 권한이 없습니다." });
    }
    
    next();
  } catch (err: any) {
    console.error("JWT 검증 실패:", err.message);
    res.status(401).json({ message: "유효하지 않은 토큰입니다. 다시 로그인해주세요." });
  }
};

/**
 * 통계 조회
 */
router.get('/stats', verifyAdmin, async (req: Request, res: Response) => {
  try {
    const [usersCount, postsCount] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('community_posts').select('*', { count: 'exact', head: true }),
    ]);

    res.json({
      totalUsers: usersCount.count || 0,
      totalPosts: postsCount.count || 0,
      activeFestivals: 0 
    });
  } catch (error: any) {
    res.status(500).json({ message: "데이터 로드 실패" });
  }
});

/**
 * 유저 목록 조회
 */
router.get('/users', verifyAdmin, async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, name, role, created_at') 
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    const formattedData = (data || []).map(u => ({
      ...u,
      username: u.name 
    }));

    res.json(formattedData);
  } catch (error: any) {
    res.status(500).json({ message: "목록 로드 실패" });
  }
});

/**
 * 유저 삭제
 */
router.delete('/users/:id', verifyAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true, message: "삭제 완료" });
  } catch (error: any) {
    res.status(500).json({ message: "삭제 실패" });
  }
});

export default router;