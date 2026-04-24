import express, { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// 1. Supabase 클라이언트 설정
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 2. 관리자 인증 미들웨어
const verifyAdmin = (req: Request, res: Response, next: any) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) return res.status(401).json({ message: "인증 토큰이 없습니다." });

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    if (decoded.role !== 'ADMIN') {
      return res.status(403).json({ message: "관리자 권한이 없습니다." });
    }
    next();
  } catch (err) {
    res.status(401).json({ message: "유효하지 않은 토큰입니다." });
  }
};

/**
 * @route   GET /api/admin/stats
 */
router.get('/stats', verifyAdmin, async (req: Request, res: Response) => {
  try {
    // 💡 [중요] 테이블명이 맞는지 확인하세요! 
    // community_posts가 아니라 posts일 수도 있습니다.
    const [usersCount, postsCount] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('community_posts').select('*', { count: 'exact', head: true }),
    ]);

    res.json({
      totalUsers: usersCount.count || 0,
      totalPosts: postsCount.count || 0,
      activeFestivals: 0 // 축제 테이블이 아직 없다면 0으로 세팅
    });
  } catch (error: any) {
    console.error("Stats Error:", error.message);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/admin/users
 */
router.get('/users', verifyAdmin, async (req: Request, res: Response) => {
  try {
    // 💡 [수정] index.ts에서 'name'으로 저장했으므로 'username' 대신 'name'을 불러옵니다.
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, name, role, created_at') 
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // 프론트엔드 AdminDashboard가 'username'을 기대하므로 맵핑해서 전달
    const formattedData = data.map(u => ({
      ...u,
      username: u.name // name을 username으로 바꿔서 전달
    }));

    res.json(formattedData);
  } catch (error: any) {
    console.error("Users List Error:", error.message);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   DELETE /api/admin/users/:id
 */
router.delete('/users/:id', verifyAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true, message: "사용자가 삭제되었습니다." });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;