// 주환 - 2026.03.20: 커뮤니티 페이지
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Heart, MessageCircle, Share2, User, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";
import { mockFestivals, getCategoryColor } from "@/lib/index";

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
}

// 초기 데이터 (테스트용) - 실제로는 API에서 받아오는 형태로 변경될 예정
const initialPosts: CommunityPost[] = [
  {
    id: "1",
    author: "김민수",
    Title: "진주 남강 유등축제",
    content: "올해 유등축제 정말 환상적이었어요! 남강에 떠 있는 수천 개의 등불이 만들어내는 야경이 너무 아름다웠습니다. 가족들과 함께 좋은 추억 만들었어요.",
    images: [mockFestivals[0].image],
    likes: 124,
    comments: 18,
    date: "2026.03.15",
    category: "전통문화",
  },
  {
    id: "2",
    author: "이지은",
    Title: "보령 머드축제",
    content: "머드 체험 정말 재미있었어요! 처음엔 망설였는데 막상 해보니 스트레스가 확 풀리더라구요. 피부도 좋아진 것 같고 최고!",
    images: [mockFestivals[1].image],
    likes: 89,
    comments: 12,
    date: "2026.03.14",
    category: "체험",
  },
  {
    id: "3",
    author: "박준호",
    Title: "화천 산천어축제",
    content: "얼음 위에서 산천어 낚시 체험 정말 신기했어요. 추웠지만 그만큼 재미있었고, 직접 잡은 산천어로 회 먹으니 맛이 일품이었습니다!",
    images: [mockFestivals[2].image],
    likes: 156,
    comments: 24,
    date: "2026.03.13",
    category: "겨울축제",
  },
  {
    id: "4",
    author: "최서연",
    Title: "전주 한옥마을 축제",
    content: "한옥마을의 전통 공연과 체험 프로그램이 정말 알차더라구요. 한복 입고 사진 찍기 좋은 포토존도 많고, 전통 음식도 맛있었어요.",
    images: [mockFestivals[3].image],
    likes: 203,
    comments: 31,
    date: "2026.03.12",
    category: "전통문화",
  },
  {
    id: "5",
    author: "정우진",
    Title: "부산 불꽃축제",
    content: "광안리 해변에서 본 불꽃놀이 정말 장관이었습니다! 음악과 함께 터지는 불꽃이 환상적이었어요. 내년에도 꼭 다시 가고 싶네요.",
    images: [mockFestivals[4].image],
    likes: 278,
    comments: 42,
    date: "2026.03.11",
    category: "불꽃축제",
  },
  {
    id: "6",
    author: "강혜진",
    Title: "안동 국제탈춤페스티벌",
    content: "세계 각국의 탈춤을 한자리에서 볼 수 있어서 좋았어요. 우리나라 전통 탈춤의 매력을 다시 느낄 수 있었던 시간이었습니다.",
    images: [mockFestivals[5].image],
    likes: 167,
    comments: 28,
    date: "2026.03.10",
    category: "전통문화",
  },
];

