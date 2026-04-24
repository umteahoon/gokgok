// 엄태훈 관리자 페이지 만들기 
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { getCurrentUser } from "@/lib/login";

interface AdminRouteProps {
  children: ReactNode;
}

export const AdminRoute = ({ children }: AdminRouteProps) => {
  const user = getCurrentUser();

  // 1. 로그인이 안 되어 있거나 2. role이 ADMIN이 아니면 홈으로 튕겨내기
  if (!user || user.role !== "ADMIN") {
    alert("관리자 권한이 필요합니다.");
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};