// routes/admin.ts - 엄태훈 최종 수정본 (게시글 관리 기능 포함)
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
    const secret = process.env.JWT_SECRET;
    
    if (!secret) {
      return res.status(500).json({ message: "서버 내부 설정 오류" });
    }

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
 * @route   GET /api/admin/stats
 * @desc    대시보드 통계 정보 조회
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
 * @route   GET /api/admin/users
 * @desc    유저 목록 조회
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
 * @route   DELETE /api/admin/users/:id
 * @desc    유저 강제 삭제
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

/**
 * @route   GET /api/admin/posts
 * @desc    전체 게시글 목록 조회 (관리자용)
 */
router.get('/posts', verifyAdmin, async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('community_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (error: any) {
    console.error("Posts List Error:", error.message);
    res.status(500).json({ message: "게시글 목록 로드 실패" });
  }
});

/**
 * @route   DELETE /api/admin/posts/:id
 * @desc    부적절한 게시글 강제 삭제
 */
router.delete('/posts/:id', verifyAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('community_posts')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true, message: "게시글이 삭제되었습니다." });
  } catch (error: any) {
    console.error("Post Delete Error:", error.message);
    res.status(500).json({ message: "게시글 삭제 실패" });
  }
});

export default router;