// 관리자 권한 체크 라우트 - 엄태훈
import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getCurrentUser } from "@/lib/login";

interface AdminRouteProps {
  children: ReactNode;
}

export const AdminRoute = ({ children }: AdminRouteProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const location = useLocation();
  const user = getCurrentUser();

  useEffect(() => {
    // 유저 정보와 롤(role)을 엄격하게 체크
    if (user && user.role === "ADMIN") {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
    setIsLoading(false);
  }, [user]);

  // 1. 유저 정보를 확인하는 동안 잠깐 대기 (하얀 화면 방지)
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">권한 확인 중...</div>;
  }

  // 2. 로그인이 안 되어 있거나 role이 ADMIN이 아니면 홈으로 리다이렉트
  if (!isAdmin) {
    // 💡 alert은 렌더링 도중 호출되면 무한 루프에 빠질 수 있으므로 콘솔이나 토스트 권장
    console.warn("관리자 권한이 없는 접근입니다.");
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // 3. 관리자라면 정상적으로 대시보드 렌더링
  return <>{children}</>;
};