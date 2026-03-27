import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Heart, Calendar, Settings, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockFestivals, getCategoryColor, getStatusBadge, type Festival } from "@/lib/index";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";
import { FestivalCard } from "@/components/FestivalCard";
import { getCurrentUser, logout, changePassword, deleteAccount, type User as AuthUser } from "@/lib/login";
import { AuthDialog } from "@/components/Login";

export default function MyPage() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [authDialogOpen] = useState(false); // AuthDialog 열기용 (필요시 사용)

  useEffect(() => {
    setCurrentUser(getCurrentUser());
  }, []);

  // [수정 포인트 1] 로그인이 안 되어 있을 때 보여줄 화면 (하얀 화면 방지)

if (!currentUser) {
  return (
    <div className="min-h-screen bg-background">
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
              onClick={() => window.location.href = '#/notmypage'}
            >
              <LogIn className="w-5 h-5 mr-2" />
              로그인하기
            </Button>
            <p className="text-sm text-muted-foreground">
              로그인하고 곡곡의 모든 기능을 이용해보세요
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}


  // 로그인이 된 경우의 핸들러들
  const handleLogout = () => {
    logout();
    setCurrentUser(null);
    window.location.href = '/'; // 로그아웃 후 메인으로 이동
  };

  const handleChangePassword = () => {
    const currentPw = prompt("현재 비밀번호를 입력하세요.");
    if (!currentPw) return;
    const newPw = prompt("새 비밀번호를 입력하세요. (6자 이상)");
    if (!newPw) return;

    const result = changePassword(currentUser.email, currentPw, newPw);
    alert(result.message);
  };

  const handleDeleteAccount = () => {
    const confirmPw = prompt("탈퇴를 확인하기 위해 비밀번호를 입력하세요.");
    if (!confirmPw) return;

    const result = deleteAccount(currentUser.email, confirmPw);
    if (result.success) {
      alert(result.message);
      setCurrentUser(null);
      window.location.href = '/';
    } else {
      alert(result.message);
    }
  };

  const savedFestivals = mockFestivals.slice(0, 4);
  const attendedFestivals = mockFestivals.slice(4, 7);

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-b from-primary/5 to-transparent py-12">
        <motion.div
          className="container mx-auto px-4"
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
        >
          <div className="flex items-center gap-6 mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center">
              <User className="w-12 h-12 text-white" />
            </div>
            <div>
              {/* [수정 포인트 2] 이제 currentUser가 확실히 있을 때만 렌더링됩니다. */}
              <h1 className="text-3xl font-bold mb-2">{currentUser.name}님</h1>
              <p className="text-muted-foreground">{currentUser.email}</p>
              <div className="flex gap-2 mt-3">
                <Badge variant="secondary">축제 마니아</Badge>
                <Badge variant="secondary">리뷰 작성자</Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">찜한 축제</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{savedFestivals.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">참여한 축제</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{attendedFestivals.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">작성한 리뷰</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">12</div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>

      <motion.div
        className="container mx-auto px-4 py-12"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <Tabs defaultValue="saved" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3 mb-8">
            <TabsTrigger value="saved" className="gap-2"><Heart className="w-4 h-4" />찜한 축제</TabsTrigger>
            <TabsTrigger value="attended" className="gap-2"><Calendar className="w-4 h-4" />참여 이력</TabsTrigger>
            <TabsTrigger value="settings" className="gap-2"><Settings className="w-4 h-4" />설정</TabsTrigger>
          </TabsList>

          <TabsContent value="saved">
            <motion.div variants={staggerItem}>
              <h2 className="text-2xl font-bold mb-6">찜한 축제</h2>
              {savedFestivals.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {savedFestivals.map((festival) => (
                    <FestivalCard key={festival.id} festival={festival} />
                  ))}
                </div>
              ) : (
                <Card className="text-center py-12">
                  <CardContent>
                    <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">아직 찜한 축제가 없습니다</p>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </TabsContent>

          {/* 나머지 TabsContent(attended, settings)는 태훈님  */}
          <TabsContent value="settings">
            <motion.div variants={staggerItem}>
              <h2 className="text-2xl font-bold mb-6">설정</h2>
              <div className="space-y-4 max-w-2xl">
                <Card>
                  <CardHeader>
                    <CardTitle>프로필 정보</CardTitle>
                    <CardDescription>회원 정보를 수정할 수 있습니다</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">이름</label>
                      <input type="text" defaultValue={currentUser.name} className="w-full px-4 py-2 border rounded-lg" />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">이메일</label>
                      <input type="email" defaultValue={currentUser.email} className="w-full px-4 py-2 border rounded-lg" disabled />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>계정 관리</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start" onClick={handleChangePassword}>비밀번호 변경</Button>
                    <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>로그아웃</Button>
                    <Button variant="destructive" className="w-full justify-start" onClick={handleDeleteAccount}>회원 탈퇴</Button>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}