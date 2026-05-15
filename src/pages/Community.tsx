// 주환 - 2026.05.15: 커뮤니티 페이지 (사진 비율 유지 + 수정 시 이미지 개별 삭제 기능 통합)
import { useState, useEffect } from "react"; 
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Heart, MessageCircle, Search, X, 
  Trash2, Pencil, ChevronLeft, ChevronRight, Maximize2 
} from "lucide-react"; 
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";
import { getCurrentUser } from "@/lib/login";
import { supabase } from "@/lib/supabase"; 

const STORAGE_BASE_URL = "https://ofslnmgvaiycywllsosc.supabase.co/storage/v1/object/public/community_images/";

const getFullImageUrl = (imagePath: string) => {
  if (!imagePath) return "https://placehold.co/800x400/eeeeee/999999?text=No+Photo";
  if (imagePath.startsWith('http') || imagePath.startsWith('blob:')) return imagePath;
  return `${STORAGE_BASE_URL}${imagePath}`;
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case "전통문화": return "bg-red-50 text-red-500 border-red-100";
    case "공연예술": return "bg-blue-50 text-blue-500 border-blue-100";
    case "수다": return "bg-gray-50 text-gray-500 border-gray-100";
    default: return "bg-green-50 text-green-500 border-green-100";
  }
};

// 고화질 원본 이미지 전용 뷰어 컴포넌트 ---
const HighResImageViewer = ({ images, initialIndex, onClose }: { images: string[], initialIndex: number, onClose: () => void }) => {
  const [idx, setIdx] = useState(initialIndex);
  const prev = (e: React.MouseEvent) => { e.stopPropagation(); setIdx(idx === 0 ? images.length - 1 : idx - 1); };
  const next = (e: React.MouseEvent) => { e.stopPropagation(); setIdx(idx === images.length - 1 ? 0 : idx + 1); };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[300] bg-black/95 flex items-center justify-center p-4" onClick={onClose}>
      <button className="absolute top-6 right-6 text-white/70 hover:text-white z-[310] transition-colors"><X size={32} /></button>
      {images.length > 1 && (
        <>
          <button onClick={prev} className="absolute left-6 text-white/50 hover:text-white p-3 bg-white/10 rounded-full z-[310] transition-all"><ChevronLeft size={36} /></button>
          <button onClick={next} className="absolute right-6 text-white/50 hover:text-white p-3 bg-white/10 rounded-full z-[310] transition-all"><ChevronRight size={36} /></button>
        </>
      )}
      <motion.img 
        key={idx} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        src={getFullImageUrl(images[idx])} 
        className="max-w-full max-h-full object-contain pointer-events-none shadow-2xl" 
      />
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-black/40 px-4 py-2 rounded-full text-white/80 text-sm font-bold backdrop-blur-md">{idx + 1} / {images.length}</div>
    </motion.div>
  );
};

