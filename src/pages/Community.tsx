// 주환 - 2026.05.06: 커뮤니티 페이지 (축제 페이지 테마 색감 적용)
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

// --- Carousel Component ---
const ImageCarousel = ({ images, isModal = false }: { images: string[], isModal?: boolean }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  if (!images || images.length === 0) return <div className="w-full h-full flex items-center justify-center bg-blue-50/30 text-xs text-blue-200 font-medium">No Photo</div>;

  const next = (e: React.MouseEvent) => { e.stopPropagation(); setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1)); };
  const prev = (e: React.MouseEvent) => { e.stopPropagation(); setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1)); };

  return (
    <div className="relative w-full h-full group overflow-hidden bg-gray-900">
      <img 
        src={getFullImageUrl(images[currentIndex])} 
        alt="post" 
        className={`w-full h-full transition-all duration-500 ${isModal ? 'object-contain' : 'object-cover group-hover:scale-105'}`} 
      />
      {images.length > 1 && (
        <div className="absolute bottom-3 right-3 bg-black/40 text-white text-[10px] px-2.5 py-1 rounded-lg backdrop-blur-md font-bold">
          {currentIndex + 1} / {images.length}
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
  const [visibleCount, setVisibleCount] = useState(5); 
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
    } catch (e) { alert("댓글 작성 실패"); }
  };

  const filteredPosts = posts.filter(p => p.Title.toLowerCase().includes(searchTerm.toLowerCase()) || p.author.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-white relative font-sans">
      <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="w-full py-16 px-4">
        <div className="max-w-4xl mx-auto">
          
          {/* Header (NOL Blue 테마 적용) */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-blue-50 pb-8">
            <div className="text-left">
              <h1 className="text-4xl font-black text-gray-900 mb-3 tracking-tighter">수다 <span className="text-blue-600">.</span></h1>
              <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">Festival Stories</p>
            </div>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-7 h-12 text-sm font-black shadow-lg shadow-blue-600/20 active:scale-95 gap-2 transition-all" 
              onClick={() => navigate("/community/write")}
            >
              <Pencil className="w-4 h-4 stroke-[3]" /> 글쓰기
            </Button>
          </div>

          {/* Search (Light Blue Tint) */}
          <div className="mb-12 relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-400 group-focus-within:text-blue-600 transition-colors" />
            <input 
              type="text" placeholder="궁금한 축제나 작성자를 검색해보세요" 
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full pl-14 pr-6 py-4.5 bg-blue-50/40 border-2 border-transparent focus:border-blue-500/20 focus:bg-white rounded-2xl outline-none font-bold text-gray-700 placeholder:text-blue-300 transition-all shadow-sm" 
            />
          </div>

          {/* Post List */}
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="flex flex-col gap-8">
            {filteredPosts.slice(0, visibleCount).map((post) => (
              <motion.div key={post.id} variants={staggerItem}>
                <Card 
                  className="group bg-white rounded-[2rem] border border-gray-100 hover:border-blue-600/20 hover:shadow-2xl hover:shadow-blue-600/10 transition-all duration-500 overflow-hidden cursor-pointer" 
                  onClick={() => setSelectedPost(post)}
                >
                  <div className="flex flex-col md:flex-row h-full">
                    {/* [좌] 이미지 */}
                    <div className="w-full md:w-[260px] aspect-[4/3] md:aspect-square shrink-0">
                      <ImageCarousel images={post.images} />
                    </div>

                    {/* [우] 텍스트 */}
                    <div className="p-8 flex flex-col flex-1 justify-between bg-white">
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <Badge className={`${getCategoryColor(post.category)} text-[10px] font-black rounded-lg px-2.5 py-1 border-none shadow-sm`}>
                            {post.category}
                          </Badge>
                          <span className="text-[12px] text-blue-300 font-bold tracking-tight">{getTimeAgo(post.date)}</span>
                        </div>
                        <h3 className="text-xl font-black text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-1 tracking-tight">
                          {post.Title}
                        </h3>
                        <p className="text-[14.5px] text-gray-500 leading-relaxed line-clamp-2 mb-6 font-medium">
                          {post.content}
                        </p>
                      </div>

                      <div className="flex items-center justify-between border-t border-blue-50 pt-5" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center border border-blue-100"><User className="w-3.5 h-3.5 text-blue-400" /></div>
                          <span className="text-[14px] font-black text-gray-800">{post.author}</span>
                        </div>
                        <div className="flex items-center gap-5">
                          <button 
                            onClick={() => handleLike(post.id)} 
                            className={`flex items-center gap-1.5 transition-all active:scale-75 ${likedIds.has(post.id) ? "text-[#FF3478]" : "text-gray-300 hover:text-[#FF3478]"}`}
                          >
                            <Heart className="w-5 h-5" fill={likedIds.has(post.id) ? "currentColor" : "none"} strokeWidth={2.5} />
                            <span className="text-[14px] font-black">{post.likes}</span>
                          </button>
                          <div className="flex items-center gap-1.5 text-gray-300">
                            <MessageCircle className="w-5 h-5" strokeWidth={2.5} />
                            <span className="text-[14px] font-black">{post.comments}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
          
          {visibleCount < filteredPosts.length && (
            <div className="mt-16 text-center">
              <Button variant="ghost" className="text-blue-400 font-black hover:text-blue-600 hover:bg-blue-50 rounded-full px-10 h-12 transition-all" onClick={() => setVisibleCount(v => v + 10)}>
                더 많은 이야기 보기
              </Button>
            </div>
          )}
        </div>
      </motion.div>

      {/* --- Detail Modal (Blue & Pink 테마 적용) --- */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-blue-900/40 backdrop-blur-md p-0 md:p-8" onClick={() => setSelectedPost(null)}>
            <motion.div 
              initial={{ scale: 0.9, y: 40, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 40, opacity: 0 }} 
              onClick={(e) => e.stopPropagation()} 
              className="bg-white w-full h-full md:h-[85vh] max-w-5xl md:rounded-[2.5rem] shadow-[0_30px_100px_-20px_rgba(0,0,0,0.3)] flex flex-col md:flex-row overflow-hidden"
            >
              {/* [좌] 이미지 */}
              <div className="w-full md:w-[58%] bg-gray-950 flex items-center justify-center relative shrink-0">
                <ImageCarousel images={selectedPost.images} isModal={true} />
                <button onClick={() => setSelectedPost(null)} className="absolute top-6 left-6 text-white md:hidden bg-black/40 backdrop-blur-md rounded-full p-2.5"><X className="w-6 h-6" /></button>
              </div>

              {/* [우] 콘텐츠 */}
              <div className="w-full md:w-[42%] flex flex-col h-full bg-white">
                <div className="p-7 border-b border-blue-50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center font-black text-sm text-white shadow-md shadow-blue-600/20 uppercase italic">{selectedPost.author[0]}</div>
                    <div className="text-left">
                      <p className="font-black text-[15px] text-gray-900 leading-none mb-1">{selectedPost.author}</p>
                      <p className="text-[11px] text-blue-400 font-black tracking-tighter uppercase">{selectedPost.category}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedPost(null)} className="hidden md:block text-gray-300 hover:text-blue-600 transition-colors"><X size={24} strokeWidth={3}/></button>
                </div>

                <div className="p-8 overflow-y-auto flex-1 no-scrollbar space-y-8">
                  <div className="pb-8 border-b border-blue-50/50">
                    <h2 className="text-2xl font-black text-gray-900 mb-5 tracking-tight leading-tight">{selectedPost.Title}</h2>
                    <p className="text-[15px] text-gray-600 leading-relaxed font-medium whitespace-pre-wrap">{selectedPost.content}</p>
                    <p className="text-[11px] text-blue-200 mt-8 font-black tracking-widest uppercase">{getTimeAgo(selectedPost.date)}</p>
                  </div>

                  <div className="space-y-5">
                    <p className="text-[11px] font-black text-blue-600 uppercase tracking-[0.2em] mb-6">Comments ({selectedPost.commentsList?.length || 0})</p>
                    {selectedPost.commentsList?.map((comment) => (
                      <div key={comment.id} className="flex gap-4 group">
                        <div className="w-8 h-8 rounded-full bg-blue-50 shrink-0 flex items-center justify-center text-[10px] font-black text-blue-300 border border-blue-100 uppercase">{comment.author[0]}</div>
                        <div className="flex-1 text-left">
                          <p className="text-[14px] text-gray-700 leading-relaxed">
                            <span className="font-black text-gray-900 mr-2">{comment.author}</span>
                            {comment.text}
                          </p>
                          <p className="text-[10px] text-blue-200 mt-2 font-bold">{getTimeAgo(comment.date)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 댓글 입력 (NOL 스타일 블루 포인트) */}
                <div className="p-7 border-t border-blue-50 bg-white shadow-[0_-10px_40px_-20px_rgba(0,0,0,0.05)]">
                  <div className="flex items-center gap-3 bg-blue-50/50 rounded-2xl px-5 py-4 transition-all focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-600/10">
                    <input 
                      type="text" value={commentText} 
                      onChange={(e) => setCommentText(e.target.value)} 
                      onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit()} 
                      placeholder="축제 후기에 댓글을 남겨보세요" 
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