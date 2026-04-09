import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { User, Heart, Calendar, Settings, LogIn, Camera, LogOut, Key, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";

import { mockFestivals } from "@/lib/index";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";
import { FestivalCard } from "@/components/FestivalCard";
import { 
  getCurrentUser, 
  logout, 
  changePassword, 
  deleteAccount, 
  updateProfilePhoto, 
  type User as AuthUser 
} from "@/lib/login";

export default function MyPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
  }, []);

  // 사진 업로드 핸들러
  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && currentUser) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const updatedUser = updateProfilePhoto(currentUser.email, base64String);
        if (updatedUser) {
          setCurrentUser({ ...updatedUser }); 
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // 로그아웃 핸들러
  const handleLogout = () => {
    if (confirm("로그아웃 하시겠습니까?")) {
      logout();
      setCurrentUser(null);
      navigate("/");
    }
  };

  // 비밀번호 변경 핸들러
  const handleChangePassword = () => {
    const currentPw = prompt("현재 비밀번호를 입력하세요.");
    if (!currentPw) return;
    const newPw = prompt("새 비밀번호를 입력하세요. (6자 이상)");
    if (!newPw) return;

    const result = changePassword(currentUser?.email || "", currentPw, newPw);
    alert(result.message);
  };

  // 회원 탈퇴 핸들러
  const handleDeleteAccount = () => {
    const confirmPw = prompt("탈퇴를 확인하기 위해 비밀번호를 입력하세요.");
    if (!confirmPw) return;

    const result = deleteAccount(currentUser?.email || "", confirmPw);
    if (result.success) {
      alert(result.message);
      setCurrentUser(null);
      navigate("/");
    } else {
      alert(result.message);
    }
  };

  const savedFestivals = mockFestivals.slice(0, 4);
  const attendedFestivals = mockFestivals.slice(4, 7);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
          <Card className="max-w-md w-full text-center p-6">
            <CardHeader>
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <User className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">로그인이 필요합니다</CardTitle>
              <CardDescription>곡곡의 마이페이지를 이용하려면 로그인해주세요.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => navigate("/notmypage")}>
                <LogIn className="w-4 h-4 mr-2" /> 로그인하러 가기
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-gradient-to-b from-primary/10 to-transparent py-16">
        <motion.div 
          className="container mx-auto px-4"
          initial="hidden" animate="visible" variants={fadeInUp}
        >
          <div className="flex flex-col md:flex-row items-center gap-8 mb-10">
            {/* 사진 업로드 영역 - 원형 전체 클릭 가능하도록 수정 */}
            <div 
              className="relative group cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
              title="사진 변경"
            >
              <Avatar className="w-32 h-32 border-4 border-white shadow-xl transition-transform duration-300 group-hover:scale-105 overflow-hidden">
                <AvatarImage src={currentUser.profilePhoto} className="object-cover w-full h-full" />
                <AvatarFallback className="bg-primary text-white text-4xl">
                  {currentUser.name.charAt(0)}
                </AvatarFallback>
                
                {/* 마우스 호버 시 어두운 오버레이와 카메라 아이콘 표시 */}
                <div className="absolute inset-0 bg-black/30 opacity-0 transition-opacity duration-300 flex">
                  <Camera className="w-8 h-8 text-white" />
                </div>
              </Avatar>

              {/* 오른쪽 하단 작은 카메라 아이콘 (안내용) */}
              <div className="absolute bottom-1 right-1 bg-white p-2 rounded-full shadow-lg border border-gray-200 group-hover:bg-primary transition-colors duration-300">
                <Camera className="w-4 h-4 text-gray-700 group-hover:text-white" />
              </div>

              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handlePhotoChange} 
              />
            </div>

            <div className="text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold">{currentUser.name}님</h1>
                <div className="flex gap-2">
                  <Badge variant="secondary" className="bg-primary/20 text-primary hover:bg-primary/20">축제 마니아</Badge>
                  <Badge variant="outline" className="bg-primary/20 text-primary hover:bg-primary/20">리뷰 작성자</Badge>
                </div>
              </div>
              <p className="text-muted-foreground text-lg">{currentUser.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">찜한 축제</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-primary">{savedFestivals.length}</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">참여 이력</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-primary">{attendedFestivals.length}</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">작성한 리뷰</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-primary">12</p>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <Tabs defaultValue="saved" className="w-full">
          <TabsList className="flex w-full max-w-md border-b bg-transparent h-auto p-0 mb-10 gap-8">
            <TabsTrigger value="saved" className="px-2 py-3 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none transition-all">
              <Heart className="w-4 h-4 mr-2" /> 찜한 축제
            </TabsTrigger>
            <TabsTrigger value="attended" className="px-2 py-3 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none transition-all">
              <Calendar className="w-4 h-4 mr-2" /> 참여 이력
            </TabsTrigger>
            <TabsTrigger value="settings" className="px-2 py-3 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none transition-all">
              <Settings className="w-4 h-4 mr-2" /> 설정
            </TabsTrigger>
          </TabsList>

          <TabsContent value="saved">
            <motion.div 
              variants={staggerContainer} initial="hidden" animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              {savedFestivals.map((festival) => (
                <motion.div key={festival.id} variants={staggerItem}>
                  <FestivalCard festival={festival} />
                </motion.div>
              ))}
            </motion.div>
          </TabsContent>

          <TabsContent value="attended">
             <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed">
                <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">참여한 축제 이력이 여기에 표시됩니다.</p>
             </div>
          </TabsContent>

          <TabsContent value="settings">
            <div className="max-w-2xl space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>프로필 정보</CardTitle>
                  <CardDescription>이름과 이메일을 확인하세요.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium">이름</label>
                    <input className="w-full p-2 border rounded-md bg-gray-50" value={currentUser.name} disabled />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium">이메일</label>
                    <input className="w-full p-2 border rounded-md bg-gray-50" value={currentUser.email} disabled />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-red-100">
                <CardHeader>
                  <CardTitle className="text-red-600">계정 관리</CardTitle>
                  <CardDescription>보안 및 계정 상태를 관리합니다.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <Button variant="outline" className="justify-start" onClick={handleChangePassword}>
                    <Key className="w-4 h-4 mr-2" /> 비밀번호 변경
                  </Button>
                  <Button variant="outline" className="justify-start text-orange-600 hover:text-orange-700 hover:bg-orange-50" onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" /> 로그아웃
                  </Button>
                  <Button variant="ghost" className="justify-start text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleDeleteAccount}>
                    <UserX className="w-4 h-4 mr-2" /> 회원 탈퇴
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}