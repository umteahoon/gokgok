// 주환 - 2026.05.06: 커뮤니티 페이지 (네이버 블로그 스타일 + 축제 페이지 색감 적용)
import { useState, useEffect, useRef } from "react"; 
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Heart, MessageCircle, Share2, User, Search, X, 
  ChevronLeft, ChevronRight, Trash2, Pencil, ImagePlus, MoreHorizontal 
} from "lucide-react"; 
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";
import { getCategoryColor } from "@/lib/index";
import { getCurrentUser } from "@/lib/login";
import { supabase } from "@/lib/supabase"; 

const STORAGE_BASE_URL = "https://ofslnmgvaiycywllsosc.supabase.co/storage/v1/object/public/community_images/";

const getFullImageUrl = (imagePath: string) => {
  if (!imagePath) return "https://placehold.co/800x400/eeeeee/999999?text=No+Photo";
  if (imagePath.startsWith('http') || imagePath.startsWith('blob:')) return imagePath;
  return `${STORAGE_BASE_URL}${imagePath}`;
};

// --- Interfaces (기존 동일) ---
interface CommentData {
  id: string; author: string; author_email: string; text: string; date: string; likes?: number; 
}

interface CommunityPost {
  id: string; author: string; author_email: string; avatar?: string; Title: string;
  content: string; images: string[]; likes: number; comments: number; date: string;
  category: string; commentsList?: CommentData[]; 
}

