import { useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom"; 
import { mockFestivals, topFestivals } from "@/lib/index";
// 아래 경로가 실제 프로젝트와 맞는지 꼭 확인해주세요!
import { KoreaMap } from "@/components/KoreaMap"; 
import { SearchBar } from "@/components/SearchBar";

interface Festival {
  id: string | number;
  title: string;
  image: string;
  date: string; 
  location: string;
  status: "ongoing" | "upcoming" | "ended" | string;
  category?: string;
  description?: string;
}

export default function Search() {  
  const [activeTab, setActiveTab] = useState<"list" | "map">("list");
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedTaste, setSelectedTaste] = useState("NEW");
  
  // 찜하기 상태 관리
  const [wishlistedIds, setWishlistedIds] = useState<(string | number)[]>([]);

  const bestScrollRef = useRef<HTMLDivElement>(null);
  const risingScrollRef = useRef<HTMLDivElement>(null);
  const tasteScrollRef = useRef<HTMLDivElement>(null);

  const tastes = ["NEW", "축구홀릭", "레저/스포츠홀릭", "문화/공연홀릭", "트레킹홀릭", "프라이빗홀릭", "컨시어지홀릭"];

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ongoing": return "진행중";
      case "upcoming": return "예정";
      case "ended": return "종료";
      default: return status;
    }
  };

  // 찜하기 토글 (하트 클릭 시 실행)
  const toggleWishlist = (e: React.MouseEvent, id: string | number) => {
    e.preventDefault(); // 부모 Link의 상세페이지 이동 방지
    e.stopPropagation(); // 이벤트 전파 방지
    setWishlistedIds(prev => 
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  const filteredList = useMemo(() => {
    const combined = [...topFestivals, ...mockFestivals] as Festival[];
    const uniqueFestivals = combined.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
    
    return uniqueFestivals.filter(f => {
      const matchesSearch = f.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            f.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRegion = selectedRegion ? f.location.includes(selectedRegion) : true;
      return matchesSearch && matchesRegion;
    });
  }, [searchQuery, selectedRegion]);

  const handleScroll = (ref: React.RefObject<HTMLDivElement>, direction: "left" | "right") => {
    if (ref.current) {
      const { scrollLeft, clientWidth } = ref.current;
      const moveAmount = clientWidth * 0.8; 
      const scrollTo = direction === "left" ? scrollLeft - moveAmount : scrollLeft + moveAmount;
      ref.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  const handleRegionSelect = (regionId: string) => {
    setSelectedRegion(regionId === selectedRegion ? "" : regionId);
  };

  // 하트 클릭 시 회색 박스/테두리가 생기지 않도록 하는 스타일
  const heartStyle = {
    WebkitTapHighlightColor: 'transparent',
    outline: 'none',
    userSelect: 'none' as const
  };

  return (
    <div className="min-h-screen bg-white text-[#111111] pb-20 font-sans overflow-x-hidden">
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="p-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18L9 12L15 6"/></svg>
          </Link>
          <h1 className="text-lg font-bold">전국 축제 탐색</h1>
          <div className="flex gap-1 w-10"></div> {/* 밸런스를 위한 빈 공간 */}
        </div>
      </header>

      <main className="container mx-auto px-4 mt-8">
        <section className="mb-10 max-w-2xl mx-auto">
          <SearchBar onSearch={(q) => setSearchQuery(q)} />
        </section>

        {/* 탭 메뉴 */}
        <div className="flex gap-6 mb-10 border-b border-gray-100">
          <button onClick={() => setActiveTab("list")} className={`pb-3 text-lg font-bold transition-colors relative ${activeTab === "list" ? "text-[#FF3478]" : "text-gray-400"}`}>
            목록보기 {activeTab === "list" && <motion.div layoutId="t-line" className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#FF3478]" />}
          </button>
          <button onClick={() => setActiveTab("map")} className={`pb-3 text-lg font-bold transition-colors relative ${activeTab === "map" ? "text-[#FF3478]" : "text-gray-400"}`}>
            지도보기 {activeTab === "map" && <motion.div layoutId="t-line" className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#FF3478]" />}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "list" ? (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              
              {/* 섹션 1: TOP! 베스트 축제 */}
              <section className="mb-16 relative group">
                <h2 className="text-[22px] font-extrabold italic mb-6">TOP! 베스트 축제</h2>
                <div ref={bestScrollRef} className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-4">
                  {(topFestivals as Festival[]).map((festival, idx) => (
                    <Link to={`/festival/${festival.id}`} key={`best-${festival.id}`} className="min-w-[calc(20%-12.8px)] snap-start group/card relative">
                      <div className="relative mb-3 aspect-[4/5] rounded-xl overflow-hidden shadow-sm bg-gray-50">
                        <img src={festival.image} alt={festival.title} className="w-full h-full object-cover" />
                        
                        {/* 찜하기 하트 전용 버튼 (div로 구현하여 테두리 에러 해결) */}
                        <div 
                          onClick={(e) => toggleWishlist(e, festival.id)}
                          className="absolute top-2 right-2 z-10 p-1 cursor-pointer"
                          style={heartStyle}
                        >
                          <motion.svg 
                            whileTap={{ scale: 0.8 }}
                            width="24" height="24" viewBox="0 0 24 24" 
                            fill={wishlistedIds.includes(festival.id) ? "#FF3478" : "rgba(255,255,255,0.4)"} 
                            stroke="white" strokeWidth="2"
                            className="drop-shadow-md"
                          >
                            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.505 4.04 3 5.5l7 7Z" />
                          </motion.svg>
                        </div>

                        <div className="absolute top-2 left-2 pointer-events-none">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${festival.status === 'ended' ? 'bg-gray-500/80' : 'bg-[#FF3478]/90'}`}>
                            {getStatusLabel(festival.status)}
                          </span>
                        </div>
                        <div className="absolute bottom-0 left-0 leading-none pointer-events-none">
                          <svg width="65" height="65" viewBox="0 0 100 100">
                            <text x="12" y="92" fontSize="52" fontWeight="900" fontStyle="italic" fill="#111111">{idx + 1}</text>
                          </svg>
                        </div>
                      </div>
                      <div className="px-1">
                        <h3 className="font-bold text-[14.5px] line-clamp-2 leading-snug">{festival.title}</h3>
                        <p className="text-[12px] text-gray-400">{festival.date}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>

              {/* 섹션 2: 인기 급상승 */}
              <section className="mb-16 relative group">
                <h2 className="text-[22px] font-extrabold mb-6">지금 인기 급상승 🔥</h2>
                <div ref={risingScrollRef} className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-4">
                  {(mockFestivals as Festival[]).map((festival) => (
                    <Link to={`/festival/${festival.id}`} key={`rising-${festival.id}`} className="min-w-[calc(20%-12.8px)] snap-start group/card relative">
                      <div className="relative mb-3 aspect-[4/5] rounded-xl overflow-hidden shadow-sm bg-gray-50">
                        <img src={festival.image} alt={festival.title} className="w-full h-full object-cover" />
                        
                        <div onClick={(e) => toggleWishlist(e, festival.id)} className="absolute top-2 right-2 z-10 p-1 cursor-pointer" style={heartStyle}>
                          <motion.svg 
                            whileTap={{ scale: 0.8 }}
                            width="24" height="24" viewBox="0 0 24 24" 
                            fill={wishlistedIds.includes(festival.id) ? "#FF3478" : "rgba(255,255,255,0.4)"} 
                            stroke="white" strokeWidth="2"
                            className="drop-shadow-md"
                          >
                            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.505 4.04 3 5.5l7 7Z" />
                          </motion.svg>
                        </div>

                        <div className="absolute top-2 left-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold text-white bg-blue-500/90 shadow-md">
                            {getStatusLabel(festival.status)}
                          </span>
                        </div>
                      </div>
                      <h3 className="font-bold text-[14.5px] px-1 line-clamp-2 leading-snug">{festival.title}</h3>
                    </Link>
                  ))}
                </div>
              </section>

              {/* 섹션 3: 취향별 홀릭 */}
              <section className="mb-20 relative group">
                <h2 className="text-[22px] font-bold mb-6">취향에 따라 고르는 여행</h2>
                <div ref={tasteScrollRef} className="flex gap-5 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-4">
                  {filteredList.map((festival) => (
                    <Link to={`/festival/${festival.id}`} key={`holic-${festival.id}`} className="min-w-[calc(25%-15px)] snap-start group/card relative">
                      <div className="relative mb-4 aspect-[1.4/1] rounded-2xl overflow-hidden shadow-md bg-gray-100">
                        <img src={festival.image} alt={festival.title} className="w-full h-full object-cover" />
                        <div onClick={(e) => toggleWishlist(e, festival.id)} className="absolute top-3 right-3 z-10 p-1 cursor-pointer" style={heartStyle}>
                          <motion.svg 
                            whileTap={{ scale: 0.8 }}
                            width="28" height="28" viewBox="0 0 24 24" 
                            fill={wishlistedIds.includes(festival.id) ? "#FF3478" : "rgba(255,255,255,0.4)"} 
                            stroke="white" strokeWidth="2.5"
                            className="drop-shadow-xl"
                          >
                            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.505 4.04 3 5.5l7 7Z" />
                          </motion.svg>
                        </div>
                      </div>
                      <h3 className="font-bold text-[17px] px-1 line-clamp-1">{festival.title}</h3>
                    </Link>
                  ))}
                </div>
              </section>

            </motion.div>
          ) : (
            <div className="h-[600px] bg-gray-50 rounded-3xl flex items-center justify-center relative overflow-hidden">
               <KoreaMap selectedRegion={selectedRegion} onRegionSelect={handleRegionSelect} />
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}