export default function Community() {
  const navigate = useNavigate();
  
  // 데이터 자체를 상태로 관리 (숫자 변경을 위해)
  const [posts, setPosts] = useState<CommunityPost[]>(initialPosts);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  
  const [visibleCount, setVisibleCount] = useState(4);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setVisibleCount(4); 
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 20); 
  };

  // 좋아요 토글 핸들러
  const handleLike = (id: string) => {
    const isLiked = likedIds.has(id);

    // 1. 내가 좋아요 누른 목록(Set) 업데이트
    setLikedIds(prev => {
      const newLiked = new Set(prev);
      isLiked ? newLiked.delete(id) : newLiked.add(id);
      return newLiked;
    });

    // 2. 게시글 배열의 숫자 증감 반영
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === id 
          ? { ...post, likes: isLiked ? post.likes - 1 : post.likes + 1 }
          : post
      )
    );
  };

  // 공유 핸들러 (Web Share API)
  const handleShare = async (title: string, text: string) => {
    const shareData = {
      title: title,
      text: `${title} - ${text.slice(0, 30)}...`,
      url: window.location.href, // 현재 페이지 URL
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log("공유가 취소되었거나 지원하지 않습니다.", error);
      }
    } else {
      // PC 등에서 지원하지 않을 때 클립보드 복사로 대체
      navigator.clipboard.writeText(window.location.href);
      alert("주소가 클립보드에 복사되었습니다!");
    }
  };

  // mockPosts 대신 상태로 관리되는 posts 배열을 필터링합니다.
  const filteredPosts = posts.filter((post) => {
    const keyword = searchTerm.toLowerCase();
    return (
      post.Title.toLowerCase().includes(keyword) ||
      post.content.toLowerCase().includes(keyword) ||
      post.author.toLowerCase().includes(keyword)
    );
  });

  const displayedPosts = filteredPosts.slice(0, visibleCount);

  return (
    <div className="min-h-screen bg-background relative">
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="w-full py-12 px-4"
      >
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">커뮤니티</h1>
              <p className="text-muted-foreground">
                축제 후기와 사진을 공유하고 다른 사람들의 경험을 확인해보세요
              </p>
            </div>
            <Button size="lg" className="gap-2" onClick={() => navigate("/community/write")}>
              <Plus className="w-7 h-7" />
              글쓰기
            </Button>
          </div>

          <div className="mb-8 relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <input
              type="text"
              placeholder="축제 이름, 내용, 작성자 검색..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-3 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
            />
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {displayedPosts.length > 0 ? (
              displayedPosts.map((post) => (
                <motion.div key={post.id} variants={staggerItem}>
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                    <div className="aspect-video relative overflow-hidden">
                      <img
                        src={post.images[0]}
                        alt={post.Title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-foreground">{post.author}</p>
                          <p className="text-sm text-muted-foreground">{post.date}</p>
                        </div>
                        <Badge className={getCategoryColor(post.category)}>
                          {post.category}
                        </Badge>
                      </div>

                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        {post.Title}
                      </h3>
                      <p className="text-muted-foreground mb-4 line-clamp-3">
                        {post.content}
                      </p>

                      <div className="flex items-center gap-6 pt-4 border-t border-border">
                        {/* 좋아요 버튼 업데이트 */}
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
                        
                        <button 
                          onClick={() => setSelectedPost(post)}
                          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                        >
                          <MessageCircle className="w-5 h-5" />
                          <span className="text-sm font-medium">{post.comments}</span>
                        </button>

                        {/* 공유 버튼 업데이트 */}
                        <button 
                          onClick={() => handleShare(post.Title, post.content)}
                          className="flex items-center gap-2 text-muted-foreground hover:text-accent-foreground transition-colors ml-auto"
                        >
                          <Share2 className="w-5 h-5" />
                          <span className="text-sm font-medium">공유</span>
                        </button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-muted-foreground bg-muted/20 rounded-lg">
                "{searchTerm}"에 대한 검색 결과가 없습니다.
              </div>
            )}
          </motion.div>

          {visibleCount < filteredPosts.length && (
            <div className="mt-12 text-center">
              <Button variant="outline" size="lg" onClick={handleLoadMore}>
                더 보기
              </Button>
            </div>
          )}
          
        </div>
      </motion.div>

      {/* 댓글창 (AnimatePresence 활용) */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={() => setSelectedPost(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-background w-full max-w-lg rounded-xl shadow-xl flex flex-col max-h-[80vh] overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div>
                  <h3 className="font-semibold text-lg text-foreground">
                    댓글 ({selectedPost.comments})
                  </h3>
                  <p className="text-xs text-muted-foreground">{selectedPost.Title}</p>
                </div>
                <button 
                  onClick={() => setSelectedPost(null)}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-4">
                <p className="text-center text-muted-foreground py-12">
                  아직 작성된 댓글이 없습니다.<br/>첫 댓글을 남겨보세요!
                </p>
              </div>

              {/* 댓글 리스트 영역 (테스트용) */}
              {/* <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6"> */}
                {/* 실제로는 여기에 selectedPost.commentsData.map(...) 형태가 들어갑니다 */}
                {/* {[...Array(10)].map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex-shrink-0 flex items-center justify-center">
                      <User className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-foreground">사용자 {i + 1}</span>
                        <span className="text-xs text-muted-foreground">방금 전</span>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        이 축제 정말 가보고 싶었는데 사진 보니까 더 가고 싶어지네요! 
                        좋은 정보 공유해주셔서 감사합니다. {i % 2 === 0 ? "👍" : "✨"}
                      </p>
                    </div>
                  </div>
                ))}
              </div> */}
              {/* 댓글 리스트 영역 (테스트용)/> */}

              <div className="p-4 border-t border-border flex items-center gap-3 bg-muted/30">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex-shrink-0 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <input 
                  type="text" 
                  placeholder={`${selectedPost.author}님의 글에 댓글 달기...`} 
                  className="flex-1 bg-background border border-input rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <Button size="sm" className="rounded-full px-6">
                  게시
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}