// 주환 - 2026.05.15: 커뮤니티 페이지 (4단 그리드 레이아웃 유지 + 상단 헤더/검색창 크기 안정화)
import { useState, useEffect } from "react"; 
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Heart, MessageCircle, Search, X, 
  Trash2, Pencil
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

const PostThumbnail = ({ images }: { images: string[] }) => {
  if (!images || images.length === 0) return null;
  return (
    <div className="relative w-full h-full group overflow-hidden bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
      <img 
        src={getFullImageUrl(images[0])} 
        alt="thumbnail" 
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
      />
      {images.length > 1 && (
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-2 py-1 rounded-md font-bold backdrop-blur-sm">
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
  const [visibleCount, setVisibleCount] = useState(12);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [commentText, setCommentText] = useState("");

  const [editingPost, setEditingPost] = useState<CommunityPost | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editImages, setEditImages] = useState<FileList | null>(null);

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
            const likesResponse = await fetch("https://gokgok-8ztf.onrender.com/api/community/my-likes", {
              method: "POST", headers: authHeaders, body: JSON.stringify({ user_email: currentUser.email })
            });
            const likesData = await likesResponse.json();
            if (likesData.success && likesData.likes) {
              setLikedIds(new Set(likesData.likes.map((item: any) => item.post_id)));
            }
          }
        }
      } catch (error) { console.error(error); }
    };
    initData();
  }, [currentUser?.email]);

  const handleLike = async (e: React.MouseEvent, postId: string) => {
    e.stopPropagation(); 
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
        if (selectedPost?.id === postId) {
          setSelectedPost(prev => prev ? { ...prev, likes: data.likes } : null);
        }
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

  const handleDeleteComment = async (postId: string, commentId: string) => {
    if (!currentUser) return;
    if (!window.confirm("이 댓글을 삭제하시겠습니까?")) return;

    try {
      const response = await fetch(`https://gokgok-8ztf.onrender.com/api/community/${postId}/comments/${commentId}`, {
        method: "DELETE", headers: authHeaders, body: JSON.stringify({ author_email: currentUser.email })
      });
      const data = await response.json();
      if (data.success) {
        setPosts(posts.map(p => {
          if (p.id === postId) {
            return { ...p, comments: Math.max(0, p.comments - 1), commentsList: p.commentsList?.filter(c => c.id !== commentId) };
          }
          return p;
        }));
        if (selectedPost && selectedPost.id === postId) {
          setSelectedPost({ ...selectedPost, comments: Math.max(0, selectedPost.comments - 1), commentsList: selectedPost.commentsList?.filter(c => c.id !== commentId) });
        }
      } else {
        alert(data.message || "삭제 권한이 없습니다.");
      }
    } catch (e) {
      alert("댓글 삭제 실패");
    }
  };

  const handleDelete = async (postId: string) => {
    if (!currentUser) return;
    if (!window.confirm("정말로 이 게시글을 삭제하시겠습니까?")) return;

    try {
      const response = await fetch(`https://gokgok-8ztf.onrender.com/api/community/${postId}`, {
        method: "DELETE", headers: authHeaders, body: JSON.stringify({ author_email: currentUser.email }) 
      });
      const data = await response.json();
      
      if (data.success) {
        alert("게시글이 삭제되었습니다.");
        setPosts(prev => prev.filter(p => p.id !== postId));
        setSelectedPost(null); 
      } else {
        alert(data.message || "삭제 권한이 없습니다.");
      }
    } catch (e) { alert("삭제 처리 중 오류가 발생했습니다."); }
  };

  const openEditModal = (post: CommunityPost) => {
    setEditingPost(post);
    setEditTitle(post.Title);
    setEditContent(post.content);
    setEditImages(null);
  };

  const handleEditSubmit = async () => {
    if (!editingPost || !currentUser) return;
    if (!editTitle.trim() || !editContent.trim()) return alert("제목과 내용을 모두 입력해주세요.");

    try {
      const formData = new FormData();
      formData.append("author_email", currentUser.email);
      formData.append("title", editTitle);
      formData.append("content", editContent);

      if (editImages && editImages.length > 0) {
        Array.from(editImages).forEach(file => formData.append("images", file));
      } else {
        editingPost.images.forEach(img => formData.append("images", img));
      }

      const response = await fetch(`https://gokgok-8ztf.onrender.com/api/community/${editingPost.id}`, {
        method: "PUT", headers: formDataHeaders, body: formData
      });
      const data = await response.json();

      if (data.success) {
        alert("게시글이 성공적으로 수정되었습니다.");
        const updatedImages = data.post.images || editingPost.images;
        setPosts(prev => prev.map(p => p.id === editingPost.id ? { ...p, Title: editTitle, content: editContent, images: updatedImages } : p));
        if (selectedPost && selectedPost.id === editingPost.id) {
          setSelectedPost(prev => prev ? { ...prev, Title: editTitle, content: editContent, images: updatedImages } : null);
        }
        setEditingPost(null); 
      } else {
        alert(data.message || "수정 권한이 없습니다.");
      }
    } catch (e) {
      alert("수정 처리 중 오류가 발생했습니다.");
    }
  };

  const filteredPosts = posts.filter(p => p.Title.toLowerCase().includes(searchTerm.toLowerCase()) || p.author.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-white dark:bg-[#111111] transition-colors relative font-sans text-[#111111] dark:text-white pb-20">
      {/* ✅ md:px-10 추가하여 모바일 외 환경에서도 안정적인 여백 제공 */}
      <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="w-full pt-12 pb-16 px-4 md:px-10">
        
        {/* ✅ max-w를 1200px로 조절하여 마당 페이지와 통일감 형성 & 상단 버튼 찢어짐 방지 */}
        <div className="max-w-[1200px] mx-auto">
          
          {/* 헤더 영역 */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div className="text-left">
              <h1 className="text-[32px] font-black text-gray-900 dark:text-white mb-2 tracking-tight">수다</h1>
              <p className="text-gray-400 font-medium text-sm tracking-wide">여행의 즐거움을 함께 나누세요.</p>
            </div>
          </div>

          {/* 검색 및 글쓰기 영역 */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-10">
            {/* ✅ 검색창 폭을 다시 원래의 보기 좋은 비율(lg:w-1/2)로 복구 */}
            <div className="relative w-full md:w-2/3 lg:w-1/2 group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-[#111111] dark:group-focus-within:text-white transition-colors" />
              <input 
                type="text" placeholder="작성자 또는 제목으로 검색해보세요" 
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} 
                className="w-full pl-14 pr-6 h-[54px] bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-2xl outline-none font-medium text-gray-900 dark:text-white placeholder:text-gray-400 focus:border-gray-300 dark:focus:border-gray-600 shadow-sm hover:shadow transition-all" 
              />
            </div>
            
            <Button 
              className="w-full md:w-auto h-[54px] bg-white dark:bg-[#1a1a1a] hover:bg-gray-50 dark:hover:bg-[#222] text-gray-900 dark:text-white border border-gray-200 dark:border-gray-800 rounded-2xl px-8 text-[15px] font-bold shadow-sm hover:shadow active:scale-95 flex items-center justify-center gap-2 transition-all shrink-0" 
              onClick={() => navigate("/community/write")}
            >
              <Pencil className="w-4 h-4" /> 포스트 쓰기
            </Button>
          </div>

          {/* 게시글 목록 (4단 그리드 레이아웃) */}
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
            {filteredPosts.slice(0, visibleCount).map((post) => (
              <motion.div key={post.id} variants={staggerItem}>
                <div 
                  className="group bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-700 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full" 
                  onClick={() => setSelectedPost(post)}
                >
                  <div className="flex flex-col flex-1">
                    {/* 카드 중앙: 이미지 썸네일 */}
                    <div className="w-full aspect-[4/3] shrink-0 mb-4">
                      {post.images.length > 0 ? (
                        <PostThumbnail images={post.images} />
                      ) : (
                        <div className="w-full h-full bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center border border-gray-100 dark:border-gray-700">
                          <span className="text-gray-300 dark:text-gray-600 font-bold text-sm">No Photo</span>
                        </div>
                      )}
                    </div>

                    {/* 카드 상단: 작성자 및 카테고리 정보 */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-[10px] font-extrabold text-gray-700 dark:text-gray-200 uppercase">
                          {post.author[0]}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[12px] font-extrabold text-gray-900 dark:text-white line-clamp-1">{post.author}</span>
                          <span className="text-[10px] text-gray-400 font-medium">{getTimeAgo(post.date)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold text-[10px] px-2 py-0.5 rounded-full">
                          {post.category}
                        </Badge>
                        
                        {/* 내 글일 때만 보이는 수정/삭제 버튼 */}
                        {currentUser?.email === post.author_email && (
                          <div className="flex items-center gap-1.5 border-l border-gray-100 dark:border-gray-800 pl-2">
                            <button onClick={(e) => { e.stopPropagation(); openEditModal(post); }} className="text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors p-1"><Pencil className="w-3.5 h-3.5" /></button>
                            <button onClick={(e) => { e.stopPropagation(); handleDelete(post.id); }} className="text-gray-300 hover:text-red-500 transition-colors p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 카드 하단: 제목 및 내용 */}
                    <h3 className="text-[16px] font-extrabold text-gray-900 dark:text-white mb-1.5 group-hover:text-[#FF3478] dark:group-hover:text-[#FF3478] transition-colors line-clamp-1 tracking-tight">
                      {post.Title}
                    </h3>
                    <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2 font-medium mb-4">
                      {post.content}
                    </p>
                  </div>
                  
                  {/* 카드 맨 아래: 좋아요 및 댓글 수 */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800 mt-auto">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={(e) => handleLike(e, post.id)} 
                        className={`flex items-center gap-1.5 transition-all active:scale-75 ${likedIds.has(post.id) ? "text-[#FF3478]" : "text-gray-400 hover:text-[#FF3478]"}`}
                      >
                        <Heart className="w-4 h-4" fill={likedIds.has(post.id) ? "currentColor" : "none"} strokeWidth={2.5} />
                        <span className="text-[12px] font-bold">{post.likes}</span>
                      </button>
                      <div className="flex items-center gap-1.5 text-gray-400">
                        <MessageCircle className="w-4 h-4" strokeWidth={2.5} />
                        <span className="text-[12px] font-bold">{post.comments}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
          
          {/* 더보기 버튼 */}
          {visibleCount < filteredPosts.length && (
            <div className="mt-12 text-center">
              <Button variant="outline" className="rounded-full px-8 py-6 text-gray-900 dark:text-white font-bold border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#222] bg-white dark:bg-[#1a1a1a] shadow-sm transition-all text-sm" onClick={() => setVisibleCount(v => v + 12)}>
                게시글 더보기 <Plus className="ml-2 w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </motion.div>

      {/* --- Detail Modal (축제 카드 스타일 적용) --- */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-0 md:p-10" onClick={() => setSelectedPost(null)}>
            <motion.div 
              initial={{ scale: 0.95, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 30 }} 
              onClick={(e) => e.stopPropagation()} 
              className="bg-white dark:bg-[#1a1a1a] w-full h-full md:h-[85vh] max-w-5xl md:rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row overflow-hidden relative"
            >
              <div className="w-full md:w-[55%] h-[40vh] md:h-full bg-gray-50 dark:bg-black relative shrink-0 border-r border-gray-100 dark:border-gray-800">
                {selectedPost.images.length > 0 ? (
                  <img src={getFullImageUrl(selectedPost.images[0])} alt="detail" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium">No Image</div>
                )}
                <button onClick={() => setSelectedPost(null)} className="absolute top-6 left-6 text-white md:hidden bg-black/40 backdrop-blur-md rounded-full p-2.5"><X className="w-6 h-6" /></button>
              </div>

              <div className="w-full md:w-[45%] flex flex-col flex-1 bg-white dark:bg-[#1a1a1a] relative min-h-0">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center font-extrabold text-sm text-gray-700 dark:text-gray-200 uppercase">{selectedPost.author[0]}</div>
                    <div className="text-left">
                      <p className="font-extrabold text-[15px] text-gray-900 dark:text-white">{selectedPost.author}</p>
                      <p className="text-[11px] text-[#FF3478] font-bold tracking-tight">{selectedPost.category}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {currentUser?.email === selectedPost.author_email && (
                      <div className="flex items-center gap-3 mr-2">
                        <button onClick={() => openEditModal(selectedPost)} className="text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"><Pencil size={18}/></button>
                        <button onClick={() => handleDelete(selectedPost.id)} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
                      </div>
                    )}
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
                    {selectedPost.commentsList?.map((comment) => (
                      <div key={comment.id} className="flex gap-3 relative group">
                        <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shrink-0 flex items-center justify-center text-[10px] font-black text-gray-700 dark:text-gray-200 uppercase">{comment.author[0]}</div>
                        <div className="flex-1 text-left pr-6">
                          <p className="text-[14px] text-gray-700 dark:text-gray-300 leading-relaxed">
                            <span className="font-extrabold text-gray-900 dark:text-white mr-2">{comment.author}</span>
                            {comment.text}
                          </p>
                          <p className="text-[11px] text-gray-400 mt-1.5 font-bold tracking-tighter">{getTimeAgo(comment.date)}</p>
                        </div>
                        
                        {currentUser?.email === comment.author_email && (
                          <button 
                            onClick={() => handleDeleteComment(selectedPost.id, comment.id)} 
                            className="absolute top-0 right-0 text-gray-300 hover:text-red-500 p-1 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <X size={14} strokeWidth={3}/>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 모달 하단 댓글 입력창 */}
                <div className="p-5 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a1a1a] shrink-0">
                  <div className="flex items-center gap-3 bg-gray-50 dark:bg-[#222] border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-3 focus-within:bg-white dark:focus-within:bg-[#1a1a1a] focus-within:ring-2 focus-within:ring-gray-200 dark:focus-within:ring-gray-700 transition-all shadow-sm">
                    <input 
                      type="text" 
                      value={commentText} 
                      onChange={(e) => setCommentText(e.target.value)} 
                      onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit()} 
                      placeholder={currentUser ? "축제 이야기를 나눠보세요" : "로그인 후 댓글을 남길 수 있습니다."} 
                      className="flex-1 bg-transparent text-[14px] outline-none font-medium text-gray-900 dark:text-white placeholder:text-gray-400" 
                      readOnly={!currentUser}
                      onClick={() => { if (!currentUser) alert("댓글을 작성하려면 먼저 로그인해주세요!"); }}
                    />
                    <button 
                      onClick={handleCommentSubmit} 
                      disabled={!currentUser || !commentText.trim()} 
                      className="text-gray-900 dark:text-white font-bold text-sm disabled:text-gray-300 dark:disabled:text-gray-600 transition-colors"
                    >
                      게시
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Edit Modal (수정창) --- */}
      <AnimatePresence>
        {editingPost && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white dark:bg-[#1a1a1a] w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col border border-gray-100 dark:border-gray-800">
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-[#1a1a1a]">
                <h3 className="font-extrabold text-xl text-gray-900 dark:text-white tracking-tight">게시글 수정</h3>
                <button onClick={() => setEditingPost(null)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"><X className="w-6 h-6" /></button>
              </div>
              <div className="p-8 flex flex-col gap-6">
                <div>
                  <label className="text-[13px] font-extrabold text-gray-900 dark:text-gray-200 mb-2 block">제목</label>
                  <input 
                    value={editTitle} onChange={e => setEditTitle(e.target.value)} 
                    className="w-full bg-gray-50 dark:bg-[#222] border border-gray-200 dark:border-gray-700 rounded-2xl p-4 font-bold text-gray-900 dark:text-white outline-none focus:bg-white dark:focus:bg-[#1a1a1a] focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700 transition-all shadow-sm" 
                    placeholder="제목을 입력하세요" 
                  />
                </div>
                <div>
                  <label className="text-[13px] font-extrabold text-gray-900 dark:text-gray-200 mb-2 block">내용</label>
                  <textarea 
                    value={editContent} onChange={e => setEditContent(e.target.value)} 
                    className="w-full h-48 bg-gray-50 dark:bg-[#222] border border-gray-200 dark:border-gray-700 rounded-2xl p-4 font-medium text-gray-700 dark:text-gray-300 outline-none focus:bg-white dark:focus:bg-[#1a1a1a] focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700 resize-none transition-all shadow-sm" 
                    placeholder="내용을 입력하세요" 
                  />
                </div>
                <div>
                  <label className="text-[13px] font-extrabold text-gray-900 dark:text-gray-200 mb-2 block">사진 변경 (선택)</label>
                  <input 
                    type="file" multiple accept="image/*" 
                    onChange={(e) => setEditImages(e.target.files)} 
                    className="text-sm text-gray-500 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border file:border-gray-200 dark:file:border-gray-700 file:text-[13px] file:font-bold file:bg-white dark:file:bg-[#222] file:text-gray-900 dark:file:text-white hover:file:bg-gray-50 dark:hover:file:bg-gray-800 transition-colors cursor-pointer file:shadow-sm" 
                  />
                  <p className="text-[11px] text-gray-400 mt-2 font-medium">* 새 이미지를 등록하면 기존 이미지는 모두 덮어씌워집니다.</p>
                </div>
              </div>
              <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3 bg-white dark:bg-[#1a1a1a]">
                <Button variant="outline" className="font-bold text-gray-600 dark:text-gray-300 bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#222] rounded-full px-6 shadow-sm" onClick={() => setEditingPost(null)}>취소</Button>
                <Button className="bg-gray-900 dark:bg-white hover:bg-black dark:hover:bg-gray-200 text-white dark:text-black font-bold px-8 rounded-full shadow-md" onClick={handleEditSubmit}>수정 완료</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}