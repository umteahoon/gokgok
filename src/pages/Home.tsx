import { useState, useRef, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { mockFestivals } from "@/lib/index";

import home6 from "@/assets/home6.webp";
import home7 from "@/assets/home7.webp";
import home8 from "@/assets/home8.jpg";
import homeBack from "@/assets/main.png";

import {
  ChevronLeft,
  ChevronRight,
  Heart,
  MessageSquare,
  ArrowRight,
  MapPin,
} from "lucide-react";

import { getCurrentUser } from "@/lib/login";

const regions = [
  "전체",
  "서울",
  "경기/인천",
  "강원",
  "충청",
  "전라",
  "경상",
  "제주",
];

export default function Home() {
  const currentUser = getCurrentUser();
  const navigate = useNavigate();

  const [activeRegion, setActiveRegion] = useState("전체");
  const [wishlistedIds, setWishlistedIds] = useState<string[]>([]);
  const [isLoginNoticeOpen, setIsLoginNoticeOpen] = useState(false);

  // 히어로 배경 이미지
  const heroImages = [home6, home7, home8, homeBack];
  const [currentHero, setCurrentHero] = useState(0);

  // 실시간 HOT 게시글
  const [hotPosts, setHotPosts] = useState<any[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);

  const clearButtonStyle = {
    WebkitTapHighlightColor: "transparent",
    outline: "none",
    border: "none",
  };

  // 💡 15초(15000ms)마다 히어로 이미지 변경으로 수정 완료!
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHero((prev) => (prev + 1) % heroImages.length);
    }, 15000);

    return () => clearInterval(interval);
  }, [heroImages.length]);

  // HOT 게시글 불러오기
  const loadHotPostsData = async () => {
    try {
      const response = await fetch(
        "https://gokgok-8ztf.onrender.com/api/community",
      );

      const data = await response.json();

      if (data.success && data.posts) {
        const sorted = data.posts
          .sort((a: any, b: any) => (b.likes || 0) - (a.likes || 0))
          .slice(0, 3)
          .map((p: any) => ({
            id: p.id,
            title: p.title || "제목 없음",
            author: p.author || "익명유저",
            likes: p.likes || 0,
            comments: p.commentsList ? p.commentsList.length : 0,
            category: p.category || "수다",
          }));

        setHotPosts(sorted);
      }
    } catch (error) {
      console.error("실시간 수다방 데이터를 가져오는 중 오류 발생:", error);
    }
  };

  // 찜 목록 로드
  const loadWishlist = () => {
    const saved = JSON.parse(localStorage.getItem("gokgok_wishlist") || "[]");
    setWishlistedIds(saved);
  };

  useEffect(() => {
    loadWishlist();
    loadHotPostsData();

    window.addEventListener("focus", loadWishlist);

    return () => window.removeEventListener("focus", loadWishlist);
  }, []);

  // 찜 토글
  const toggleWishlist = (e: React.MouseEvent, id: string | number) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUser) {
      setIsLoginNoticeOpen(true);
      return;
    }

    const strId = String(id);

    const saved = JSON.parse(localStorage.getItem("gokgok_wishlist") || "[]");

    let updated;

    if (saved.includes(strId)) {
      updated = saved.filter((itemId: string) => itemId !== strId);
    } else {
      updated = [...saved, strId];
    }

    localStorage.setItem("gokgok_wishlist", JSON.stringify(updated));
    setWishlistedIds(updated);
  };

  // 지역별 축제 필터
  const displayFestivals = useMemo(() => {
    if (activeRegion === "전체") return mockFestivals.slice(0, 10);

    return mockFestivals.filter((festival) => {
      if (activeRegion === "경기/인천") {
        return (
          festival.location.includes("경기") ||
          festival.location.includes("인천")
        );
      }

      return festival.location.includes(activeRegion);
    });
  }, [activeRegion]);

  // 마감 임박 축제
  const closingSoonFestivals = useMemo(() => {
    return mockFestivals.slice(2, 5);
  }, []);

  // 슬라이더 스크롤
  const handleScroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;

    const { scrollLeft, clientWidth } = scrollRef.current;

    const moveAmount = clientWidth * 0.8;

    scrollRef.current.scrollTo({
      left:
        direction === "left"
          ? scrollLeft - moveAmount
          : scrollLeft + moveAmount,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative w-full min-h-screen bg-white dark:bg-[#111111] text-[#111111] dark:text-white font-sans pb-20 overflow-x-hidden transition-colors">
      {/* 히어로 배너 */}
      <section className="relative w-full h-[75vh] md:h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={heroImages[currentHero]}
            alt="배경"
            className="w-full h-full object-cover brightness-[0.85] transition-all duration-1000"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 text-center text-white flex flex-col items-center px-4 -mt-10"
        >
          <h2 className="text-[42px] sm:text-[52px] md:text-[64px] font-extrabold leading-[1.15] tracking-tight drop-shadow-xl text-white">
            <span className="block opacity-95">대한민국의</span>
            <span className="block mt-1">따뜻한 매력을</span>
            <span className="block mt-1">구석구석 느껴보세요.</span>
          </h2>
        </motion.div>
      </section>

      {/* 메인 컨텐츠 */}
      <main className="w-full max-w-[1200px] mx-auto py-16 px-6 md:px-10 relative z-20 transition-colors">
        {/* 지역 필터 */}
        <div className="mb-16 pb-6 border-b border-gray-100 dark:border-gray-800 flex justify-center">
          <div className="flex gap-2 overflow-x-auto py-2 px-2 no-scrollbar">
            {regions.map((region) => (
              <button
                key={region}
                onClick={() => setActiveRegion(region)}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap border ${
                  activeRegion === region
                    ? "bg-[#FF3478] text-white border-[#FF3478] shadow-md"
                    : "bg-[#F5F5F5] dark:bg-[#222222] text-[#666666] dark:text-gray-400 border-transparent hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {region}
              </button>
            ))}
          </div>
        </div>

        {/* 추천 축제 */}
        <section className="mb-24 relative">
          <div className="flex justify-between items-end mb-8">
            <h3 className="text-[24px] md:text-[28px] font-extrabold tracking-tight text-gray-900 dark:text-white text-left">
              {activeRegion === "전체"
                ? "이달의 추천 축제"
                : `${activeRegion}의 추천 축제 📍`}
            </h3>

            <Link
              to="/search"
              style={clearButtonStyle}
              className="text-sm font-bold text-gray-400 hover:text-[#FF3478] flex items-center gap-1 transition-colors"
            >
              더보기 <ArrowRight size={14} />
            </Link>
          </div>

          <div className="relative group/slider">
            <button
              onClick={() => handleScroll("left")}
              className="absolute -left-4 md:-left-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/90 dark:bg-[#222]/90 border border-gray-100 dark:border-zinc-800 shadow-xl flex items-center justify-center text-gray-900 dark:text-white backdrop-blur-md opacity-0 group-hover/slider:opacity-100 transition-all hover:scale-110 active:scale-95"
            >
              <ChevronLeft size={24} />
            </button>

            <button
              onClick={() => handleScroll("right")}
              className="absolute -right-4 md:-right-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/90 dark:bg-[#222]/90 border border-gray-100 dark:border-zinc-800 shadow-xl flex items-center justify-center text-gray-900 dark:text-white backdrop-blur-md opacity-0 group-hover/slider:opacity-100 transition-all hover:scale-110 active:scale-95"
            >
              <ChevronRight size={24} />
            </button>

            <div
              ref={scrollRef}
              className="flex flex-nowrap justify-start gap-4 md:gap-5 overflow-x-auto snap-x snap-mandatory pb-4 pt-2 scroll-smooth no-scrollbar [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
              {displayFestivals.length > 0 ? (
                displayFestivals.map((festival) => (
                  <Link
                    to={`/festival/${festival.id}`}
                    key={festival.id}
                    className="min-w-[75%] sm:min-w-[calc(33.333%-16px)] lg:min-w-[calc(25%-15px)] max-w-[75%] sm:max-w-[calc(33.333%-16px)] lg:max-w-[calc(25%-15px)] flex-shrink-0 snap-start group/card cursor-pointer"
                  >
                    <div className="relative mb-3 aspect-[4/5] rounded-2xl overflow-hidden shadow-sm bg-gray-50 dark:bg-[#222222]">
                      <img
                        src={festival.image}
                        alt={festival.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-110"
                      />

                      {/* 찜 버튼 */}
                      <div
                        onClick={(e) => toggleWishlist(e, festival.id)}
                        className="absolute top-3 right-3 z-10 cursor-pointer"
                      >
                        <Heart
                          size={26}
                          className={`drop-shadow-md transition-all active:scale-75 ${
                            wishlistedIds.includes(String(festival.id))
                              ? "fill-[#FF3478] text-[#FF3478]"
                              : "text-white/70 hover:text-white"
                          }`}
                        />
                      </div>
                    </div>

                    <div className="px-1 text-left">
                      <span className="text-[11px] text-[#FF3478] font-bold mb-1 block uppercase">
                        {festival.category || "테마여행"}
                      </span>

                      <h3 className="font-bold text-[16px] text-gray-900 dark:text-white line-clamp-2 h-[44px] group-hover/card:text-[#FF3478] transition-colors">
                        {festival.title}
                      </h3>

                      <p className="text-[13px] text-[#555555] dark:text-gray-400 font-semibold mt-1">
                        {festival.location}
                      </p>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="w-full py-20 text-center bg-gray-50 dark:bg-[#222222] rounded-3xl border-2 border-dashed border-gray-100 dark:border-gray-800">
                  <p className="text-gray-400 font-bold">
                    해당 지역의 축제 정보가 없습니다.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 마감 임박 축제 */}
        <section className="mb-24 text-left">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h3 className="text-[24px] md:text-[28px] font-black tracking-tight text-gray-900 dark:text-white">
                놓치면 후회할 마감 임박 축제
              </h3>

              <p className="text-gray-400 font-medium text-sm mt-1">
                곧 막을 내리는 축제 정보들을 놓치지 마세요.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {closingSoonFestivals.map((festival) => (
              <Link
                to={`/festival/${festival.id}`}
                key={`closing-${festival.id}`}
                className="flex gap-4 p-4 bg-gray-50 dark:bg-[#222222] rounded-[1.8rem] hover:shadow-md hover:scale-[1.01] transition-all group"
              >
                <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0">
                  <img
                    src={festival.image}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    alt={festival.title}
                  />
                </div>

                <div className="flex flex-col justify-center min-w-0">
                  <span className="text-[10px] text-white font-bold bg-[#FF3478] px-2 py-0.5 rounded-full w-fit mb-1.5 shadow-sm">
                    D-Day 임박
                  </span>

                  <h4 className="font-extrabold text-[15px] truncate text-gray-900 dark:text-white group-hover:text-[#FF3478] transition-colors">
                    {festival.title}
                  </h4>

                  <div className="flex items-center gap-1 text-gray-400 text-xs mt-1 font-medium">
                    <MapPin size={12} />
                    <span className="truncate">{festival.location}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* HOT 게시글 */}
        <section className="mb-10 text-left">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h3 className="text-[24px] md:text-[28px] font-black tracking-tight text-gray-900 dark:text-white">
                실시간 수다방 HOT 게시글
              </h3>

              <p className="text-gray-400 font-medium text-sm mt-1">
                곡곡 멤버들이 전하는 생생한 축제 이야기와 꿀팁.
              </p>
            </div>

            <Link
              to="/community"
              style={clearButtonStyle}
              className="text-sm font-bold text-gray-400 hover:text-[#FF3478] flex items-center gap-1 transition-colors"
            >
              전체보기 <ArrowRight size={14} />
            </Link>
          </div>

          <div className="flex flex-col gap-3">
            {hotPosts.length > 0 ? (
              hotPosts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => navigate("/community")}
                  className="w-full p-5 bg-white dark:bg-[#1a1a1a] border border-gray-100 dark:border-gray-800 rounded-2xl flex items-center justify-between hover:border-[#FF3478]/30 cursor-pointer shadow-sm transition-all"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <span className="text-xs font-bold text-[#FF3478] bg-[#FF3478]/5 px-3 py-1 rounded-full shrink-0">
                      {post.category}
                    </span>

                    <h4 className="font-bold text-[15px] text-gray-800 dark:text-gray-200 truncate">
                      {post.title}
                    </h4>

                    <span className="text-xs text-gray-400 font-medium shrink-0 hidden sm:inline">
                      by {post.author}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-gray-300 dark:text-gray-600 font-bold text-xs shrink-0 pl-3">
                    <div className="flex items-center gap-1 text-pink-500/80">
                      <Heart size={14} fill="currentColor" /> {post.likes}
                    </div>

                    <div className="flex items-center gap-1 text-gray-400">
                      <MessageSquare size={14} /> {post.comments}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="w-full py-10 text-center text-gray-400 font-bold bg-gray-50 dark:bg-[#1a1a1a] border border-dashed border-gray-100 dark:border-gray-800 rounded-2xl">
                실시간 핫 게시글이 없습니다.
              </div>
            )}
          </div>
        </section>
      </main>

      {/* 로그인 유도 모달 */}
      <AnimatePresence>
        {isLoginNoticeOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setIsLoginNoticeOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-[#1a1a1a] w-full max-w-[320px] rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 p-6 text-center"
            >
              <div className="w-12 h-12 bg-pink-50 dark:bg-pink-950/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="text-[#FF3478] w-6 h-6" fill="currentColor" />
              </div>

              <h3 className="text-[18px] font-black text-gray-900 dark:text-white mb-2">
                로그인이 필요합니다
              </h3>

              <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                축제 관심목록 찜 기능은
                <br />
                로그인 후 이용하실 수 있습니다.
              </p>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    setIsLoginNoticeOpen(false);
                    navigate("/notmypage");
                  }}
                  className="w-full py-3.5 bg-[#111111] dark:bg-white text-white dark:text-black font-bold rounded-full text-sm shadow-sm hover:opacity-90 transition-all"
                >
                  로그인하러 가기
                </button>

                <button
                  onClick={() => setIsLoginNoticeOpen(false)}
                  className="w-full py-2 text-gray-400 dark:text-gray-500 font-medium rounded-full text-xs hover:text-gray-600 transition-colors"
                >
                  취소
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
