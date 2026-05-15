// 주환 - 2026.05.06: 커뮤니티 페이지 (좋아요 토글 복구 및 디버깅 적용)
import { useState, useEffect, useRef } from "react"; 
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Heart, MessageCircle, Share2, User, Search, X, 
  ChevronLeft, ChevronRight, Trash2, Pencil, ImagePlus 
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

// --- Interfaces ---
interface CommentData {
  id: string; author: string; author_email: string; text: string; date: string; likes?: number; 
}

interface CommunityPost {
  id: string; author: string; author_email: string; avatar?: string; Title: string;
  content: string; images: string[]; likes: number; comments: number; date: string;
  category: string; commentsList?: CommentData[]; 
}

// --- Helper Functions ---
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
  if (!images || images.length === 0) return <div className="w-full h-full flex items-center justify-center bg-muted text-sm text-muted-foreground">No Image</div>;

  const next = (e: React.MouseEvent) => { e.stopPropagation(); setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1)); };
  const prev = (e: React.MouseEvent) => { e.stopPropagation(); setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1)); };

  return (
    <div className="relative w-full h-full group bg-black">
      <img 
        src={getFullImageUrl(images[currentIndex])} 
        alt="festival" 
        className={`w-full h-full transition-all duration-300 ${isModal ? 'object-contain' : 'object-cover'}`} 
      />
      {images.length > 1 && (
        <>
          <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100"><ChevronLeft className="w-5 h-5" /></button>
          <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100"><ChevronRight className="w-5 h-5" /></button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, idx) => (<div key={idx} className={`w-1.5 h-1.5 rounded-full ${idx === currentIndex ? "bg-white" : "bg-white/50"}`} />))}
          </div>
        </>
      )}
    </div>
  );
};

