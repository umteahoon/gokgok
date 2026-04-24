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
  // 헤더에서 토큰 추출
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: "인증 토큰이 없습니다." });
  }

  try {
    // [보안 강화] Render의 환경변수를 명시적으로 가져옵니다. 기본값 'secret'을 제거했습니다.
    const secret = process.env.JWT_SECRET;
    
    if (!secret) {
      console.error("Critical: JWT_SECRET is not defined in environment variables.");
      return res.status(500).json({ message: "서버 설정 오류 (Secret Key 누락)" });
    }

    // 토큰 검증
    const decoded: any = jwt.verify(token, secret);
    
    // 권한 확인
    if (decoded.role !== 'ADMIN') {
      return res.status(403).json({ message: "관리자 권한이 없습니다." });
    }
    
    // 다음 로직으로 진행
    next();
  } catch (err: any) {
    console.error("JWT Verification Failed:", err.message);
    res.status(401).json({ message: "유효하지 않은 토큰입니다. 다시 로그인해주세요." });
  }
};

/**
 * @route   GET /api/admin/stats
 * @desc    대시보드 통계 정보 조회
 */
router.get('/stats', verifyAdmin, async (req: Request, res: Response) => {
  try {
    // 💡 테이블명이 profiles, community_posts 인지 Supabase에서 다시 확인하세요.
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
    console.error("Stats Error:", error.message);
    res.status(500).json({ message: "통계 데이터를 불러오는데 실패했습니다." });
  }
});

/**
 * @route   GET /api/admin/users
 * @desc    사용자 전체 목록 조회
 */
router.get('/users', verifyAdmin, async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, name, role, created_at') 
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // 프론트엔드 AdminDashboard의 인터페이스(username)에 맞춰 데이터 매핑
    const formattedData = (data || []).map(u => ({
      ...u,
      username: u.name // DB의 name 컬럼을 프론트의 username으로 전달
    }));

    res.json(formattedData);
  } catch (error: any) {
    console.error("Users List Error:", error.message);
    res.status(500).json({ message: "사용자 목록을 불러오는데 실패했습니다." });
  }
});

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    사용자 강제 삭제
 */
router.delete('/users/:id', verifyAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // [주의] 이 작업은 복구가 불가능하므로 신중해야 합니다.
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true, message: "사용자가 성공적으로 삭제되었습니다." });
  } catch (error: any) {
    console.error("User Delete Error:", error.message);
    res.status(500).json({ message: "사용자 삭제 중 오류가 발생했습니다." });
  }
});

export default router;