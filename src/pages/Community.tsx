// 주환 - 2026.03.20: 커뮤니티 페이지
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Heart, MessageCircle, Share2, User, Search, X, ChevronLeft, ChevronRight, Trash2, Pencil } from "lucide-react"; 
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";
import { getCategoryColor } from "@/lib/index";
import { getCurrentUser } from "@/lib/login"; 

interface CommentData {
  id: string;
  author: string;
  text: string;
  date: string;
  likes?: number; 
}

interface CommunityPost {
  id: string;
  author: string;
  avatar?: string;
  Title: string;
  content: string;
  images: string[];
  likes: number;
  comments: number;
  date: string;
  category: string;
  commentsList?: CommentData[]; 
}

const getTimeAgo = (dateString: string) => {
  if (!dateString) return "방금 전";
  if (!dateString.includes("T")) return dateString;

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

  const year = commentDate.getFullYear();
  const month = String(commentDate.getMonth() + 1).padStart(2, '0');
  const day = String(commentDate.getDate()).padStart(2, '0');
  
  return `${year}.${month}.${day}`;
};

const ImageCarousel = ({ images, isModal = false }: { images: string[], isModal?: boolean }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const next = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };
  
  const prev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  return (
    <div className="relative w-full h-full group bg-black">
      <img src={images[currentIndex]} alt="festival" className={`w-full h-full transition-all duration-300 ${isModal ? 'object-contain' : 'object-cover'}`} />
      {images.length > 1 && (
        <>
          <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"><ChevronLeft className="w-5 h-5" /></button>
          <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"><ChevronRight className="w-5 h-5" /></button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {images.map((_, idx) => (<div key={idx} className={`w-1.5 h-1.5 rounded-full transition-colors ${idx === currentIndex ? "bg-white" : "bg-white/50"}`} />))}
          </div>
          <div className="absolute top-3 right-3 bg-black/60 text-white text-xs font-medium px-2.5 py-1 rounded-full z-10">
            {currentIndex + 1} / {images.length}
          </div>
        </>
      )}
    </div>
  );
};