export default function Community() {
  const currentUser = getCurrentUser(); 
  const navigate = useNavigate();
  
  // State
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [likedCommentIds, setLikedCommentIds] = useState<Set<string>>(new Set());
  const [visibleCount, setVisibleCount] = useState(4);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());
  const [commentText, setCommentText] = useState("");

  // Edit Modal State
  const [editingPost, setEditingPost] = useState<CommunityPost | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editImages, setEditImages] = useState<string[]>([]);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
  const authHeaders = { "Content-Type": "application/json", ...(token && { "Authorization": `Bearer ${token}` }) };

  // 1. 데이터 불러오기 및 좋아요 상태 복원
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
            // 🚨 디버깅 추가: Supabase에서 데이터 잘 가져오는지 확인
            const { data: myLikes, error: likeError } = await supabase
              .from('post_likes')
              .select('post_id')
              .eq('user_email', currentUser.email);
            
            if (likeError) {
              console.error("❌ Supabase 하트 기록 불러오기 실패:", likeError.message);
            } else if (myLikes) {
              console.log("✅ 내가 누른 하트 데이터 로드 성공:", myLikes);
              setLikedIds(new Set(myLikes.map(item => item.post_id)));
            }
          }
        }
      } catch (error) { console.error("Fetch Error:", error); }
    };
    initData();
  }, [currentUser?.email]);

  // 2.  좋아요 처리 (취소 가능하도록 자물쇠 해제)
  const handleLike = async (postId: string) => {
    if (!currentUser) return alert("로그인이 필요합니다.");
    
    // 취소 불가 로직 삭제됨 (자유롭게 토글 가능)

    try {
      const response = await fetch(`https://gokgok-8ztf.onrender.com/api/community/${postId}/like`, {
        method: "POST", headers: authHeaders, body: JSON.stringify({ user_email: currentUser.email })
      });
      const data = await response.json();
      
      if (data.success) {
        setLikedIds((prev) => {
          const next = new Set(prev);
          if (data.isLiked) {
            next.add(postId);
          } else {
            next.delete(postId);
          }
          return next;
        });
        setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: data.likes } : p));
      }
    } catch (e) { alert("좋아요 처리 실패"); }
  };

  // 3. 댓글 작성
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
        
        // 상세 모달 창의 숫자도 즉시 업데이트
        setSelectedPost(prev => prev ? { ...prev, comments: prev.comments + 1, commentsList: [...(prev.commentsList || []), newComment] } : null);
        
        setCommentText(""); 
      }
    } catch (e) { alert("댓글 작성 실패"); }
  };

  // 나머지 핸들러 (삭제, 검색 등)
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => { setSearchTerm(e.target.value); setVisibleCount(4); };
  const toggleExpand = (id: string) => { setExpandedPosts(prev => {const next = new Set(prev); if (next.has(id)) {next.delete(id);} else {next.add(id);} return next;});};
  const handleLoadMore = () => setVisibleCount(prev => prev + 20);

  const filteredPosts = posts.filter(p => p.Title.toLowerCase().includes(searchTerm.toLowerCase()) || p.author.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-background relative">
      <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="w-full py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div><h1 className="text-4xl font-bold text-foreground mb-2">수다</h1><p className="text-muted-foreground">축제 후기와 사진을 공유해보세요</p></div>
            <Button className="gap-2" onClick={() => navigate("/community/write")}><Plus className="w-7 h-7" /> 글쓰기</Button>
          </div>

          {/* Search */}
          <div className="mb-8 relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center"><Search className="h-5 w-5 text-muted-foreground" /></div>
            <input type="text" placeholder="검색..." value={searchTerm} onChange={handleSearchChange} className="w-full pl-10 pr-4 py-3 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary outline-none" />
          </div>

          {/* Post Grid */}
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPosts.slice(0, visibleCount).map((post) => (
              <motion.div key={post.id} variants={staggerItem}>
                <Card className="overflow-hidden hover:shadow-lg transition-all h-full flex flex-col cursor-pointer" onClick={() => setSelectedPost(post)}>
                  <div className="aspect-video relative overflow-hidden shrink-0 bg-muted">
                    <ImageCarousel images={post.images} />
                  </div>
                  <div className="p-6 flex flex-col flex-1" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><User className="w-5 h-5 text-primary" /></div>
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">{post.author}</p>
                        <p className="text-sm text-muted-foreground">{getTimeAgo(post.date)}</p>
                      </div>
                      <Badge className={getCategoryColor(post.category)}>{post.category}</Badge>
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">{post.Title}</h3>
                    <p className={`text-muted-foreground mb-4 flex-1 ${expandedPosts.has(post.id) ? "" : "line-clamp-2"}`}>{post.content}</p>
                    <div className="flex items-center gap-6 pt-4 border-t mt-auto">
                      
                      {/* 좋아요 버튼 UI 원상복구: 취소할 수 있으므로 hover 시 더 진한 빨간색 표시 */}
                      <button 
                        onClick={() => handleLike(post.id)} 
                        className={`flex items-center gap-2 transition-colors ${
                          likedIds.has(post.id) 
                            ? "text-red-500 hover:text-red-600" 
                            : "text-muted-foreground hover:text-red-500"
                        }`}
                      >
                        <Heart className="w-5 h-5" fill={likedIds.has(post.id) ? "currentColor" : "none"} />
                        <span className="text-sm font-medium">{post.likes}</span>
                      </button>

                      <button onClick={() => setSelectedPost(post)} className="flex items-center gap-2 text-muted-foreground hover:text-primary"><MessageCircle className="w-5 h-5" /> {post.comments}</button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
          {visibleCount < filteredPosts.length && <div className="mt-12 text-center"><Button variant="outline" onClick={handleLoadMore}>더 보기</Button></div>}
        </div>
      </motion.div>

      {/* Detail Modal (선택된 포스트 보기) */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-0 md:p-10" onClick={() => setSelectedPost(null)}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} onClick={(e) => e.stopPropagation()} className="bg-background w-full h-full md:h-[80vh] max-w-6xl md:rounded-xl shadow-xl flex flex-col md:flex-row overflow-hidden">
              <div className="w-full md:w-[55%] bg-black flex items-center justify-center relative min-h-[30vh]">
                <ImageCarousel images={selectedPost.images} isModal={true} />
                <button onClick={() => setSelectedPost(null)} className="absolute top-4 left-4 text-white md:hidden bg-black/50 rounded-full p-2"><X className="w-5 h-5" /></button>
              </div>
              <div className="w-full md:w-[45%] flex flex-col h-full bg-background">
                <div className="flex items-center justify-between p-4 border-b">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"><User className="w-4 h-4 text-primary" /></div>
                    <div className="text-left"><p className="font-semibold text-sm">{selectedPost.author}</p><p className="text-xs text-muted-foreground">{selectedPost.Title}</p></div>
                  </div>
                  <button onClick={() => setSelectedPost(null)} className="hidden md:block"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-6">
                  <div className="flex gap-3 pb-4 border-b">
                    <div className="w-8 h-8 rounded-full bg-primary/10 shrink-0 flex items-center justify-center"><User className="w-4 h-4 text-primary" /></div>
                    <div className="text-left">
                      <span className="font-semibold text-sm mr-2">{selectedPost.author}</span>
                      <span className="text-sm whitespace-pre-wrap">{selectedPost.content}</span>
                      <p className="text-xs text-muted-foreground mt-2">{getTimeAgo(selectedPost.date)}</p>
                    </div>
                  </div>
                  {/* 댓글 리스트 */}
                  {(!selectedPost.commentsList || selectedPost.commentsList.length === 0) ? (
                    <p className="text-center text-muted-foreground py-12 text-sm">아직 작성된 댓글이 없습니다.<br/>첫 댓글을 남겨보세요!</p>
                  ) : (
                    selectedPost.commentsList.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted shrink-0 flex items-center justify-center"><User className="w-4 h-4 text-muted-foreground" /></div>
                        <div className="flex-1">
                          <p className="text-sm text-foreground"><span className="font-semibold mr-2">{comment.author}</span>{comment.text}</p>
                          <p className="text-xs text-muted-foreground mt-1">{getTimeAgo(comment.date)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-4 border-t flex items-center gap-3">
                  <input type="text" value={commentText} onChange={(e) => setCommentText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit()} placeholder="댓글 달기..." className="flex-1 bg-transparent text-sm outline-none" disabled={!currentUser} />
                  <button onClick={handleCommentSubmit} disabled={!commentText.trim()} className="text-primary font-semibold text-sm">게시</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}