const getTimeAgo = (dateString: string) => {
  if (!dateString) return "방금 전";
  const commentDate = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - commentDate.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffMins < 1) return "방금 전";
  if (diffMins < 60) return `${diffMins}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;
  return `${commentDate.getFullYear()}.${String(commentDate.getMonth() + 1).padStart(2, '0')}.${String(commentDate.getDate()).padStart(2, '0')}`;
};

// --- Thumbnail Component (블로그형 우측 배치용) ---
const PostThumbnail = ({ images }: { images: string[] }) => {
  if (!images || images.length === 0) return null;
  return (
    <div className="relative w-full h-full group overflow-hidden bg-gray-100 rounded-lg">
      <img 
        src={getFullImageUrl(images[0])} 
        alt="thumbnail" 
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
      />
      {images.length > 1 && (
        <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded font-bold backdrop-blur-sm">
          +{images.length - 1}
        </div>
      )}
    </div>
  );
};

export default function Community() {
  const currentUser = getCurrentUser(); 
  const navigate = useNavigate();
  
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [visibleCount, setVisibleCount] = useState(10); 
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [commentText, setCommentText] = useState("");

  const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
  const authHeaders = { "Content-Type": "application/json", ...(token && { "Authorization": `Bearer ${token}` }) };

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
            date: p.created_at, category: p.category,
            commentsList: p.commentsList?.map((c: any) => ({
              id: c.id, author: c.author, author_email: c.author_email, text: c.text, date: c.created_at, likes: c.likes || 0
            })) || []
          }));
          setPosts(formatted);
          if (currentUser?.email) {
            const { data: myLikes } = await supabase.from('post_likes').select('post_id').eq('user_email', currentUser.email);
            if (myLikes) setLikedIds(new Set(myLikes.map(item => item.post_id)));
          }
        }
      } catch (error) { console.error(error); }
    };
    initData();
  }, [currentUser?.email]);

  const handleLike = async (postId: string) => {
    if (!currentUser) return alert("로그인이 필요합니다.");
    try {
      const response = await fetch(`https://gokgok-8ztf.onrender.com/api/community/${postId}/like`, {
        method: "POST", headers: authHeaders, body: JSON.stringify({ user_email: currentUser.email })
      });
      const data = await response.json();
      if (data.success) {
        setLikedIds((prev) => {
          const next = new Set(prev);
          data.isLiked ? next.add(postId) : next.delete(postId);
          return next;
        });
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: data.likes } : p));
      }
    } catch (e) { alert("좋아요 실패"); }
  };

  const handleCommentSubmit = async () => {
    if (!currentUser || !commentText.trim() || !selectedPost) return;
    try {
      const res = await fetch(`https://gokgok-8ztf.onrender.com/api/community/${selectedPost.id}/comments`, {
        method: "POST", headers: authHeaders, body: JSON.stringify({ author: currentUser.name, author_email: currentUser.email, text: commentText })
      });
      const data = await res.json();
      if (data.success) {
        const newComment = { id: data.comment.id, author: data.comment.author, author_email: data.comment.author_email, text: data.comment.text, date: data.comment.created_at, likes: 0 };
        setPosts(posts.map(p => p.id === selectedPost.id ? { ...p, comments: p.comments + 1, commentsList: [...(p.commentsList || []), newComment] } : p));
        setSelectedPost(prev => prev ? { ...prev, comments: prev.comments + 1, commentsList: [...(prev.commentsList || []), newComment] } : null);
        setCommentText(""); 
      }
    } catch (e) { alert("실패"); }
  };

  const filteredPosts = posts.filter(p => p.Title.toLowerCase().includes(searchTerm.toLowerCase()) || p.author.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-white relative font-sans">
      <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="w-full py-16 px-4">
        <div className="max-w-4xl mx-auto">
          
          {/* Header - [다크 포인트 + 블로그 감성] */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b-2 border-gray-900 pb-10">
            <div className="text-left">
              <h1 className="text-4xl font-black text-gray-900 mb-3 tracking-tighter">곡곡 수다방</h1>
              <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.3em]">Sharing Your Moments</p>
            </div>
            <Button 
              className="bg-gray-900 hover:bg-black text-white rounded-lg px-8 h-12 text-sm font-black shadow-lg active:scale-95 gap-2 transition-all" 
              onClick={() => navigate("/community/write")}
            >
              <Pencil className="w-4 h-4" /> 포스트 쓰기
            </Button>
          </div>

          {/* Search - [다크 회색 박스] */}
          <div className="mb-14 relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text" placeholder="작성자 또는 제목으로 검색해보세요" 
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full pl-14 pr-6 py-4.5 bg-gray-900 border-none rounded-xl outline-none font-bold text-white placeholder:text-gray-600 shadow-xl" 
            />
          </div>

          {/* Post List - [네이버 블로그 목록형 레이아웃] */}
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="flex flex-col">
            {filteredPosts.slice(0, visibleCount).map((post) => (
              <motion.div key={post.id} variants={staggerItem} className="border-b border-gray-100 last:border-none">
                <div 
                  className="group flex flex-col py-8 hover:bg-gray-50/50 transition-colors cursor-pointer px-2" 
                  onClick={() => setSelectedPost(post)}
                >
                  {/* 블로그 프로필 영역 */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100 text-[10px] font-bold text-blue-500 italic uppercase">
                      {post.author[0]}
                    </div>
                    <span className="text-[13px] font-black text-gray-800">{post.author}</span>
                    <span className="text-[12px] text-gray-300 font-medium">· {getTimeAgo(post.date)}</span>
                    <Badge variant="outline" className={`ml-auto border-none font-bold text-[10px] px-2 ${getCategoryColor(post.category)}`}>
                      {post.category}
                    </Badge>
                  </div>

                  {/* 블로그 콘텐츠 영역 (제목/본문 요약 + 우측 썸네일) */}
                  <div className="flex gap-6 items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[19px] font-black text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1 tracking-tight">
                        {post.Title}
                      </h3>
                      <p className="text-[14.5px] text-gray-500 leading-relaxed line-clamp-2 font-medium mb-4">
                        {post.content}
                      </p>
                      
                      {/* 메타 정보 (좋아요/댓글 - 축제 페이지 색감 적용) */}
                      <div className="flex items-center gap-4" onClick={(e) => e.stopPropagation()}>
                        <button 
                          onClick={() => handleLike(post.id)} 
                          className={`flex items-center gap-1 transition-all active:scale-75 ${likedIds.has(post.id) ? "text-[#FF3478]" : "text-gray-300 hover:text-[#FF3478]"}`}
                        >
                          <Heart className="w-4 h-4" fill={likedIds.has(post.id) ? "currentColor" : "none"} strokeWidth={2.5} />
                          <span className="text-[13px] font-bold">{post.likes}</span>
                        </button>
                        <div className="flex items-center gap-1 text-gray-300">
                          <MessageCircle className="w-4 h-4" strokeWidth={2.5} />
                          <span className="text-[13px] font-bold">{post.comments}</span>
                        </div>
                      </div>
                    </div>

                    {/* 우측 썸네일 박스 (사진이 있을 때만 보임) */}
                    {post.images.length > 0 && (
                      <div className="w-24 h-24 md:w-32 md:h-32 shrink-0">
                        <PostThumbnail images={post.images} />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
          
          {visibleCount < filteredPosts.length && (
            <div className="mt-16 text-center border-t pt-10">
              <Button variant="ghost" className="text-gray-400 font-black hover:text-blue-600 transition-all text-sm uppercase tracking-widest" onClick={() => setVisibleCount(v => v + 10)}>
                이전글 더보기 <Plus className="ml-2 w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </motion.div>

      {/* --- Detail Modal (축제/NOL 테마 유지) --- */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/40 backdrop-blur-md p-0 md:p-10" onClick={() => setSelectedPost(null)}>
            <motion.div 
              initial={{ scale: 0.95, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 30 }} 
              onClick={(e) => e.stopPropagation()} 
              className="bg-white w-full h-full md:h-[85vh] max-w-5xl md:rounded-[2rem] shadow-2xl flex flex-col md:flex-row overflow-hidden relative"
            >
              {/* 이미지 영역 */}
              <div className="w-full md:w-[55%] h-[40vh] md:h-full bg-black relative shrink-0">
                <button onClick={() => setSelectedPost(null)} className="absolute top-6 left-6 text-white md:hidden bg-black/40 backdrop-blur-md rounded-full p-2.5"><X className="w-6 h-6" /></button>
              </div>

              {/* 콘텐츠 영역 */}
              <div className="w-full md:w-[45%] flex flex-col h-full bg-white relative">
                <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center font-black text-sm text-white shadow-md uppercase italic">{selectedPost.author[0]}</div>
                    <div className="text-left">
                      <p className="font-black text-[15px] text-gray-900">{selectedPost.author}</p>
                      <p className="text-[11px] text-blue-400 font-bold tracking-tight">{selectedPost.category}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedPost(null)} className="hidden md:block text-gray-300 hover:text-blue-600 transition-colors"><X size={24} strokeWidth={3}/></button>
                </div>

                <div className="p-7 overflow-y-auto flex-1 no-scrollbar space-y-8">
                  <div className="pb-8 border-b border-gray-50">
                    <h2 className="text-2xl font-black text-gray-900 mb-5 leading-tight tracking-tight">{selectedPost.Title}</h2>
                    <p className="text-[15px] text-gray-600 leading-relaxed font-medium whitespace-pre-wrap">{selectedPost.content}</p>
                    <p className="text-[12px] text-gray-300 mt-8 font-bold">{getTimeAgo(selectedPost.date)}</p>
                  </div>

                  <div className="space-y-6">
                    <p className="text-[12px] font-black text-blue-600 uppercase tracking-widest mb-4">Comments ({selectedPost.commentsList?.length || 0})</p>
                    {selectedPost.commentsList?.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-50 shrink-0 flex items-center justify-center text-[10px] font-black text-blue-300 border border-blue-50 uppercase italic">{comment.author[0]}</div>
                        <div className="flex-1 text-left">
                          <p className="text-[14px] text-gray-700 leading-relaxed">
                            <span className="font-black text-gray-900 mr-2 underline underline-offset-2 decoration-blue-100">{comment.author}</span>
                            {comment.text}
                          </p>
                          <p className="text-[11px] text-blue-100 mt-2 font-bold uppercase tracking-tighter">{getTimeAgo(comment.date)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 댓글 입력창 (NOL 스타일 블루 포인트) */}
                <div className="p-6 border-t border-gray-50 bg-white">
                  <div className="flex items-center gap-3 bg-blue-50/50 rounded-2xl px-5 py-4 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-600/10 transition-all">
                    <input 
                      type="text" value={commentText} 
                      onChange={(e) => setCommentText(e.target.value)} 
                      onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit()} 
                      placeholder="축제 이야기를 나눠보세요" 
                      className="flex-1 bg-transparent text-[14px] outline-none font-bold text-gray-700 placeholder:text-blue-200" 
                      disabled={!currentUser} 
                    />
                    <button 
                      onClick={handleCommentSubmit} 
                      disabled={!commentText.trim()} 
                      className="text-blue-600 font-black text-sm disabled:text-blue-200 transition-colors uppercase italic"
                    >
                      Post
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}