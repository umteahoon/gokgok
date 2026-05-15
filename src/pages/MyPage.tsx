import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Camera, LogOut, Key, UserX, Heart, 
  ChevronRight, Settings, MessageSquare, FileText, Pencil, Trash2, X, ImagePlus, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate, Link } from "react-router-dom";
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
const STORAGE_URL = "https://ofslnmgvaiycywllsosc.supabase.co/storage/v1/object/public/community_images/";

export default function MyPage() {
  const navigate = useNavigate();
  const profileFileInputRef = useRef<HTMLInputElement>(null);
  const postFileInputRef = useRef<HTMLInputElement>(null);
  
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [savedFestivals, setSavedFestivals] = useState<any[]>([]); 
  const [myPosts, setMyPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [editingPost, setEditingPost] = useState<any | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editImages, setEditImages] = useState<FileList | null>(null);

  const allFestivals = [...topFestivals, ...mockFestivals];

  // ✅ 데이터 로드 함수 (실시간 하트 개수 및 게시글 동기화를 위해 통합)
  const loadUserData = async () => {
    const user = getCurrentUser();
    if (!user) {
      setIsLoading(false);
      return;
    }
    setCurrentUser(user);

    // 1. 관심 목록(찜) 로드
    const savedIds = JSON.parse(localStorage.getItem("gokgok_wishlist") || "[]");
    const filtered = allFestivals.filter(f => savedIds.includes(String(f.id)));
    setSavedFestivals(filtered);

    try {
      // 2. 수다방 게시글 및 실시간 하트 개수 로드
      const postRes = await fetch(`${API_BASE_URL}/api/community`);
      const postData = await postRes.json();
      if (postData.success) {
        // 내 이메일로 작성된 글만 필터링 (좋아요 수 포함됨)
        const userPosts = postData.posts.filter((p: any) => p.author_email === user.email);
        setMyPosts(userPosts);
      }
    } catch (err) {
      console.error("데이터 로드 중 오류:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
    // ✅ 다른 탭에서 하트를 누르고 돌아왔을 때 실시간 연동을 위해 window focus 이벤트 사용
    window.addEventListener('focus', loadUserData);
    return () => window.removeEventListener('focus', loadUserData);
  }, []);

  // --- 프로필 사진 수정 ---
  const handleProfilePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && currentUser) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const updatedUser = await updateProfilePhoto(base64String);
        if (updatedUser) {
          setCurrentUser({ ...updatedUser });
          alert("프로필 사진이 변경되었습니다.");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const openEditModal = (post: any) => {
    setEditingPost(post);
    setEditTitle(post.title);
    setEditContent(post.content);
    setEditImages(null);
  };

  const handleEditSubmit = async () => {
    if (!editingPost || !currentUser) return;
    try {
      const formData = new FormData();
      formData.append("author_email", currentUser.email);
      formData.append("title", editTitle);
      formData.append("content", editContent);
      if (editImages && editImages.length > 0) {
        Array.from(editImages).forEach(file => formData.append("images", file));
      }
      const response = await fetch(`${API_BASE_URL}/api/community/${editingPost.id}`, {
        method: "PUT",
        body: formData 
      });
      const data = await response.json();
      if (data.success) {
        alert("글과 이미지가 수정되었습니다.");
        setEditingPost(null);
        loadUserData();
      }
    } catch (e) {
      alert("수정 중 오류가 발생했습니다.");
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
    try {
      const result = await resetPassword(currentUser.id, currentUser.email, currentPw, newPw);
      alert(result.message);
      if (result.success) handleLogout();
    } catch (error) {
      alert("비밀번호 변경 중 오류가 발생했습니다.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#111111] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF3478]" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#111111] flex items-center justify-center">
        <div className="text-center px-6">
          <div className="w-20 h-20 bg-gray-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6"><User className="w-10 h-10 text-gray-300" /></div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">로그인이 필요해요</h2>
          <Button className="w-full max-w-[280px] h-14 bg-[#FF3478] text-white font-bold rounded-2xl shadow-lg mt-8" onClick={() => navigate("/notmypage")}>로그인 / 회원가입</Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-white dark:bg-[#111111] font-sans text-gray-900 dark:text-zinc-100 transition-colors">
      <main className="max-w-[1000px] mx-auto pt-12 pb-24 px-5">
        
        <header className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12">
          <div className="relative group shrink-0">
            <div className="relative">
              <Avatar className="w-32 h-32 md:w-40 md:h-40 border-[6px] border-gray-50 dark:border-zinc-800 transition-all">
                <AvatarImage src={currentUser.profilePhoto} className="object-cover" />
                <AvatarFallback className="bg-[#FF3478]/10 text-[#FF3478] text-5xl font-black">{currentUser.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <button onClick={() => profileFileInputRef.current?.click()} className="absolute bottom-1 right-1 w-10 h-10 bg-white dark:bg-zinc-700 border border-gray-100 dark:border-zinc-600 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all text-gray-600 dark:text-zinc-300">
                <Camera size={20} />
              </button>
            </div>
            <input type="file" ref={profileFileInputRef} className="hidden" accept="image/*" onChange={handleProfilePhotoChange} />
          </div>

          <div className="flex-1 text-center md:text-left pt-4">
            <h1 className="text-3xl font-black tracking-tight mb-2">{currentUser.name}님</h1>
            <p className="text-gray-400 dark:text-zinc-500 font-medium text-lg mb-8">{currentUser.email}</p>
            
            <div className="flex justify-center md:justify-start gap-4">
              <div className="px-5 py-4 bg-gray-50 dark:bg-zinc-900/50 rounded-2xl flex items-center gap-4 min-w-[150px]">
                <div className="w-10 h-10 rounded-xl bg-[#FF3478]/10 flex items-center justify-center"><Heart size={18} className="text-[#FF3478]" fill="#FF3478" /></div>
                <div className="flex flex-col"><span className="text-[11px] font-bold text-gray-400 uppercase">관심 목록</span><span className="text-xl font-black">{savedFestivals.length}</span></div>
              </div>
              <div className="px-5 py-4 bg-gray-50 dark:bg-zinc-900/50 rounded-2xl flex items-center gap-4 min-w-[150px]">
                <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-zinc-800 flex items-center justify-center"><FileText size={18} className="text-gray-500" /></div>
                <div className="flex flex-col"><span className="text-[11px] font-bold text-gray-400 uppercase">작성한 글</span><span className="text-xl font-black">{myPosts.length}</span></div>
              </div>
            </div>
          </div>
        </header>

        <Tabs defaultValue="saved" className="w-full">
          <TabsList className="flex w-full border-b border-gray-100 dark:border-zinc-800 bg-transparent h-auto p-0 mb-10 gap-8 md:gap-12">
            {/* 배경 및 테두리 완전히 제거된 탭 디자인 */}
            <TabsTrigger value="saved" className="px-0 py-4 border-b-4 border-transparent data-[state=active]:border-[#FF3478] data-[state=active]:text-[#FF3478] bg-transparent shadow-none rounded-none text-lg font-black transition-all focus-visible:ring-0 focus-visible:outline-none data-[state=active]:bg-transparent">관심 목록</TabsTrigger>
            <TabsTrigger value="posts" className="px-0 py-4 border-b-4 border-transparent data-[state=active]:border-[#FF3478] data-[state=active]:text-[#FF3478] bg-transparent shadow-none rounded-none text-lg font-black transition-all focus-visible:ring-0 focus-visible:outline-none data-[state=active]:bg-transparent">작성한 글</TabsTrigger>
            <TabsTrigger value="settings" className="px-0 py-4 border-b-4 border-transparent data-[state=active]:border-[#FF3478] data-[state=active]:text-[#FF3478] bg-transparent shadow-none rounded-none text-lg font-black transition-all focus-visible:ring-0 focus-visible:outline-none data-[state=active]:bg-transparent">계정 설정</TabsTrigger>
          </TabsList>

          <TabsContent value="saved" className="outline-none">
            {savedFestivals.length > 0 ? (
              <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {savedFestivals.map((f) => (
                  <motion.div key={f.id} variants={staggerItem}>
                    {/* ✅ 관심 목록 클릭 시 상세페이지로만 이동 */}
                    <Link to={`/festival/${f.id}`} className="block h-full hover:scale-[1.02] transition-transform">
                      <FestivalCard festival={f} />
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="text-center py-24 bg-gray-50 dark:bg-zinc-900/50 rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-zinc-800">
                <Heart className="w-12 h-12 text-gray-200 mx-auto mb-4" /><p className="text-gray-400 font-bold">찜한 축제가 없습니다.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="posts" className="outline-none">
            <div className="grid grid-cols-1 gap-6">
              {myPosts.length > 0 ? myPosts.map((post) => (
                <div key={post.id} className="p-8 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-[2.5rem] relative group hover:border-[#FF3478]/30 transition-all flex flex-col md:flex-row gap-8">
                  {/* ✅ 수다 사진 연동 및 동기화 */}
                  {post.images && post.images.length > 0 && (
                    <div className="w-full md:w-48 h-48 shrink-0 rounded-3xl overflow-hidden bg-gray-50 shadow-inner">
                      <img src={`${STORAGE_URL}${post.images[0]}`} className="w-full h-full object-cover" alt="post" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-[20px] font-black truncate">{post.title}</h3>
                      <button onClick={() => openEditModal(post)} className="p-2 text-gray-300 hover:text-[#FF3478] transition-colors"><Pencil size={18} /></button>
                    </div>

                    {/* ✅ 좋아요(하트) 개수 실시간 연동 표시 */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#FF3478]/5 rounded-full text-[#FF3478]">
                        <Heart size={14} fill="#FF3478" />
                        <span className="text-xs font-black">{post.likes_count || 0}</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-50 dark:bg-zinc-800 rounded-full text-gray-400">
                        <MessageSquare size={14} />
                        <span className="text-xs font-bold">{post.commentsList?.length || 0}</span>
                      </div>
                    </div>

                    <p className="text-[15px] text-gray-500 dark:text-zinc-400 leading-relaxed mb-6 line-clamp-3">{post.content}</p>
                    
                    <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-2xl p-5">
                      <p className="text-[13px] font-bold text-gray-400 mb-4 flex items-center gap-2">
                        <MessageSquare size={14} /> 댓글 {post.commentsList?.length || 0}개
                      </p>
                      <div className="space-y-4 max-h-[160px] overflow-y-auto pr-2 no-scrollbar">
                        {post.commentsList && post.commentsList.length > 0 ? post.commentsList.map((comment: any) => (
                          <div key={comment.id} className="text-[14px] border-b border-gray-100 dark:border-zinc-800 last:border-0 pb-3">
                            <span className="font-black mr-2 text-[#FF3478]">{comment.author}</span>
                            <span className="text-gray-600 dark:text-zinc-300">{comment.text}</span>
                          </div>
                        )) : <p className="text-[13px] text-gray-300 italic">아직 댓글이 없습니다.</p>}
                      </div>
                    </div>
                  </div>
                </div>
              )) : <div className="text-center py-24 text-gray-400 font-bold">작성한 글이 없습니다.</div>}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="outline-none">
            <div className="max-w-xl space-y-10">
              <section>
                <h3 className="text-xl font-black mb-6 flex items-center gap-2"><User size={20} className="text-[#FF3478]" /> 개인정보 관리</h3>
                <div className="space-y-4">
                  <div className="space-y-1"><Label className="ml-1">이름</Label><Input value={currentUser.name} disabled className="h-14 rounded-2xl bg-gray-50 dark:bg-zinc-900 border-none font-bold" /></div>
                  <div className="space-y-1"><Label className="ml-1">이메일 계정</Label><Input value={currentUser.email} disabled className="h-14 rounded-2xl bg-gray-50 dark:bg-zinc-900 border-none font-bold" /></div>
                </div>
              </section>
              <section className="pt-10 border-t border-gray-100 dark:border-zinc-800">
                <h3 className="text-xl font-black mb-6 flex items-center gap-2"><Settings size={20} className="text-gray-400" /> 계정 보안 및 관리</h3>
                <div className="flex flex-col gap-3">
                  <button onClick={handleChangePassword} className="w-full flex items-center justify-between p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 hover:bg-gray-50 transition-all group shadow-none">
                    <div className="flex items-center gap-4"><div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-[#FF3478]/10 transition-colors"><Key size={18} className="group-hover:text-[#FF3478]" /></div><span className="font-bold">비밀번호 변경</span></div>
                    <ChevronRight size={18} className="text-gray-300" />
                  </button>
                  <button onClick={handleLogout} className="w-full flex items-center justify-between p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 hover:bg-gray-50 transition-all group shadow-none">
                    <div className="flex items-center gap-4"><div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-zinc-800 flex items-center justify-center transition-colors"><LogOut size={18} /></div><span className="font-bold">로그아웃</span></div>
                    <ChevronRight size={18} className="text-gray-300" />
                  </button>
                  <button onClick={() => { if(confirm("정말 탈퇴하시겠습니까?")) deleteAccount(currentUser.id).then(() => {alert("탈퇴되었습니다."); logout(); navigate("/");}) }} className="w-full flex items-center justify-between p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 hover:bg-gray-50 transition-all group shadow-none">
                    <div className="flex items-center gap-4"><div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-zinc-800 flex items-center justify-center transition-colors"><UserX size={18} /></div><span className="font-bold text-red-500">회원 탈퇴</span></div>
                    <ChevronRight size={18} className="text-gray-300" />
                  </button>
                </div>
              </section>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* 수정 모달 */}
      <AnimatePresence>
        {editingPost && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white dark:bg-[#1a1a1a] w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-gray-100 dark:border-gray-800">
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <h3 className="font-extrabold text-xl">게시글 및 사진 수정</h3>
                <button onClick={() => setEditingPost(null)} className="text-gray-400 hover:text-gray-900 transition-colors"><X className="w-6 h-6" /></button>
              </div>
              <div className="p-8 flex flex-col gap-6 overflow-y-auto max-h-[70vh]">
                <div><label className="text-[13px] font-extrabold mb-2 block">제목</label><input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="w-full bg-gray-50 dark:bg-[#222] border border-gray-200 dark:border-zinc-700 rounded-2xl p-4 font-bold outline-none focus:ring-2 focus:ring-[#FF3478]/20 transition-all" /></div>
                <div><label className="text-[13px] font-extrabold mb-2 block">내용</label><textarea value={editContent} onChange={e => setEditContent(e.target.value)} className="w-full h-32 bg-gray-50 dark:bg-[#222] border border-gray-200 dark:border-zinc-700 rounded-2xl p-4 font-medium outline-none focus:ring-2 focus:ring-[#FF3478]/20 resize-none transition-all" /></div>
                
                <div>
                  <label className="text-[13px] font-extrabold mb-2 block">사진 변경 (수다방 사진 연동)</label>
                  <div className="flex gap-2 mb-4 overflow-x-auto pb-2 no-scrollbar">
                    {editImages ? (
                      Array.from(editImages).map((file, i) => (
                        <div key={i} className="relative w-20 h-20 shrink-0"><img src={URL.createObjectURL(file)} className="w-full h-full object-cover rounded-xl border border-[#FF3478]" alt="new" /></div>
                      ))
                    ) : (
                      editingPost.images?.map((img: string, i: number) => (
                        <div key={i} className="w-20 h-20 shrink-0"><img src={`${STORAGE_URL}${img}`} className="w-full h-full object-cover rounded-xl opacity-60" alt="old" /></div>
                      ))
                    )}
                  </div>
                  <div onClick={() => postFileInputRef.current?.click()} className="w-full h-20 border-2 border-dashed border-gray-200 dark:border-zinc-700 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-all text-gray-400">
                    <ImagePlus size={20} /><span className="text-[11px] mt-1">새 사진 선택 시 수다방 사진이 교체됩니다</span>
                  </div>
                  <input type="file" ref={postFileInputRef} className="hidden" multiple accept="image/*" onChange={(e) => setEditImages(e.target.files)} />
                </div>
              </div>
              <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-white dark:bg-[#1a1a1a]">
                <Button variant="outline" className="rounded-full px-6" onClick={() => setEditingPost(null)}>취소</Button>
                <Button className="bg-[#FF3478] hover:bg-[#E62E6C] text-white font-bold px-8 rounded-full shadow-md" onClick={handleEditSubmit}>수정 완료</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}