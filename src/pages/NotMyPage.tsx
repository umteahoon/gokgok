import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

import { fadeInUp } from "@/lib/motion";
import { getCurrentUser, type User as AuthUser } from "@/lib/login";
import { AuthDialog } from "@/components/Login";

export default function NotMyPage() {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  
  // [수정 포인트 1] 시작하자마자 팝업을 띄우기 위해 초기값을 true로 설정
  const [authDialogOpen, setAuthDialogOpen] = useState(true);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    
    // 만약 이미 로그인된 상태라면 굳이 이 페이지에 있을 필요가 없으므로 마이페이지로 이동
    if (user) {
      navigate("/mypage");
    }
  }, [navigate]);

  const handleAuthSuccess = () => {
    setCurrentUser(getCurrentUser());
    setAuthDialogOpen(false);
    // 로그인 성공하면 바로 마이페이지로 보냄
    navigate("/mypage"); 
  };

  const handleClose = () => {
    setAuthDialogOpen(false);
    // 팝업을 닫으면 메인이나 이전 페이지로 돌아가게 설정 (선택사항)
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 배경은 "로그인이 필요합니다" 카드를 그대로 보여주거나 빈 화면으로 둘 수 있습니다. */}
      <motion.div
        className="container mx-auto px-4 py-48"
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        <Card className="max-w-md mx-auto text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <User className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">로그인이 필요합니다</CardTitle>
            <CardDescription className="text-base">
              곡곡의 모든 기능을 이용하려면 로그인해주세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              size="lg"
              className="w-full"
              onClick={() => setAuthDialogOpen(true)}
            >
              <LogIn className="w-5 h-5 mr-2" />
              로그인하기
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* [수정 포인트 2] 페이지 접속 시 authDialogOpen이 true이므로 바로 렌더링됨 */}
      <AuthDialog
        isOpen={authDialogOpen}
        onClose={handleClose}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}