// 게시글 상세 모달 내부용 슬라이더 컴포넌트 (비율 깨짐 방지 수정) ---
const PostImageSlider = ({ images }: { images: string[] }) => {
  const [idx, setIdx] = useState(0);
  if (images.length === 0) return <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>;
  return (
    <div className="w-full h-full relative group/slider overflow-hidden bg-black flex items-center justify-center">
      {/* 💡 object-cover를 contain으로 변경하여 사진이 깨지거나 늘어나지 않게 함 */}
      <img src={getFullImageUrl(images[idx])} className="w-full h-full object-contain" alt="Post content" />
      {images.length > 1 && (
        <>
          <button onClick={(e) => { e.stopPropagation(); setIdx(idx === 0 ? images.length - 1 : idx - 1); }} 
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white p-2 rounded-full opacity-0 group-hover/slider:opacity-100 transition-all">
            <ChevronLeft size={24} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setIdx(idx === images.length - 1 ? 0 : idx + 1); }} 
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/60 text-white p-2 rounded-full opacity-0 group-hover/slider:opacity-100 transition-all">
            <ChevronRight size={24} />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === idx ? "bg-white w-4" : "bg-white/40"}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

interface CommentData { id: string; author: string; author_email: string; text: string; date: string; likes?: number; }
interface CommunityPost { id: string; author: string; author_email: string; avatar?: string; Title: string; content: string; images: string[]; likes: number; comments: number; date: string; category: string; commentsList?: CommentData[]; }
const getTimeAgo = (dateString: string) => { if (!dateString) return "방금 전"; const commentDate = new Date(dateString); const now = new Date(); const diffMs = now.getTime() - commentDate.getTime(); const diffMins = Math.floor(diffMs / (1000 * 60)); if (diffMins < 1) return "방금 전"; if (diffMins < 60) return `${diffMins}분 전`; if (Math.floor(diffMs / (1000 * 60 * 60)) < 24) return `${Math.floor(diffMs / (1000 * 60 * 60))}시간 전`; return `${commentDate.getFullYear()}.${String(commentDate.getMonth() + 1).padStart(2, '0')}.${String(commentDate.getDate()).padStart(2, '0')}`; };

const PostThumbnail = ({ images }: { images: string[] }) => {
  if (!images || images.length === 0) return null;
  return (
    <div className="relative w-full h-full group overflow-hidden bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
      <img src={getFullImageUrl(images[0])} alt="thumbnail" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
      {images.length > 1 && ( <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-2 py-1 rounded-md font-bold backdrop-blur-sm">+{images.length - 1}</div> )}
    </div>
  );
};

export default function Community() {
  const currentUser = getCurrentUser(); 
  const navigate = useNavigate();
  
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [visibleCount, setVisibleCount] = useState(12);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [commentText, setCommentText] = useState("");
  const [highResViewer, setHighResViewer] = useState<{ images: string[], index: number } | null>(null);

  const [editingPost, setEditingPost] = useState<CommunityPost | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editImages, setEditImages] = useState<FileList | null>(null);
  // 수정 시 삭제하지 않고 남길 사진 목록 상태 추가
  const [existingImagesToKeep, setExistingImagesToKeep] = useState<string[]>([]);

  const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
  const authHeaders = { "Content-Type": "application/json", ...(token && { "Authorization": `Bearer ${token}` }) };
  const formDataHeaders = { ...(token && { "Authorization": `Bearer ${token}` }) };

  useEffect(() => {
    const initData = async () => {
      try {
        const response = await fetch("https://gokgok-8ztf.onrender.com/api/community");
        const data = await response.json();
        if (data.success) {
          const formatted = data.posts.map((p: any) => ({
            id: p.id, author: p.author, author_email: p.author_email, Title: p.title, 
            content: p.content, images: Array.isArray(p.images) ? p.images : (p.images ? [p.images] : []),
            likes: p.likes || 0, comments: p.commentsList ? p.commentsList.length : 0,
            date: p.created_at, category: p.category || "수다",
            commentsList: p.commentsList?.map((c: any) => ({
              id: c.id, author: c.author, author_email: c.author_email, text: c.text, date: c.created_at, likes: c.likes || 0
            })) || []
          }));
          setPosts(formatted);
          if (currentUser?.email) {
            const res = await fetch("https://gokgok-8ztf.onrender.com/api/community/my-likes", { method: "POST", headers: authHeaders, body: JSON.stringify({ user_email: currentUser.email }) });
            const likes = await res.json();
            if (likes.success && likes.likes) setLikedIds(new Set(likes.likes.map((item: any) => item.post_id)));
          }
        }
      } catch (error) { console.error(error); }
    };
    initData();
  }, [currentUser?.email]);

  const handleLike = async (e: React.MouseEvent, postId: string) => {
    e.stopPropagation(); if (!currentUser) return alert("로그인 필요");
    try {
      const response = await fetch(`https://gokgok-8ztf.onrender.com/api/community/${postId}/like`, { method: "POST", headers: authHeaders, body: JSON.stringify({ user_email: currentUser.email }) });
      const data = await response.json();
      if (data.success) {
        setLikedIds((prev) => { const next = new Set(prev); data.isLiked ? next.add(postId) : next.delete(postId); return next; });
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: data.likes } : p));
        if (selectedPost?.id === postId) setSelectedPost(prev => prev ? { ...prev, likes: data.likes } : null);
      }
    } catch (e) { alert("좋아요 실패"); }
  };

  const handleCommentSubmit = async () => { if (!currentUser || !commentText.trim() || !selectedPost) return; try { const res = await fetch(`https://gokgok-8ztf.onrender.com/api/community/${selectedPost.id}/comments`, { method: "POST", headers: authHeaders, body: JSON.stringify({ author: currentUser.name, author_email: currentUser.email, text: commentText }) }); const data = await res.json(); if (data.success) { const newComment = { id: data.comment.id, author: data.comment.author, author_email: data.comment.author_email, text: data.comment.text, date: data.comment.created_at, likes: 0 }; setPosts(posts.map(p => p.id === selectedPost.id ? { ...p, comments: p.comments + 1, commentsList: [...(p.commentsList || []), newComment] } : p)); setSelectedPost(prev => prev ? { ...prev, comments: prev.comments + 1, commentsList: [...(prev.commentsList || []), newComment] } : null); setCommentText(""); } } catch (e) { alert("실패"); } };
  const handleDeleteComment = async (postId: string, commentId: string) => { if (!currentUser) return; if (!window.confirm("이 댓글을 삭제하시겠습니까?")) return; try { const response = await fetch(`https://gokgok-8ztf.onrender.com/api/community/${postId}/comments/${commentId}`, { method: "DELETE", headers: authHeaders, body: JSON.stringify({ author_email: currentUser.email }) }); const data = await response.json(); if (data.success) { setPosts(posts.map(p => { if (p.id === postId) { return { ...p, comments: Math.max(0, p.comments - 1), commentsList: p.commentsList?.filter(c => c.id !== commentId) }; } return p; })); if (selectedPost && selectedPost.id === postId) { setSelectedPost({ ...selectedPost, comments: Math.max(0, selectedPost.comments - 1), commentsList: selectedPost.commentsList?.filter(c => c.id !== commentId) }); } } else { alert(data.message || "삭제 권한이 없습니다."); } } catch (e) { alert("댓글 삭제 실패"); } };
  const handleDelete = async (postId: string) => { if (!currentUser) return; if (!window.confirm("정말로 이 게시글을 삭제하시겠습니까?")) return; try { const response = await fetch(`https://gokgok-8ztf.onrender.com/api/community/${postId}`, { method: "DELETE", headers: authHeaders, body: JSON.stringify({ author_email: currentUser.email }) }); const data = await response.json(); if (data.success) { alert("게시글이 삭제되었습니다."); setPosts(prev => prev.filter(p => p.id !== postId)); setSelectedPost(null); } else { alert(data.message || "삭제 권한이 없습니다."); } } catch (e) { alert("삭제 처리 중 오류가 발생했습니다."); } };

  const openEditModal = (post: CommunityPost) => { 
    setEditingPost(post); 
    setEditTitle(post.Title); 
    setEditContent(post.content); 
    setEditImages(null);
    setExistingImagesToKeep(post.images); // 초기 기존 사진 목록 로드
  };

  const handleEditSubmit = async () => { 
    if (!editingPost || !currentUser) return; 
    if (!editTitle.trim() || !editContent.trim()) return alert("제목과 내용을 모두 입력해주세요."); 
    try { 
      const formData = new FormData(); 
      formData.append("author_email", currentUser.email); 
      formData.append("title", editTitle); 
      formData.append("content", editContent); 
      
      //  유지하기로 선택한 기존 이미지 목록 전송
      if (existingImagesToKeep.length > 0) {
        existingImagesToKeep.forEach(url => formData.append("existingImages", url));
      } else {
        formData.append("existingImages", "[]");
      }

      if (editImages && editImages.length > 0) { 
        Array.from(editImages).forEach(file => formData.append("images", file)); 
      } 
      
      const response = await fetch(`https://gokgok-8ztf.onrender.com/api/community/${editingPost.id}`, { method: "PUT", headers: formDataHeaders, body: formData }); 
      const data = await response.json(); 
      if (data.success) { 
        alert("게시글이 성공적으로 수정되었습니다."); 
        const updatedImages = data.post.images || existingImagesToKeep; 
        setPosts(prev => prev.map(p => p.id === editingPost.id ? { ...p, Title: editTitle, content: editContent, images: updatedImages } : p)); 
        if (selectedPost && selectedPost.id === editingPost.id) { 
          setSelectedPost(prev => prev ? { ...prev, Title: editTitle, content: editContent, images: updatedImages } : null); 
        } 
        setEditingPost(null); 
      } else { 
        alert(data.message || "수정 권한이 없습니다."); 
      } 
    } catch (e) { alert("수정 처리 중 오류가 발생했습니다."); } 
  };

  const filteredPosts = posts.filter(p => p.Title.toLowerCase().includes(searchTerm.toLowerCase()) || p.author.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-white dark:bg-[#111111] transition-colors relative font-sans text-[#111111] dark:text-white pb-20">
      <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="w-full pt-12 pb-16 px-4 md:px-10">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 text-left">
            <div><h1 className="text-[32px] font-black tracking-tight">수다</h1><p className="text-gray-400 font-medium text-sm">여행의 즐거움을 함께 나누세요.</p></div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-10">
            <div className="relative w-full md:w-2/3 lg:w-1/2 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#111111] dark:group-focus-within:text-white transition-colors" />
              <input type="text" placeholder="작성자 또는 제목으로 검색해보세요" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-14 pr-6 h-[54px] bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-2xl outline-none font-medium shadow-sm" />
            </div>
            <Button className="w-full md:w-auto h-[54px] bg-white dark:bg-[#1a1a1a] text-[#111111] dark:text-white border border-gray-200 dark:border-gray-800 rounded-2xl px-8 font-bold active:scale-95 flex items-center justify-center gap-2 transition-all shrink-0" onClick={() => navigate("/community/write")}>
              <Pencil className="w-4 h-4" /> 포스트 쓰기
            </Button>
          </div>

          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
            {filteredPosts.slice(0, visibleCount).map((post) => (
              <motion.div key={post.id} variants={staggerItem}>
                <div className="group bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col h-full" onClick={() => setSelectedPost(post)}>
                  <div className="flex flex-col flex-1">
                    <div className="w-full aspect-[4/3] shrink-0 mb-4 relative group/img overflow-hidden rounded-xl bg-gray-50 dark:bg-gray-800"
                      onClick={(e) => { if (post.images.length > 0) { e.stopPropagation(); setHighResViewer({ images: post.images, index: 0 }); } }}>
                      {post.images.length > 0 ? (
                        <>
                          <img src={getFullImageUrl(post.images[0])} alt="thumbnail" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center"><Maximize2 className="text-white" size={24} /></div>
                          {post.images.length > 1 && <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-2 py-1 rounded-md font-bold backdrop-blur-sm">+{post.images.length - 1}</div>}
                        </>
                      ) : ( <div className="w-full h-full flex items-center justify-center border border-gray-100 dark:border-gray-700 text-gray-300 dark:text-gray-600 font-bold text-sm">No Photo</div> )}
                    </div>
                    <div className="flex items-center justify-between mb-3 text-left">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-[10px] font-extrabold text-gray-700 dark:text-gray-200 uppercase">{post.author[0]}</div>
                        <div className="flex flex-col"><span className="text-[12px] font-extrabold text-gray-900 dark:text-white line-clamp-1">{post.author}</span><span className="text-[10px] text-gray-400 font-medium">{getTimeAgo(post.date)}</span></div>
                      </div>
                      <Badge variant="outline" className={`border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 font-bold text-[10px] px-2 py-0.5 rounded-full ${getCategoryColor(post.category)}`}>{post.category}</Badge>
                    </div>
                    <h3 className="text-[16px] font-extrabold text-gray-900 dark:text-white mb-1.5 group-hover:text-[#FF3478] transition-colors line-clamp-1 text-left">{post.Title}</h3>
                    <p className="text-[13px] text-gray-500 dark:text-gray-400 line-clamp-2 font-medium mb-4 text-left">{post.content}</p>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800 mt-auto">
                    <div className="flex items-center gap-4">
                      <button onClick={(e) => handleLike(e, post.id)} className={`flex items-center gap-1.5 transition-all ${likedIds.has(post.id) ? "text-[#FF3478]" : "text-gray-400"}`}><Heart className="w-4 h-4" fill={likedIds.has(post.id) ? "currentColor" : "none"} /><span className="text-[12px] font-bold">{post.likes}</span></button>
                      <div className="flex items-center gap-1.5 text-gray-400"><MessageCircle className="w-4 h-4" /><span className="text-[12px] font-bold">{post.comments}</span></div>
                    </div>
                    {currentUser?.email === post.author_email && ( <div className="flex items-center gap-1.5 pl-2" onClick={e => e.stopPropagation()}><button onClick={() => openEditModal(post)} className="text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors p-1"><Pencil className="w-3.5 h-3.5" /></button><button onClick={() => handleDelete(post.id)} className="text-gray-300 hover:text-red-500 transition-colors p-1"><Trash2 className="w-3.5 h-3.5" /></button></div> )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      <AnimatePresence>
        {highResViewer && <HighResImageViewer images={highResViewer.images} initialIndex={highResViewer.index} onClose={() => setHighResViewer(null)} />}
      </AnimatePresence>

      <AnimatePresence>
        {selectedPost && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-0 md:p-10" onClick={() => setSelectedPost(null)}>
            <motion.div initial={{ scale: 0.95, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 30 }} onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-[#1a1a1a] w-full h-full md:h-[85vh] max-w-5xl md:rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row overflow-hidden relative">
              <div className="w-full md:w-[55%] h-[40vh] md:h-full bg-black relative shrink-0 border-r border-gray-100 dark:border-gray-800 flex items-center justify-center">
                <PostImageSlider images={selectedPost.images} />
                <button onClick={() => setSelectedPost(null)} className="absolute top-6 left-6 text-white md:hidden bg-black/40 backdrop-blur-md rounded-full p-2.5 z-10"><X size={24} /></button>
              </div>
              <div className="w-full md:w-[45%] flex flex-col flex-1 bg-white dark:bg-[#1a1a1a] relative min-h-0 text-left">
                 <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center font-extrabold text-sm text-gray-700 dark:text-gray-200 uppercase">{selectedPost.author[0]}</div>
                    <div className="text-left"><p className="font-extrabold text-[15px] text-gray-900 dark:text-white">{selectedPost.author}</p><p className="text-[11px] text-[#FF3478] font-bold tracking-tight">{selectedPost.category}</p></div>
                  </div>
                  <div className="flex items-center gap-4">
                    {currentUser?.email === selectedPost.author_email && ( <div className="flex items-center gap-3 mr-2"><button onClick={() => openEditModal(selectedPost)} className="text-gray-300 hover:text-[#111111] dark:hover:text-white transition-colors"><Pencil size={18}/></button><button onClick={() => handleDelete(selectedPost.id)} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={18}/></button></div> )}
                    <button onClick={() => setSelectedPost(null)} className="hidden md:block text-gray-400 hover:text-[#FF3478] transition-colors"><X size={24} strokeWidth={3}/></button>
                  </div>
                </div>
                <div className="p-7 overflow-y-auto flex-1 no-scrollbar space-y-8">
                  <div className="pb-8 border-b border-gray-100 dark:border-gray-800">
                    <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-5 leading-tight tracking-tight">{selectedPost.Title}</h2>
                    <p className="text-[15px] text-gray-600 dark:text-gray-300 leading-relaxed font-medium whitespace-pre-wrap">{selectedPost.content}</p>
                    <p className="text-[12px] text-gray-400 mt-8 font-bold">{getTimeAgo(selectedPost.date)}</p>
                  </div>
                  <div className="space-y-6">
                    <p className="text-[13px] font-extrabold text-gray-900 dark:text-white mb-4">댓글 <span className="text-[#FF3478]">{selectedPost.commentsList?.length || 0}</span></p>
                    {selectedPost.commentsList?.map((comment:any) => (
                      <div key={comment.id} className="flex gap-3 relative group">
                        <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shrink-0 flex items-center justify-center text-[10px] font-black text-gray-700 dark:text-gray-200 uppercase">{comment.author[0]}</div>
                        <div className="flex-1 text-left pr-6"><p className="text-[14px] text-gray-700 dark:text-gray-300 leading-relaxed"><span className="font-extrabold text-gray-900 dark:text-white mr-2">{comment.author}</span>{comment.text}</p><p className="text-[11px] text-gray-400 mt-1.5 font-bold tracking-tighter">{getTimeAgo(comment.date)}</p></div>
                        {currentUser?.email === comment.author_email && ( <button onClick={() => handleDeleteComment(selectedPost.id, comment.id)} className="absolute top-0 right-0 text-gray-300 hover:text-red-500 p-1 transition-colors opacity-0 group-hover:opacity-100"><X size={14} strokeWidth={3}/></button> )}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-5 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a1a1a] shrink-0">
                  <div className="flex items-center gap-3 bg-gray-50 dark:bg-[#222] border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-3 shadow-sm">
                    <input type="text" value={commentText} onChange={(e) => setCommentText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit()} placeholder={currentUser ? "축제 이야기를 나눠보세요" : "로그인 후 댓글 작성"} className="flex-1 bg-transparent text-[14px] outline-none font-medium text-gray-900 dark:text-white" readOnly={!currentUser} onClick={() => { if (!currentUser) alert("로그인이 필요합니다!"); }} />
                    <button onClick={handleCommentSubmit} disabled={!currentUser || !commentText.trim()} className="text-gray-900 dark:text-white font-bold text-sm disabled:text-gray-300 transition-colors">게시</button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editingPost && ( 
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md p-4" onClick={() => setEditingPost(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={e => e.stopPropagation()} className="bg-white dark:bg-[#1a1a1a] w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-gray-100 dark:border-gray-800">
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-[#1a1a1a]">
                <h3 className="font-extrabold text-xl text-gray-900 dark:text-white tracking-tight">게시글 수정</h3>
                <button onClick={() => setEditingPost(null)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"><X className="w-6 h-6" /></button>
              </div>
              <div className="p-8 flex flex-col gap-6 text-left overflow-y-auto max-h-[70vh]">
                <div><label className="text-[13px] font-extrabold text-gray-900 dark:text-gray-200 mb-2 block">제목</label><input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="w-full bg-gray-50 dark:bg-[#222] border border-gray-200 dark:border-gray-700 rounded-2xl p-4 font-bold text-gray-900 dark:text-white outline-none focus:bg-white dark:focus:bg-[#1a1a1a] transition-all shadow-sm" /></div>
                <div><label className="text-[13px] font-extrabold text-gray-900 dark:text-gray-200 mb-2 block">내용</label><textarea value={editContent} onChange={e => setEditContent(e.target.value)} className="w-full h-40 bg-gray-50 dark:bg-[#222] border border-gray-200 dark:border-gray-700 rounded-2xl p-4 font-medium text-gray-700 dark:text-gray-300 outline-none focus:bg-white dark:focus:bg-[#1a1a1a] resize-none transition-all shadow-sm" /></div>
                
                {/* 💡 2. 수정 시 사진 삭제 UI 추가 */}
                <div>
                  <label className="text-[13px] font-extrabold text-gray-900 dark:text-gray-200 mb-3 block">사진</label>
                  {existingImagesToKeep.length > 0 ? (
                    <div className="grid grid-cols-4 gap-3">
                      {existingImagesToKeep.map((imgUrl, i) => (
                        <div key={i} className="relative aspect-square group overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800">
                          <img src={getFullImageUrl(imgUrl)} className="w-full h-full object-cover" />
                          <button onClick={() => setExistingImagesToKeep(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 hover:bg-red-500 transition-colors opacity-0 group-hover:opacity-100"><X size={12} strokeWidth={3}/></button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 bg-gray-50 dark:bg-black/20 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 text-gray-400 text-xs">남은 사진이 없습니다.</div>
                  )}
                </div>

                <div>
                  <label className="text-[13px] font-extrabold text-gray-900 dark:text-gray-200 mb-2 block">사진 추가</label>
                  <input type="file" multiple accept="image/*" onChange={(e) => setEditImages(e.target.files)} className="text-sm file:mr-4 file:py-2.5 file:px-5 file:rounded-full file:border-0 file:bg-gray-900 file:text-white" />
                  <p className="text-[10px] text-gray-400 mt-2">* 새로운 사진을 등록하면 기존 사진 뒤에 추가됩니다.</p>
                </div>
              </div>
              <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3 bg-white dark:bg-[#1a1a1a]">
                <Button variant="outline" className="font-bold rounded-full px-6" onClick={() => setEditingPost(null)}>취소</Button>
                <Button className="bg-gray-900 dark:bg-white hover:bg-black dark:hover:bg-gray-200 text-white dark:text-black font-bold px-8 rounded-full" onClick={handleEditSubmit}>수정 완료</Button>
              </div>
            </motion.div>
          </motion.div> 
        )}
      </AnimatePresence>
    </div>
  );
}