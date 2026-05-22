/**
 * 곡곡 메인 애플리케이션 컴포넌트
 * 작성자: 엄태훈 (2026-04-29)
 * 패치내역: 2026-05-22 아이디/비밀번호 찾기 & 메일 링크용 ResetPw Route 최종 등록 완료
 */

import { useEffect } from "react"; 
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import { ROUTE_PATHS } from "@/lib/index";
import { Layout } from "@/components/Layout";
import Home from "@/pages/Home";
import Search from "@/pages/Search";
import Community from "@/pages/Community";
import CommunityWrite from "@/pages/CommunityWrite"; 
import NotMyPage from "@/pages/NotMyPage";
import MyPage from "@/pages/MyPage"; 
import TermsOfService from "@/pages/TermsOfService";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import Contact from "./pages/Contact";
import FestivalDetail from "@/pages/FestivalDetail"; 
import { AdminRoute } from "@/components/auth/AdminRoute";
import AdminDashboard from "@/pages/admin/AdminDashboard"; 
import { useToast } from "@/hooks/use-toast"; 
import { Button } from "@/components/ui/button"; 
import FindId from "@/pages/FindId";
import FindPw from "@/pages/FindPw";
import ResetPw from "@/pages/ResetPw"; // 🚩 [새로 추가] 이메일 링크용 비밀번호 재설정 페이지

const queryClient = new QueryClient();

const App = () => {
  const { toast } = useToast();

  // --- 🔥 [세션 관리 로직] 토큰 만료 감시 및 연장 ---
  useEffect(() => {
    const sessionCheckTimer = setInterval(() => {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));
        
        const expTime = payload.exp * 1000; 
        const currentTime = Date.now();
        const timeLeft = expTime - currentTime;

        if (timeLeft > 0 && timeLeft < 300000) {
          showRefreshToast();
        }
      } catch (error) {
        console.error("세션 체크 중 오류:", error);
      }
    }, 60000); 

    // --- 🚨 [보안 모니터링] 비정상 새로고침 감지 및 서버 보고 로직 ---
    const checkAndReportThreat = async () => {
      const refreshCount = Number(sessionStorage.getItem("gokgok_refresh_count") || 0);
      const currentUser = JSON.parse(localStorage.getItem("gokgok_current_user") || "{}");
      
      if (refreshCount >= 10) {
        try {
          await fetch("https://gokgok-8ztf.onrender.com/api/admin/report-threat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: currentUser.email || "Anonymous User",
              violationType: "DDoS / Rapid Refresh Detected",
              count: refreshCount
            })
          });
          console.log(`🚨 위협 정보 서버 전송 완료 (현재 카운트: ${refreshCount})`);
        } catch (err) {
          console.error("보안 로그 전송 실패:", err);
        }
      }
    };

    checkAndReportThreat();

    return () => clearInterval(sessionCheckTimer);
  }, []);

  const showRefreshToast = () => {
    toast({
      title: "🔑 로그인 세션 만료 예정",
      description: "보안을 위해 5분 뒤 자동 로그아웃됩니다. 연장하시겠습니까?",
      action: (
        <Button 
          size="sm" 
          variant="default"
          onClick={handleTokenRefresh}
          className="bg-primary text-primary-foreground"
        >
          연장하기
        </Button>
      ),
      duration: 15000, 
    });
  };

  const handleTokenRefresh = async () => {
    const currentToken = localStorage.getItem("accessToken");
    
    try {
      const res = await fetch("https://gokgok-8ztf.onrender.com/api/auth/refresh", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${currentToken}`,
          "Content-Type": "application/json"
        }
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("accessToken", data.token);
        toast({ 
          title: "✅ 세션 연장 완료", 
          description: "로그인 시간이 1시간 더 연장되었습니다." 
        });
      } else {
        toast({ 
          variant: "destructive", 
          title: "연장 실패", 
          description: "세션이 이미 만료되었습니다. 다시 로그인해 주세요." 
        });
      }
    } catch (err) {
      console.error("연장 요청 에러:", err);
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <MotionConfig reducedMotion="user">
          <Toaster />
          <Sonner />
          <HashRouter 
            future={{ 
              v7_startTransition: true, 
              v7_relativeSplatPath: true 
            }}
          >
            <Layout>
              <Routes>
                <Route path={ROUTE_PATHS.HOME} element={<Home />} />
                <Route path={ROUTE_PATHS.SEARCH} element={<Search />} />
                <Route path="/festival/:id" element={<FestivalDetail />} />
                <Route path={ROUTE_PATHS.COMMUNITY} element={<Community />} />
                <Route path={ROUTE_PATHS.COMMUNITY_WRITE} element={<CommunityWrite />} /> 
                <Route path={ROUTE_PATHS.NOTMYPAGE} element={<NotMyPage />} />
                <Route path={ROUTE_PATHS.MYPAGE} element={<MyPage />} />
                <Route path={ROUTE_PATHS.TERMS} element={<TermsOfService />} />
                <Route path={ROUTE_PATHS.PRIVACY} element={<PrivacyPolicy />} />
                <Route path={ROUTE_PATHS.CONTACT} element={<Contact />} />
                
                {/* 🚩 아이디/비밀번호 찾기 및 재설정 웹 라우팅 경로 선언 구역 */}
                <Route path="/find-id" element={<FindId />} />
                <Route path="/find-pw" element={<FindPw />} />
                <Route path="/reset-password" element={<ResetPw />} /> {/* 👈 여기에 정밀 타격 추가 완료! */}
                
                {/* 관리자 전용 페이지 */}
                <Route 
                  path="/admin" 
                  element = {
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  } 
                />
              </Routes>
            </Layout>
          </HashRouter>
        </MotionConfig>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;