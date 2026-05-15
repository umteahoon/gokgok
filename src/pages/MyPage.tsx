import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Camera, LogOut, Key, UserX, Heart, 
  ChevronRight, Settings, MessageSquare, FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { mockFestivals, topFestivals } from "@/lib/index";
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
  const [savedFestivals, setSavedFestivals] = useState<any[]>([]); 
  const [myPosts, setMyPosts] = useState<any[]>([]);
  const [reviewCount, setReviewCount] = useState(0);         
  const [isLoading, setIsLoading] = useState(true);          

  const allFestivals = [...topFestivals, ...mockFestivals];

  useEffect(() => {
    const loadUserData = async () => {
      const user = getCurrentUser();
      if (!user) {
        setIsLoading(false);
        return;
      }
      setCurrentUser(user);

      const loadWishlist = () => {
        const savedIds = JSON.parse(localStorage.getItem("gokgok_wishlist") || "[]");
        const filtered = allFestivals.filter(f => savedIds.includes(String(f.id)));
        setSavedFestivals(filtered);
      };

      try {
        const revRes = await fetch(`${API_BASE_URL}/api/reviews/user/${user.id}`);
        const revData = await revRes.json();
        if (revData.success) setReviewCount(revData.data.length || 0);

        const postRes = await fetch(`${API_BASE_URL}/api/community`);
        const postData = await postRes.json();
        if (postData.success) {
          const userPosts = postData.posts.filter((p: any) => p.author_email === user.email);
          setMyPosts(userPosts);
        }
      } catch (err) {
        console.error("데이터 로딩 실패:", err);
      } finally {
        loadWishlist();
        setIsLoading(false);
      }
    };

    loadUserData();
    window.addEventListener('focus', loadUserData);
    return () => window.removeEventListener('focus', loadUserData);
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

  const handleChangePassword = async () => {
    if (!currentUser) return;
    const currentPw = prompt("현재 비밀번호를 입력해주세요.");
    if (!currentPw) return;
    const newPw = prompt("새로운 비밀번호를 입력해주세요. (6자 이상)");
    if (!newPw || newPw.length < 6) {
      alert("새 비밀번호는 최소 6자 이상이어야 합니다.");
      return;
    }
    // ✅ 인자 4개 전달 (id, email, currentPw, newPw)
    try {
      const result = await resetPassword(currentUser.id, currentUser.email, currentPw, newPw);
      alert(result.message);
      if (result.success) handleLogout();
    } catch (error) {
      alert("오류가 발생했습니다.");
    }
  };

  const handleDeleteAccount = async () => {
    if (confirm("정말로 탈퇴하시겠습니까?")) {
      const result = await deleteAccount(currentUser?.id || "");
      if (result.success) {
        alert(result.message);
        setCurrentUser(null);
        navigate("/");
      }
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center px-6">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-10 h-10 text-gray-300" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">로그인이 필요해요</h2>
          <Button className="w-full max-w-[280px] h-14 bg-[#FF3478] text-white font-bold rounded-2xl shadow-lg mt-8" onClick={() => navigate("/notmypage")}>
            로그인 / 회원가입
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#111111] font-sans text-gray-900 dark:text-zinc-100">
      <main className="max-w-[1000px] mx-auto pt-12 pb-24 px-5">
        <header className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12">
          <div className="relative group shrink-0">
            <Avatar className="w-32 h-32 md:w-40 md:h-40 border-[6px] border-gray-50 dark:border-zinc-800">
              <AvatarImage src={currentUser.profilePhoto} className="object-cover" />
              <AvatarFallback className="bg-[#FF3478]/10 text-[#FF3478] text-5xl font-black">{currentUser.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-1 right-1 w-10 h-10 bg-white dark:bg-zinc-700 border border-gray-100 dark:border-zinc-600 rounded-full flex items-center justify-center shadow-lg"><Camera size={20}/></button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoChange} />
          </div>

          <div className="flex-1 text-center md:text-left pt-4">
            <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
              <h1 className="text-3xl font-black">{currentUser.name}님</h1>
              <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[11px] font-bold rounded-lg uppercase">General Member</span>
            </div>
            <p className="text-gray-400 dark:text-zinc-500 font-medium text-lg mb-8">{currentUser.email}</p>
            
            <div className="flex justify-center md:justify-start gap-4">
              <div className="px-5 py-4 bg-gray-50 dark:bg-zinc-900/50 rounded-2xl flex items-center gap-4 min-w-[140px]">
                <div className="w-10 h-10 rounded-xl bg-[#FF3478]/10 flex items-center justify-center"><Heart size={18} className="text-[#FF3478]" fill="#FF3478" /></div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-gray-400 uppercase">Saved</span>
                  <span className="text-xl font-black">{isLoading ? '...' : savedFestivals.length}</span>
                </div>
              </div>
              <div className="px-5 py-4 bg-gray-50 dark:bg-zinc-900/50 rounded-2xl flex items-center gap-4 min-w-[140px]">
                <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-zinc-800 flex items-center justify-center"><MessageSquare size={18} className="text-gray-500" /></div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-gray-400 uppercase">Reviews</span>
                  <span className="text-xl font-black">{isLoading ? '...' : reviewCount}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <Tabs defaultValue="saved" className="w-full">
          <TabsList className="flex w-full border-b border-gray-100 dark:border-zinc-800 bg-transparent h-auto p-0 mb-10 gap-8 md:gap-12">
            <TabsTrigger value="saved" className="px-0 py-4 border-b-4 border-transparent data-[state=active]:border-[#FF3478] data-[state=active]:text-[#FF3478] bg-transparent shadow-none text-lg font-black transition-all">찜한 축제</TabsTrigger>
            <TabsTrigger value="posts" className="px-0 py-4 border-b-4 border-transparent data-[state=active]:border-[#FF3478] data-[state=active]:text-[#FF3478] bg-transparent shadow-none text-lg font-black transition-all">작성한 글</TabsTrigger>
            <TabsTrigger value="settings" className="px-0 py-4 border-b-4 border-transparent data-[state=active]:border-[#FF3478] data-[state=active]:text-[#FF3478] bg-transparent shadow-none text-lg font-black transition-all">계정 설정</TabsTrigger>
          </TabsList>

          <TabsContent value="saved" className="outline-none">
            {savedFestivals.length > 0 ? (
              <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {savedFestivals.map((f) => (<motion.div key={f.id} variants={staggerItem}><FestivalCard festival={f} /></motion.div>))}
              </motion.div>
            ) : (
              <div className="text-center py-24 bg-gray-50 dark:bg-zinc-900/50 rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-zinc-800">
                <Heart className="w-12 h-12 text-gray-200 mx-auto mb-4" /><p className="text-gray-400 font-bold">아직 찜한 축제가 없습니다.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="posts" className="outline-none">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {myPosts.map((post) => (
                <div key={post.id} onClick={() => navigate('/community')} className="p-6 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-[2rem] cursor-pointer hover:shadow-lg transition-all">
                  <h3 className="text-[17px] font-extrabold mb-2">{post.title}</h3>
                  <p className="text-[14px] text-gray-500 line-clamp-2">{post.content}</p>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="outline-none">
            <div className="max-w-xl space-y-10">
              <section>
                <h3 className="text-xl font-black mb-6 flex items-center gap-2"><User size={20} className="text-[#FF3478]" /> 개인정보 관리</h3>
                <div className="space-y-4">
                  <div className="space-y-1"><Label className="ml-1">이름</Label><Input value={currentUser.name} disabled className="h-14 rounded-2xl bg-gray-50 border-none font-bold" /></div>
                  <div className="space-y-1"><Label className="ml-1">이메일 계정</Label><Input value={currentUser.email} disabled className="h-14 rounded-2xl bg-gray-50 border-none font-bold" /></div>
                </div>
              </section>
              <section className="pt-10 border-t border-gray-100 dark:border-zinc-800">
                <h3 className="text-xl font-black mb-6 flex items-center gap-2"><Settings size={20} className="text-gray-400" /> 계정 보안 및 관리</h3>
                <div className="flex flex-col gap-3">
                  <button onClick={handleChangePassword} className="w-full flex items-center justify-between p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 hover:bg-gray-50 transition-all">
                    <div className="flex items-center gap-4"><div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-zinc-800 flex items-center justify-center"><Key size={18} className="text-gray-400" /></div><span className="font-bold">비밀번호 변경</span></div>
                    <ChevronRight size={18} className="text-gray-300" />
                  </button>
                  <button onClick={handleLogout} className="w-full flex items-center justify-between p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 hover:bg-gray-50 transition-all">
                    <div className="flex items-center gap-4"><div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-zinc-800 flex items-center justify-center"><LogOut size={18} className="text-gray-400" /></div><span className="font-bold">로그아웃</span></div>
                    <ChevronRight size={18} className="text-gray-300" />
                  </button>
                  <button onClick={handleDeleteAccount} className="w-full flex items-center justify-between p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 hover:bg-gray-50 transition-all">
                    <div className="flex items-center gap-4"><div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-zinc-800 flex items-center justify-center"><UserX size={18} className="text-gray-400" /></div><span className="font-bold text-red-500">회원 탈퇴</span></div>
                    <ChevronRight size={18} className="text-gray-300" />
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