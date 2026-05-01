import { useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom"; 
import { mockFestivals, topFestivals } from "@/lib/index";
import { KoreaMap } from "@/components/KoreaMap"; 
import { SearchBar } from "@/components/SearchBar";

// Festival 인터페이스 정의
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

  // 찜하기 토글 함수
  const toggleWishlist = (e: React.MouseEvent, id: string | number) => {
    e.preventDefault(); 
    e.stopPropagation(); 
    setWishlistedIds(prev => 
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  const filteredList = useMemo(() => {
    const combined = [...topFestivals, ...mockFestivals] as Festival[];
    // ID 기준 중복 제거
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

  const heartBtnStyle = {
    WebkitTapHighlightColor: 'transparent',
    outline: 'none'
  };

  return (
    // 레이아웃과 충돌하지 않도록 불필요한 min-h-screen 최소화, 상단 여백(pt-6) 추가
    <div className="w-full bg-white text-[#111111] pb-20 font-sans overflow-x-hidden pt-6 md:pt-10 rounded-t-3xl">
      <main className="container mx-auto px-4">
        
        {/* 검색창 영역 */}
        <section className="mb-10 max-w-2xl mx-auto">
          <SearchBar onSearch={(q) => setSearchQuery(q)} />
        </section>

        {/* 탭 메뉴 */}
        <div className="flex gap-6 mb-10 border-b border-gray-100">
          <button onClick={() => setActiveTab("list")} className={`pb-3 text-lg font-bold transition-colors relative ${activeTab === "list" ? "text-[#FF3478]" : "text-gray-400 hover:text-gray-600"}`}>
            목록보기 {activeTab === "list" && <motion.div layoutId="t-line" className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#FF3478]" />}
          </button>
          <button onClick={() => setActiveTab("map")} className={`pb-3 text-lg font-bold transition-colors relative ${activeTab === "map" ? "text-[#FF3478]" : "text-gray-400 hover:text-gray-600"}`}>
            지도보기 {activeTab === "map" && <motion.div layoutId="t-line" className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#FF3478]" />}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "list" ? (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              
              {/* 섹션 1: TOP! 베스트 축제 */}
              <section className="mb-16 relative group">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-[22px] font-extrabold italic underline decoration-[#FF3478]/20 underline-offset-8">TOP! 베스트 축제</h2>
                  <div className="flex gap-2">
                    <button onClick={() => handleScroll(bestScrollRef, "left")} className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center bg-white shadow-sm hover:bg-gray-50 transition-all"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18L9 12L15 6"/></svg></button>
                    <button onClick={() => handleScroll(bestScrollRef, "right")} className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center bg-white shadow-sm hover:bg-gray-50 transition-all"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg></button>
                  </div>
                </div>

                <div ref={bestScrollRef} className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-4">
                  {(topFestivals as Festival[]).map((festival, idx) => (
                    <Link to={`/festival/${festival.id}`} key={`best-${festival.id}`} className="min-w-[calc(50%-10px)] md:min-w-[calc(20%-12.8px)] snap-start group/card cursor-pointer">
                      <div className="relative mb-3 aspect-[4/5] rounded-xl overflow-hidden shadow-sm bg-gray-50">
                        <img src={festival.image} alt={festival.title} className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-110" />
                        
                        <div 
                          onClick={(e) => toggleWishlist(e, festival.id)}
                          className="absolute top-2 right-2 z-10 cursor-pointer select-none outline-none"
                          style={heartBtnStyle}
                        >
                          <motion.svg 
                            whileTap={{ scale: 0.7 }}
                            width="24" height="24" viewBox="0 0 24 24" 
                            fill={wishlistedIds.includes(festival.id) ? "#FF3478" : "rgba(255,255,255,0.4)"} 
                            stroke="white" strokeWidth="2"
                            className="drop-shadow-md"
                          >
                            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.505 4.04 3 5.5l7 7Z" />
                          </motion.svg>
                        </div>

                        <div className="absolute top-2 left-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${festival.status === 'ended' ? 'bg-gray-500/80' : 'bg-[#FF3478]/90'} backdrop-blur-sm shadow-md`}>
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
                        <span className="text-[11px] text-[#FF3478] font-bold mb-1 block uppercase tracking-tight">{festival.category || "전통문화"}</span>
                        <h3 className="font-bold text-[14.5px] line-clamp-2 leading-snug mb-2 h-[40px] group-hover/card:text-[#FF3478] transition-colors">{festival.title}</h3>
                        <p className="text-[12px] text-[#555555] font-semibold mb-0.5">{festival.location}</p>
                        <p className="text-[12px] text-gray-400">{festival.date}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>

              {/* 섹션 2: 인기 급상승 */}
              <section className="mb-16 relative group">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-[22px] font-extrabold">지금 인기 급상승 🔥</h2>
                  <div className="flex gap-2">
                    <button onClick={() => handleScroll(risingScrollRef, "left")} className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center bg-white shadow-sm hover:bg-gray-50 transition-all"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18L9 12L15 6"/></svg></button>
                    <button onClick={() => handleScroll(risingScrollRef, "right")} className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center bg-white shadow-sm hover:bg-gray-50 transition-all"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg></button>
                  </div>
                </div>

                <div ref={risingScrollRef} className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-4">
                  {(mockFestivals as Festival[]).map((festival) => (
                    <Link to={`/festival/${festival.id}`} key={`rising-${festival.id}`} className="min-w-[calc(50%-10px)] md:min-w-[calc(20%-12.8px)] snap-start group/card cursor-pointer">
                      <div className="relative mb-3 aspect-[4/5] rounded-xl overflow-hidden shadow-sm bg-gray-50">
                        <img src={festival.image} alt={festival.title} className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-110" />
                        
                        <div 
                          onClick={(e) => toggleWishlist(e, festival.id)}
                          className="absolute top-2 right-2 z-10 cursor-pointer select-none"
                          style={heartBtnStyle}
                        >
                          <motion.svg 
                            whileTap={{ scale: 0.7 }}
                            width="24" height="24" viewBox="0 0 24 24" 
                            fill={wishlistedIds.includes(festival.id) ? "#FF3478" : "rgba(255,255,255,0.4)"} 
                            stroke="white" strokeWidth="2"
                            className="drop-shadow-md"
                          >
                            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.505 4.04 3 5.5l7 7Z" />
                          </motion.svg>
                        </div>

                        <div className="absolute top-2 left-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${festival.status === 'upcoming' ? 'bg-blue-500/90' : 'bg-orange-500/90'} backdrop-blur-sm shadow-md`}>
                            {getStatusLabel(festival.status)}
                          </span>
                        </div>
                      </div>
                      <div className="px-1">
                        <span className="text-[11px] text-gray-400 font-bold mb-1 block uppercase tracking-tight">{festival.category || "자연생태계"}</span>
                        <h3 className="font-bold text-[14.5px] line-clamp-2 leading-snug mb-2 h-[40px] group-hover/card:text-[#FF3478] transition-colors">{festival.title}</h3>
                        <p className="text-[12px] text-[#555555] font-semibold mb-0.5">{festival.location}</p>
                        <p className="text-[12px] text-gray-400">{festival.date}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>

              {/* 섹션 3: 취향별 홀릭 */}
              <section className="mb-20 relative group">
                <div className="mb-6">
                  <h2 className="text-[22px] font-bold">
                    <span className="bg-[#D6E6FF] px-1 font-extrabold">취향에 따라 고르는 여행</span>, <span className="text-[#FF3478] font-black">홀릭</span>
                  </h2>
                </div>
                
                <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar">
                  {tastes.map((taste) => (
                    <button key={taste} onClick={() => setSelectedTaste(taste)} className={`px-4 py-2 rounded-full text-sm font-bold border transition-all shrink-0 ${selectedTaste === taste ? "bg-[#111111] text-white border-[#111111]" : "bg-[#F5F5F5] text-[#666666] border-transparent hover:bg-gray-200"}`}>{taste}</button>
                  ))}
                </div>

                <div ref={tasteScrollRef} className="flex gap-5 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-4">
                  {filteredList.map((festival) => (
                    <Link to={`/festival/${festival.id}`} key={`holic-${festival.id}`} className="min-w-[calc(80%-15px)] md:min-w-[calc(25%-15px)] snap-start group/card cursor-pointer">
                      <div className="relative mb-4 aspect-[1.4/1] rounded-2xl overflow-hidden shadow-md bg-gray-100">
                        <img src={festival.image} alt={festival.title} className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105" />
                        
                        <div 
                          onClick={(e) => toggleWishlist(e, festival.id)}
                          className="absolute top-3 right-3 z-10 cursor-pointer select-none"
                          style={heartBtnStyle}
                        >
                          <motion.svg 
                            whileTap={{ scale: 0.7 }}
                            width="28" height="28" viewBox="0 0 24 24" 
                            fill={wishlistedIds.includes(festival.id) ? "#FF3478" : "rgba(255,255,255,0.4)"} 
                            stroke="white" strokeWidth="2.5"
                            className="drop-shadow-xl transition-colors"
                          >
                            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.505 4.04 3 5.5l7 7Z" />
                          </motion.svg>
                        </div>

                        <div className="absolute top-3 left-3 flex gap-1.5">
                          <span className="bg-black/60 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-md">{festival.category || "문화공연"}</span>
                        </div>
                      </div>
                      <div className="px-1">
                        <h3 className="font-bold text-[17px] line-clamp-1 mb-1.5 group-hover/card:text-[#FF3478] transition-colors">{festival.title}</h3>
                        <p className="text-[13px] text-[#555555] font-semibold mb-0.5">{festival.location}</p>
                        <p className="text-[13px] text-gray-400 mb-2">{festival.date}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-[#FF3478] font-extrabold text-[18px]">LIVE</span>
                          <span className="font-black text-[18px]">축제 확인하기</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>

            </motion.div>
          ) : (
            <div className="h-[650px] bg-[#F8F9FA] rounded-[2rem] flex items-center justify-center border border-gray-100 overflow-hidden relative shadow-inner">
               <KoreaMap selectedRegion={selectedRegion} onRegionSelect={handleRegionSelect} />
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}