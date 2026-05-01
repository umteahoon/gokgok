import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { User, Camera, LogOut, Key, UserX, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

// 💡 백엔드 서버의 실제 주소입니다.
const API_BASE_URL = "https://gokgok-8ztf.onrender.com";

export default function MyPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  
  const [dbFavorites, setDbFavorites] = useState<any[]>([]); 
  const [reviewCount, setReviewCount] = useState(0);         
  const [isLoading, setIsLoading] = useState(true);          

  useEffect(() => {
    const loadUserData = async () => {
      const user = getCurrentUser();
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      setCurrentUser(user);

      try {
        // 1. 찜 목록 불러오기 (Render 백엔드 전체 주소 사용)
        const favRes = await fetch(`${API_BASE_URL}/api/interactions/favorites/${user.email}`);
        const favData = await favRes.json();
        
        if (favData.success) {
          // 서버 응답 구조가 { success: true, data: [...] } 인 경우에 맞춤
          setDbFavorites(favData.data || []); 
        }

        // 2. 리뷰 목록 불러오기 (Render 백엔드 전체 주소 사용)
        const revRes = await fetch(`${API_BASE_URL}/api/reviews/user/${user.email}`);
        const revData = await revRes.json();
        
        if (revData.success) {
          setReviewCount(revData.data.length || 0);
        }
      } catch (err) {
        console.error("데이터 로딩 실패:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && currentUser) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const updatedUser = await updateProfilePhoto(base64String);
        if (updatedUser) {
          setCurrentUser({ ...updatedUser }); 
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    if (confirm("로그아웃 하시겠습니까?")) {
      logout();
      setCurrentUser(null);
      navigate("/");
    }
  };

  const handleChangePassword = async () => {
    const currentPw = prompt("현재 비밀번호를 입력하세요.");
    if (!currentPw) return;
    const newPw = prompt("새 비밀번호를 입력하세요. (6자 이상)");
    if (!newPw) return;
    const result = await changePassword(currentUser?.email || "", currentPw, newPw);
    alert(result.message);
  };

  const handleDeleteAccount = async () => {
    if (confirm("정말로 탈퇴하시겠습니까? 데이터는 복구할 수 없습니다.")) {
      const result = await deleteAccount(currentUser?.email || "");
      if (result.success) {
        alert(result.message);
        setCurrentUser(null);
        navigate("/");
      } else {
        alert(result.message);
      }
    }
  };

  // 찜한 축제 필터링 (DB의 festival_id와 mock 데이터의 id 매칭)
  const savedFestivals = mockFestivals.filter(f => 
    dbFavorites.some(fav => String(fav.festival_id) === String(f.id))
  );

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
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => navigate("/notmypage")}>
                <LogIn className="w-4 h-4 mr-2" /> 로그인 / 회원가입 하기
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
        <motion.div className="container mx-auto px-4" initial="hidden" animate="visible" variants={fadeInUp}>
          <div className="flex flex-col md:flex-row items-center gap-8 mb-10">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <Avatar className="w-32 h-32 border-4 border-white shadow-xl overflow-hidden">
                <AvatarImage src={currentUser.profilePhoto} className="object-cover w-full h-full" />
                <AvatarFallback className="bg-primary text-white text-4xl">{currentUser.name.charAt(0)}</AvatarFallback>
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-8 h-8 text-white" />
                </div>
              </Avatar>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoChange} />
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-4xl font-bold mb-2">{currentUser.name}님</h1>
              <p className="text-muted-foreground text-lg">{currentUser.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">찜한 축제</CardTitle></CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-primary">{isLoading ? '...' : savedFestivals.length}</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">작성한 리뷰</CardTitle></CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-primary">{isLoading ? '...' : reviewCount}</p>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <Tabs defaultValue="saved" className="w-full">
          <TabsList className="flex w-full max-w-md border-b bg-transparent h-auto p-0 mb-10 gap-8">
            <TabsTrigger value="saved" className="px-2 py-3 border-b-2 border-transparent data-[state=active]:border-primary rounded-none shadow-none">찜한 축제</TabsTrigger>
            <TabsTrigger value="settings" className="px-2 py-3 border-b-2 border-transparent data-[state=active]:border-primary rounded-none shadow-none">설정</TabsTrigger>
          </TabsList>

          <TabsContent value="saved">
            {isLoading ? (
              <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed">
                <p className="text-gray-500">정보 불러오는 중...</p>
              </div>
            ) : (
              savedFestivals.length > 0 ? (
                <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {savedFestivals.map((festival) => (
                    <motion.div key={festival.id} variants={staggerItem}>
                      <FestivalCard festival={festival} />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed">
                  <p className="text-gray-500">찜한 축제가 없습니다.</p>
                </div>
              )
            )}
          </TabsContent>

          <TabsContent value="settings">
            <div className="max-w-2xl space-y-6">
              <Card>
                <CardHeader><CardTitle>프로필 정보</CardTitle></CardHeader>
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
                <CardHeader><CardTitle className="text-red-600">계정 관리</CardTitle></CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <Button variant="outline" className="justify-start" onClick={handleChangePassword}><Key className="w-4 h-4 mr-2" /> 비밀번호 변경</Button>
                  <Button variant="outline" className="justify-start text-orange-600" onClick={handleLogout}><LogOut className="w-4 h-4 mr-2" /> 로그아웃</Button>
                  <Button variant="outline" className="justify-start text-red-600" onClick={handleDeleteAccount}><UserX className="w-4 h-4 mr-2" /> 회원 탈퇴</Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}