export default function Community() {
  const currentUser = getCurrentUser(); 
  const navigate = useNavigate();
  
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [editingPost, setEditingPost] = useState<CommunityPost | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [likedCommentIds, setLikedCommentIds] = useState<Set<string>>(new Set());
  const [visibleCount, setVisibleCount] = useState(4);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());
  const [commentText, setCommentText] = useState("");

  const token = localStorage.getItem('token');
  const authHeaders = {
    "Content-Type": "application/json",
    ...(token && { "Authorization": `Bearer ${token}` })
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/api/community"); // IPv4 주소로 변경
        const data = await response.json();
        
        if (data.success) {
          const formattedPosts = data.posts.map((p: any) => ({
            id: p.id,
            author: p.author,
            Title: p.title, 
            content: p.content,
            images: p.images || [],
            likes: p.likes || 0,
            comments: p.commentsList ? p.commentsList.length : 0,
            date: p.created_at,
            category: p.category,
            commentsList: p.commentsList?.map((c: any) => ({
              id: c.id,
              author: c.author,
              text: c.text,
              date: c.created_at,
              likes: c.likes || 0
            })) || []
          }));
          setPosts(formattedPosts);
        }
      } catch (error) {
        console.error("데이터 불러오기 실패:", error);
      }
    };
    fetchPosts();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => { setSearchTerm(e.target.value); setVisibleCount(4); };
  const handleLoadMore = () => setVisibleCount((prev) => prev + 20); 

  const toggleExpand = (id: string) => {
    setExpandedPosts(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleDeletePost = async (e: React.MouseEvent, postId: string) => {
    e.stopPropagation(); 
    if (window.confirm("정말로 이 게시물을 삭제하시겠습니까?")) {
      try {
        const response = await fetch(`http://127.0.0.1:5000/api/community/${postId}`, {
          method: "DELETE",
          headers: authHeaders
        });
        if (response.ok) {
          setPosts(posts.filter(post => post.id !== postId));
        } else {
          alert("삭제 권한이 없거나 오류가 발생했습니다.");
        }
      } catch (error) {
        alert("서버 통신 오류가 발생했습니다.");
      }
    }
  };

  const openEditModal = (e: React.MouseEvent, post: CommunityPost) => {
    e.stopPropagation();
    setEditingPost(post);
    setEditTitle(post.Title);
    setEditContent(post.content);
  };

  const submitEditPost = async () => {
    if (!editingPost) return;
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/community/${editingPost.id}`, {
        method: "PUT",
        headers: authHeaders,
        body: JSON.stringify({ title: editTitle, content: editContent })
      });
      const data = await response.json();

      if (data.success) {
        setPosts(posts.map(post => post.id === editingPost.id ? { ...post, Title: editTitle, content: editContent } : post));
        setEditingPost(null);
        alert("수정되었습니다.");
      } else {
        alert("수정 권한이 없거나 오류가 발생했습니다.");
      }
    } catch (error) {
      alert("서버 통신 오류가 발생했습니다.");
    }
  };

  const handleCommentSubmit = async () => {
    if (!currentUser) { alert("로그인한 사용자만 이용할 수 있습니다."); navigate("/notmypage"); return; }
    if (!commentText.trim() || !selectedPost) return;

    try {
      const response = await fetch(`http://127.0.0.1:5000/api/community/${selectedPost.id}/comments`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({ author: currentUser.name, text: commentText })
      });
      const data = await response.json();

      if (data.success) {
        const newComment = { id: data.comment.id, author: data.comment.author, text: data.comment.text, date: data.comment.created_at, likes: 0 };
        const updatedPosts = posts.map(post => {
          if (post.id === selectedPost.id) {
            const updatedPost = { ...post, comments: post.comments + 1, commentsList: [...(post.commentsList || []), newComment] };
            setSelectedPost(updatedPost); 
            return updatedPost;
          }
          return post;
        });
        setPosts(updatedPosts);
        setCommentText(""); 
      }
    } catch (error) {
      alert("댓글 작성에 실패했습니다.");
    }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    if (window.confirm("댓글을 삭제하시겠습니까?")) {
      try {
        const response = await fetch(`http://127.0.0.1:5000/api/community/${postId}/comments/${commentId}`, {
          method: "DELETE",
          headers: authHeaders
        });
        
        if (response.ok) {
          const updatedPosts = posts.map(post => {
            if (post.id === postId) {
              const updatedComments = (post.commentsList || []).filter(c => c.id !== commentId);
              const updatedPost = { ...post, comments: Math.max(0, post.comments - 1), commentsList: updatedComments };
              if (selectedPost?.id === postId) setSelectedPost(updatedPost);
              return updatedPost;
            }
            return post;
          });
          setPosts(updatedPosts);
        }
      } catch (error) {
        alert("댓글 삭제에 실패했습니다.");
      }
    }
  };

  const handleLike = (id: string) => {
    if (!currentUser) { alert("로그인한 사용자만 이용할 수 있습니다."); navigate("/notmypage"); return; }
    const isLiked = likedIds.has(id);
    setLikedIds(prev => { const newLiked = new Set(prev); if (isLiked) newLiked.delete(id); else newLiked.add(id); return newLiked; });
    setPosts(prevPosts => prevPosts.map(post => post.id === id ? { ...post, likes: isLiked ? post.likes - 1 : post.likes + 1 } : post));
  };

  const handleCommentLike = (postId: string, commentId: string) => {
    if (!currentUser) { alert("로그인한 사용자만 이용할 수 있습니다."); navigate("/notmypage"); return; }
    const isLiked = likedCommentIds.has(commentId);
    setLikedCommentIds(prev => { const next = new Set(prev); if (isLiked) next.delete(commentId); else next.add(commentId); return next; });
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const updatedComments = (post.commentsList || []).map(c => c.id === commentId ? { ...c, likes: (c.likes || 0) + (isLiked ? -1 : 1) } : c);
        const updatedPost = { ...post, commentsList: updatedComments };
        if (selectedPost?.id === postId) setSelectedPost(updatedPost);
        return updatedPost;
      }
      return post;
    }));
  };

  const handleShare = async (title: string, text: string) => {
    const shareData = { title, text: `${title} - ${text.slice(0, 30)}...`, url: window.location.href };
    if (navigator.share) { try { await navigator.share(shareData); } catch (error) { console.log(error); }
    } else { navigator.clipboard.writeText(window.location.href); alert("주소가 클립보드에 복사되었습니다!"); }
  };

  const handleWriteClick = () => {
    if (!currentUser) { alert("로그인한 사용자만 글쓰기가 가능합니다."); navigate("/notmypage"); return; }
    navigate("/community/write");
  };

  const filteredPosts = posts.filter((post) => {
    const keyword = searchTerm.toLowerCase();
    const titleMatch = post.Title?.toLowerCase().includes(keyword) || false;
    const contentMatch = post.content?.toLowerCase().includes(keyword) || false;
    const authorMatch = post.author?.toLowerCase().includes(keyword) || false;
    return titleMatch || contentMatch || authorMatch;
  });

  const displayedPosts = filteredPosts.slice(0, visibleCount);

  return (
    <div className="min-h-screen bg-background relative">
      <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="w-full py-12 px-4">
        <div className="max-w-7xl mx-auto">
          
          {/* 타이틀과 상단 글쓰기 버튼 */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">커뮤니티</h1>
              <p className="text-muted-foreground">축제 후기와 사진을 공유하고 다른 사람들의 경험을 확인해보세요</p>
            </div>
            <Button className="gap-2" onClick={handleWriteClick}> 
              <Plus className="w-7 h-7" /> 글쓰기
            </Button>
          </div>

          {/* 검색창 영역 */}
          <div className="mb-8 relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-5 w-5 text-muted-foreground" /></div>
            <input type="text" placeholder="축제 이름, 내용, 작성자 검색..." value={searchTerm} onChange={handleSearchChange} className="w-full pl-10 pr-4 py-3 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring transition-shadow placeholder:text-gray-800 placeholder:opacity-100" />
          </div>

          {/* 게시물 목록 렌더링 */}
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {displayedPosts.length > 0 ? (
              displayedPosts.map((post) => (
                <motion.div key={post.id} variants={staggerItem}>
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200 h-full flex flex-col cursor-pointer" onClick={() => setSelectedPost(post)}>
                    <div className="aspect-video relative overflow-hidden shrink-0">
                      <ImageCarousel images={post.images} />
                    </div>
                    <div className="p-6 flex flex-col flex-1" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><User className="w-5 h-5 text-primary" /></div>
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">{post.author}</p>
                          <p className="text-sm text-muted-foreground">{getTimeAgo(post.date)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={`${getCategoryColor(post.category)} pointer-events-none`}>{post.category}</Badge>
                          {currentUser?.name === post.author && (
                            <>
                              <button onClick={(e) => openEditModal(e, post)} className="text-muted-foreground hover:text-primary transition-colors p-1">
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button onClick={(e) => handleDeletePost(e, post.id)} className="text-muted-foreground hover:text-red-500 transition-colors p-1">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      <h3 className="text-xl font-semibold text-foreground mb-2">{post.Title}</h3>
                      <div className="mb-4 flex-1">
                        <p className={`text-muted-foreground transition-all duration-300 ${expandedPosts.has(post.id) ? "" : "line-clamp-2"}`}>
                          {post.content}
                        </p>
                        {post.content.length > 40 && (
                          <button onClick={() => toggleExpand(post.id)} className="text-sm text-primary hover:underline mt-1 focus:outline-none">
                            {expandedPosts.has(post.id) ? "접기" : "더 보기"}
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-6 pt-4 border-t border-border mt-auto">
                        <button onClick={() => handleLike(post.id)} className={`flex items-center gap-2 transition-colors ${likedIds.has(post.id) ? "text-red-500 hover:text-red-600" : "text-muted-foreground hover:text-red-500"}`}>
                          <Heart className="w-5 h-5" fill={likedIds.has(post.id) ? "currentColor" : "none"} />
                          <span className="text-sm font-medium">{post.likes}</span>
                        </button>
                        <button onClick={() => setSelectedPost(post)} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                          <MessageCircle className="w-5 h-5" />
                          <span className="text-sm font-medium">{post.comments}</span>
                        </button>
                        <button onClick={() => handleShare(post.Title, post.content)} className="flex items-center gap-2 text-muted-foreground hover:text-accent-foreground transition-colors ml-auto">
                          <Share2 className="w-5 h-5" />
                          <span className="text-sm font-medium">공유</span>
                        </button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))
            ) : (
              // 빈 화면 영역: "첫 게시글 작성하기" 버튼 코드를 삭제했습니다.
              <div className="col-span-full py-40 flex flex-col items-center justify-center text-muted-foreground bg-muted/20 rounded-lg border border-dashed border-border/50">
                <p className="text-xl font-medium mb-2">
                  {searchTerm ? `"${searchTerm}"에 대한 검색 결과가 없습니다.` : "아직 작성된 게시글이 없습니다."}
                </p>
              </div>
            )}
          </motion.div>

          {visibleCount < filteredPosts.length && (
            <div className="mt-12 text-center"><Button variant="outline" className="px-8 py-3" onClick={handleLoadMore}>더 보기</Button></div>
          )}
        </div>
      </motion.div>

      {/* 게시물 수정 및 상세 모달 (생략 없이 유지) */}
      <AnimatePresence>
        {editingPost && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-background w-full max-w-lg rounded-xl shadow-xl p-6 relative">
              <button onClick={() => setEditingPost(null)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
              <h2 className="text-xl font-bold mb-4">게시글 수정</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">제목</label>
                  <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">내용</label>
                  <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} className="w-full px-3 py-2 border rounded-md h-32 resize-none focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setEditingPost(null)}>취소</Button>
                  <Button onClick={submitEditPost}>저장하기</Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedPost && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-0 md:p-10" onClick={() => setSelectedPost(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} onClick={(e) => e.stopPropagation()} className="bg-background w-full h-full md:h-[80vh] max-w-6xl md:rounded-xl shadow-xl flex flex-col md:flex-row overflow-hidden">
              <div className="w-full md:w-[55%] bg-black flex items-center justify-center relative min-h-[30vh] md:h-full">
                <ImageCarousel images={selectedPost.images} isModal={true} />
                <button onClick={() => setSelectedPost(null)} className="absolute top-4 left-4 text-white hover:text-gray-300 md:hidden bg-black/50 rounded-full p-2 z-20"><X className="w-5 h-5" /></button>
              </div>
              <div className="w-full md:w-[45%] flex flex-col h-[60vh] md:h-full bg-background">
                <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"><User className="w-4 h-4 text-primary" /></div>
                    <div><p className="font-semibold text-sm text-foreground">{selectedPost.author}</p><p className="text-xs text-muted-foreground">{selectedPost.Title}</p></div>
                  </div>
                  <button onClick={() => setSelectedPost(null)} className="hidden md:block text-muted-foreground hover:text-foreground p-1"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-6">
                  <div className="flex gap-3 pb-4 border-b border-border/50">
                    <div className="w-8 h-8 rounded-full bg-primary/10 shrink-0 flex items-center justify-center"><User className="w-4 h-4 text-primary" /></div>
                    <div className="flex-1">
                      <span className="font-semibold text-sm text-foreground mr-2">{selectedPost.author}</span>
                      <span className="text-sm text-foreground whitespace-pre-wrap">{selectedPost.content}</span>
                      <p className="text-xs text-muted-foreground mt-2">{getTimeAgo(selectedPost.date)}</p>
                    </div>
                  </div>
                  {(!selectedPost.commentsList || selectedPost.commentsList.length === 0) ? (
                    <p className="text-center text-muted-foreground py-12 text-sm">아직 작성된 댓글이 없습니다.<br/>첫 댓글을 남겨보세요!</p>
                  ) : (
                    selectedPost.commentsList.map((comment) => (
                      <div key={comment.id} className="flex gap-3 group">
                        <div className="w-8 h-8 rounded-full bg-muted shrink-0 flex items-center justify-center"><User className="w-4 h-4 text-muted-foreground" /></div>
                        <div className="flex-1">
                          <p className="text-sm text-foreground"><span className="font-semibold mr-2">{comment.author}</span>{comment.text}</p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                            <span>{getTimeAgo(comment.date)}</span>
                            {comment.likes ? <span className="font-medium">좋아요 {comment.likes}개</span> : null}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0 pt-1">
                          {currentUser?.name === comment.author && (
                            <button onClick={() => handleDeleteComment(selectedPost.id, comment.id)} className="text-muted-foreground hover:text-red-500 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                          <button onClick={() => handleCommentLike(selectedPost.id, comment.id)}>
                            <Heart className={`w-4 h-4 transition-colors ${likedCommentIds.has(comment.id) ? "text-red-500" : "text-muted-foreground hover:text-foreground"}`} fill={likedCommentIds.has(comment.id) ? "currentColor" : "none"} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-4 border-t border-border flex items-center gap-3 shrink-0">
                  <input type="text" value={commentText} onChange={(e) => setCommentText(e.target.value)} onKeyDown={(e) => { if(e.key === 'Enter') handleCommentSubmit(); }} placeholder={currentUser ? `${selectedPost.author}님의 글에 댓글 달기...` : "로그인이 필요합니다."} className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground" disabled={!currentUser} />
                  <button onClick={handleCommentSubmit} disabled={!commentText.trim()} className="text-primary font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed">게시</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}