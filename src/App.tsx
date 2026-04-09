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
import CommunityWrite from "@/pages/CommunityWrite"; // @로 통일
import NotMyPage from "@/pages/NotMyPage";
import MyPage from "@/pages/MyPage"; // @로 통일
import TermsOfService from "@/pages/TermsOfService";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import FestivalDetail from "@/pages/FestivalDetail"; 

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
              
              {/* 만약 ROUTE_PATHS.FESTIVAL_DETAIL에서 에러가 나면 
                  직접 "/festivals/:id" 라고 써서 테스트해보세요 */}
              <Route path="/festivals/:id" element={<FestivalDetail />} />

              <Route path={ROUTE_PATHS.COMMUNITY} element={<Community />} />
              <Route path={ROUTE_PATHS.COMMUNITY_WRITE} element={<CommunityWrite />} /> 
              <Route path={ROUTE_PATHS.NOTMYPAGE} element={<NotMyPage />} />
              <Route path={ROUTE_PATHS.MYPAGE} element={<MyPage />} />
              <Route path={ROUTE_PATHS.TERMS} element={<TermsOfService />} />
              <Route path={ROUTE_PATHS.PRIVACY} element={<PrivacyPolicy />} />
            </Routes>
          </Layout>
        </HashRouter>
      </MotionConfig>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;