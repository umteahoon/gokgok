import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Camera, LogOut, Key, UserX, LogIn, Heart, MessageSquare, ChevronRight, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { mockFestivals } from "@/lib/index";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";
import { FestivalCard } from "@/components/FestivalCard";
import { 
  getCurrentUser, 
  logout, 
  resetPassword, 
  deleteAccount, 
  updateProfilePhoto, 
  type User as AuthUser 
} from "@/lib/login";

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
        const favRes = await fetch(`${API_BASE_URL}/api/interactions/favorites/${user.id}`);
        const favData = await favRes.json();
        if (favData.success) setDbFavorites(favData.data || []); 

        const revRes = await fetch(`${API_BASE_URL}/api/reviews/user/${user.id}`);
        const revData = await revRes.json();
        if (revData.success) setReviewCount(revData.data.length || 0);
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
        if (updatedUser) setCurrentUser({ ...updatedUser }); 
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

  /**
   * ✅ 강화된 비밀번호 변경 핸들러
   * 1. 현재 비밀번호 확인
   * 2. 새 비밀번호 2회 입력 및 일치 여부 확인
   */
  const handleChangePassword = async () => {
    if (!currentUser) return;

    const currentPw = prompt("현재 비밀번호를 입력해주세요.");
    if (!currentPw) return;

    const newPw = prompt("새로운 비밀번호를 입력해주세요. (6자 이상)");
    if (!newPw) return;

    if (newPw.length < 6) {
      alert("새 비밀번호는 최소 6자 이상이어야 합니다.");
      return;
    }

    const confirmNewPw = prompt("새로운 비밀번호를 한 번 더 입력해주세요.");
    if (!confirmNewPw) return;

    // 클라이언트 측 일치 확인
    if (newPw !== confirmNewPw) {
      alert("입력하신 새 비밀번호가 서로 일치하지 않습니다.");
      return;
    }

    try {
      // ✅ lib/login.ts의 resetPassword 함수에 currentPw 인자를 추가하여 호출
      // (이전에 수정해드린 resetPassword 인자 순서: id, email, currentPw, newPw)
      const result = await resetPassword(currentUser.id, currentUser.email, currentPw, newPw);
      
      alert(result.message);

      if (result.success) {
        alert("보안을 위해 다시 로그인해주세요.");
        handleLogout();
      }
    } catch (error) {
      alert("비밀번호 변경 중 통신 오류가 발생했습니다.");
    }
  };

  const handleDeleteAccount = async () => {
    if (confirm("정말로 탈퇴하시겠습니까? 데이터는 복구할 수 없습니다.")) {
      const result = await deleteAccount(currentUser?.id || "");
      if (result.success) {
        alert(result.message);
        setCurrentUser(null);
        navigate("/");
      } else {
        alert(result.message);
      }
    }
  };

  const savedFestivals = mockFestivals.filter(f => 
    dbFavorites.some(fav => String(fav.festival_id) === String(f.id))
  );

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#111111] flex items-center justify-center font-sans transition-colors">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center px-6">
          <div className="w-20 h-20 bg-gray-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-10 h-10 text-gray-300 dark:text-zinc-600" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-zinc-100 mb-2">로그인이 필요해요</h2>
          <p className="text-gray-500 dark:text-zinc-400 mb-8 font-medium">곡곡의 다양한 축제 정보를 찜해보세요!</p>
          <Button 
            className="w-full max-w-[280px] h-14 bg-[#FF3478] hover:bg-[#E62E6C] text-white font-bold rounded-2xl shadow-lg shadow-[#FF3478]/20" 
            onClick={() => navigate("/notmypage")}
          >
            로그인 / 회원가입
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#111111] font-sans text-gray-900 dark:text-zinc-100 transition-colors">
      <main className="max-w-[1000px] mx-auto pt-12 pb-24 px-5">
        
        <header className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-16">
          <div className="relative group">
            <Avatar className="w-32 h-32 md:w-40 md:h-40 border-[6px] border-gray-50 dark:border-zinc-800 shadow-sm transition-colors">
              <AvatarImage src={currentUser.profilePhoto} className="object-cover" />
              <AvatarFallback className="bg-[#FF3478]/10 text-[#FF3478] text-5xl font-black">{currentUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-1 right-1 w-10 h-10 bg-white dark:bg-zinc-700 border border-gray-100 dark:border-zinc-600 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all"
            >
              <Camera className="w-5 h-5 text-gray-600 dark:text-zinc-300" />
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoChange} />
          </div>

          <div className="flex-1 text-center md:text-left pt-4">
            <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
              <h1 className="text-3xl font-black tracking-tight">{currentUser.name}님</h1>
              <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[11px] font-bold rounded-lg uppercase tracking-wider">General Member</span>
            </div>
            <p className="text-gray-400 dark:text-zinc-500 font-medium text-lg mb-6">{currentUser.email}</p>
            
            <div className="flex justify-center md:justify-start gap-12 border-t border-gray-50 dark:border-zinc-800 pt-6 transition-colors">
              <div className="flex flex-col gap-1">
                <span className="text-[12px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">Saved</span>
                <span className="text-2xl font-black text-[#FF3478]">{isLoading ? '...' : savedFestivals.length}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[12px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">Reviews</span>
                <span className="text-2xl font-black text-gray-900 dark:text-zinc-100">{isLoading ? '...' : reviewCount}</span>
              </div>
            </div>
          </div>
        </header>

        <Tabs defaultValue="saved" className="w-full">
          <TabsList className="flex w-full border-b border-gray-100 dark:border-zinc-800 bg-transparent h-auto p-0 mb-10 gap-10 rounded-none transition-colors">
            <TabsTrigger 
              value="saved" 
              className="px-0 py-4 border-b-4 border-transparent data-[state=active]:border-[#FF3478] data-[state=active]:text-[#FF3478] rounded-none shadow-none bg-transparent data-[state=active]:bg-transparent dark:data-[state=active]:bg-transparent text-lg font-black text-gray-300 dark:text-zinc-600 transition-all"
            >
              찜한 축제
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="px-0 py-4 border-b-4 border-transparent data-[state=active]:border-[#FF3478] data-[state=active]:text-[#FF3478] rounded-none shadow-none bg-transparent data-[state=active]:bg-transparent dark:data-[state=active]:bg-transparent text-lg font-black text-gray-300 dark:text-zinc-600 transition-all"
            >
              계정 설정
            </TabsTrigger>
          </TabsList>

          <TabsContent value="saved" className="outline-none">
            {isLoading ? (
              <div className="py-20 text-center text-gray-400 dark:text-zinc-500 font-bold">정보를 불러오는 중입니다...</div>
            ) : savedFestivals.length > 0 ? (
              <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
                {savedFestivals.map((festival) => (
                  <motion.div key={festival.id} variants={staggerItem}>
                    <FestivalCard festival={festival} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="text-center py-24 bg-gray-50 dark:bg-zinc-900/50 rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-zinc-800 transition-colors">
                <Heart className="w-12 h-12 text-gray-200 dark:text-zinc-700 mx-auto mb-4" />
                <p className="text-gray-400 dark:text-zinc-500 font-bold">아직 찜한 축제가 없습니다.</p>
                <Button variant="link" onClick={() => navigate('/search')} className="text-[#FF3478] font-bold mt-2">축제 구경가기</Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings" className="outline-none">
            <div className="max-w-xl space-y-10">
              <section>
                <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                  <User size={20} className="text-[#FF3478]" /> 개인정보 관리
                </h3>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-[13px] font-bold text-gray-400 dark:text-zinc-500 ml-1">이름</Label>
                    <Input value={currentUser.name} disabled className="h-14 rounded-2xl bg-gray-50 dark:bg-zinc-900/50 border-none font-bold text-gray-900 dark:text-zinc-100 transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[13px] font-bold text-gray-400 dark:text-zinc-500 ml-1">이메일 계정</Label>
                    <Input value={currentUser.email} disabled className="h-14 rounded-2xl bg-gray-50 dark:bg-zinc-900/50 border-none font-bold text-gray-900 dark:text-zinc-100 transition-colors" />
                  </div>
                </div>
              </section>

              <section className="pt-10 border-t border-gray-100 dark:border-zinc-800 transition-colors">
                <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                  <Settings size={20} className="text-gray-400 dark:text-zinc-500" /> 계정 보안 및 관리
                </h3>
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={handleChangePassword}
                    className="w-full flex items-center justify-between p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 hover:border-[#FF3478]/30 hover:bg-[#FF3478]/5 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-[#FF3478]/10 transition-colors"><Key size={18} className="text-gray-400 group-hover:text-[#FF3478]" /></div>
                      <span className="font-bold text-gray-700 dark:text-zinc-300">비밀번호 변경</span>
                    </div>
                    <ChevronRight size={18} className="text-gray-300 dark:text-zinc-600" />
                  </button>

                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center justify-between p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 hover:border-orange-100 dark:hover:border-orange-900/30 hover:bg-orange-50/30 dark:hover:bg-orange-900/10 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-orange-100 dark:group-hover:bg-orange-900/40 transition-colors"><LogOut size={18} className="text-gray-400 group-hover:text-orange-600 dark:group-hover:text-orange-400" /></div>
                      <span className="font-bold text-gray-700 dark:text-zinc-300">로그아웃</span>
                    </div>
                    <ChevronRight size={18} className="text-gray-300 dark:text-zinc-600" />
                  </button>

                  <button 
                    onClick={handleDeleteAccount}
                    className="w-full flex items-center justify-between p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 hover:border-red-100 dark:hover:border-red-900/30 hover:bg-red-50/30 dark:hover:bg-red-900/10 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-red-100 dark:group-hover:bg-red-900/40 transition-colors"><UserX size={18} className="text-gray-400 group-hover:text-red-600 dark:group-hover:text-red-400" /></div>
                      <span className="font-bold text-red-500/70 dark:text-red-900/70 group-hover:text-red-600 dark:group-hover:text-red-400">회원 탈퇴</span>
                    </div>
                    <ChevronRight size={18} className="text-gray-300 dark:text-zinc-600" />
                  </button>
                </div>
              </section>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}