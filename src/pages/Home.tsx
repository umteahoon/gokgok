import { useState, useRef, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { mockFestivals } from "@/lib/index";
import busanBg from "@/assets/main.png";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";

const regions = ["전체", "서울", "경기/인천", "강원", "충청", "전라", "경상", "제주"];

export default function Home() {
  const [activeRegion, setActiveRegion] = useState("전체");
  const [wishlistedIds, setWishlistedIds] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 로컬 스토리지 찜 목록 동기화
  const loadWishlist = () => {
    const saved = JSON.parse(localStorage.getItem("gokgok_wishlist") || "[]");
    setWishlistedIds(saved);
  };

  useEffect(() => {
    loadWishlist();
    window.addEventListener('focus', loadWishlist);
    return () => window.removeEventListener('focus', loadWishlist);
  }, []);

  const toggleWishlist = (e: React.MouseEvent, id: string | number) => {
    e.preventDefault(); e.stopPropagation();
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

  const displayFestivals = useMemo(() => {
    if (activeRegion === "전체") return mockFestivals.slice(0, 10);
    return mockFestivals.filter((f) => {
      if (activeRegion === "경기/인천") return f.location.includes("경기") || f.location.includes("인천");
      return f.location.includes(activeRegion);
    });
  }, [activeRegion]);

  const handleScroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const moveAmount = clientWidth * 0.8;
      scrollRef.current.scrollTo({
        left: direction === "left" ? scrollLeft - moveAmount : scrollLeft + moveAmount,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-white dark:bg-[#111111] text-[#111111] dark:text-white font-sans pb-20 overflow-x-hidden transition-colors">
      <section className="relative w-full h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={busanBg} alt="배경" className="w-full h-full object-cover brightness-[0.85]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 text-center text-white flex flex-col items-center px-4 -mt-10">
          <h2 className="text-[42px] sm:text-[52px] md:text-[64px] font-extrabold leading-[1.15] tracking-tight drop-shadow-xl text-white">
            <span className="block opacity-95">대한민국의</span>
            <span className="block mt-1">따뜻한 매력을</span>
            <span className="block mt-1">구석구석 느껴보세요.</span>
          </h2>
        </motion.div>
      </section>
      
      <main className="w-full max-w-[1200px] mx-auto py-12 px-4 md:px-10 bg-white dark:bg-[#1a1a1a] rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.05)] relative z-20 -mt-24 border-t border-gray-100 dark:border-gray-800 transition-colors">
        <div className="mb-14 pb-6 border-b border-gray-100 dark:border-gray-800 flex justify-center">
          <div className="flex gap-2 overflow-x-auto py-2 px-2 no-scrollbar">
            {regions.map((region) => (
              <button key={region} onClick={() => setActiveRegion(region)}
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

        <section className="mb-16 relative">
          <h3 className="text-[24px] md:text-[28px] font-extrabold tracking-tight text-gray-900 dark:text-white mb-8">
            {activeRegion === "전체" ? "이달의 추천 축제 🌸" : `${activeRegion}의 추천 축제 📍`}
          </h3>

          <div className="relative group/slider">
            {/* ✅ 왼쪽 끝 버튼 */}
            <button 
              onClick={() => handleScroll("left")} 
              className="absolute -left-4 md:-left-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/90 dark:bg-[#222]/90 border border-gray-100 dark:border-zinc-800 shadow-xl flex items-center justify-center text-gray-900 dark:text-white backdrop-blur-md opacity-0 group-hover/slider:opacity-100 transition-all hover:scale-110 active:scale-95"
            >
              <ChevronLeft size={24} />
            </button>

            {/* ✅ 오른쪽 끝 버튼 */}
            <button 
              onClick={() => handleScroll("right")} 
              className="absolute -right-4 md:-right-6 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full bg-white/90 dark:bg-[#222]/90 border border-gray-100 dark:border-zinc-800 shadow-xl flex items-center justify-center text-gray-900 dark:text-white backdrop-blur-md opacity-0 group-hover/slider:opacity-100 transition-all hover:scale-110 active:scale-95"
            >
              <ChevronRight size={24} />
            </button>

            {/* ✅ 슬라이드 컨테이너: 스크롤바 완전 제거 */}
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
                      <img src={festival.image} alt={festival.title} className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-110" />
                      <div onClick={(e) => toggleWishlist(e, festival.id)} className="absolute top-3 right-3 z-10 cursor-pointer">
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
                    <div className="px-1">
                      <span className="text-[11px] text-[#FF3478] font-bold mb-1 block uppercase">{festival.category || "테마여행"}</span>
                      <h3 className="font-bold text-[16px] text-gray-900 dark:text-white line-clamp-2 h-[44px] group-hover/card:text-[#FF3478] transition-colors">{festival.title}</h3>
                      <p className="text-[13px] text-[#555555] dark:text-gray-400 font-semibold mt-1">{festival.location}</p>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="w-full py-20 text-center bg-gray-50 dark:bg-[#222222] rounded-3xl border-2 border-dashed border-gray-100 dark:border-gray-800">
                  <p className="text-gray-400 font-bold">해당 지역의 축제 정보가 없습니다.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}