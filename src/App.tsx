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
import CommunityWrite from "./pages/CommunityWrite"; // 주환
import NotMyPage from "@/pages/NotMyPage";
import MyPage from "./pages/MyPage"; // 최

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <MotionConfig reducedMotion="user">
        <Toaster />
        <Sonner />
        <HashRouter>
          <Layout>
            <Routes>
              <Route path={ROUTE_PATHS.HOME} element={<Home />} />
              <Route path={ROUTE_PATHS.SEARCH} element={<Search />} />
              <Route path={ROUTE_PATHS.COMMUNITY} element={<Community />} />
              <Route path={ROUTE_PATHS.COMMUNITY_WRITE} element={<CommunityWrite />} /> {/* 생성한 페이지 컴포넌트가 화면에 렌더링 될 수 있도록 라우터 경로 - 주환 */}
              <Route path={ROUTE_PATHS.NOTMYPAGE} element={<NotMyPage />} />
              <Route path={ROUTE_PATHS.MYPAGE} element={<MyPage />} />
            </Routes>
          </Layout>
        </HashRouter>
      </MotionConfig>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;