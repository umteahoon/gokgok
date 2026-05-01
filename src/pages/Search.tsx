import { useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom"; 
import { mockFestivals, topFestivals } from "@/lib/index";
import { KoreaMap } from "@/components/KoreaMap"; 
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  const [selectedTaste, setSelectedTaste] = useState("NEW");
  
  // 히어로 슬라이더 상태
  const [currentSlide, setCurrentSlide] = useState(0);
  const heroItems = topFestivals.slice(0, 5);

  // 테마 섹션 개폐 상태
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [wishlistedIds, setWishlistedIds] = useState<(string | number)[]>([]);

  const bestScrollRef = useRef<HTMLDivElement>(null);
  const risingScrollRef = useRef<HTMLDivElement>(null);
  const tasteScrollRef = useRef<HTMLDivElement>(null);

  const tastes = ["NEW", "자연생태", "체험", "전통문화", "겨울축제", "불꽃축제", "역사문화", "음식축제"];

  const themes = [
    { title: "자연과 함께하는 여행", items: mockFestivals.slice(0, 5) },
    { title: "화려한 축제, 체험을 하고 싶다면", items: topFestivals.slice(0, 5) },
    { title: "역사와 전통이 함께", items: [...topFestivals, ...mockFestivals].slice(5, 10) }
  ];

  // 슬라이드 이동 (이동 시 상세페이지 이동 방지)
  const nextSlide = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentSlide((prev) => (prev + 1) % heroItems.length);
  };

  const prevSlide = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentSlide((prev) => (prev - 1 + heroItems.length) % heroItems.length);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ongoing": return "진행중";
      case "upcoming": return "예정";
      case "ended": return "종료";
      default: return status;
    }
  };

  const toggleWishlist = (e: React.MouseEvent, id: string | number) => {
    e.preventDefault(); 
    e.stopPropagation(); 
    setWishlistedIds(prev => 
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  const filteredList = useMemo(() => {
    const combined = [...topFestivals, ...mockFestivals] as Festival[];
    const uniqueFestivals = combined.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
    
    return uniqueFestivals.filter(f => {
      const matchesRegion = selectedRegion ? f.location.includes(selectedRegion) : true;
      const matchesTaste = selectedTaste === "NEW" ? true : f.category === selectedTaste;
      return matchesRegion && matchesTaste;
    });
  }, [selectedRegion, selectedTaste]);

  const handleScroll = (ref: React.RefObject<HTMLDivElement>, direction: "left" | "right") => {
    if (ref.current) {
      const { scrollLeft, clientWidth } = ref.current;
      const moveAmount = clientWidth * 0.5; 
      const scrollTo = direction === "left" ? scrollLeft - moveAmount : scrollLeft + moveAmount;
      ref.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  const handleRegionSelect = (regionId: string) => {
    setSelectedRegion(regionId === selectedRegion ? "" : regionId);
  };

  const heartBtnStyle = { WebkitTapHighlightColor: 'transparent', outline: 'none' };

  return (
    <div className="w-full bg-white text-[#111111] pb-20 font-sans overflow-x-hidden pt-0 rounded-t-3xl">
      <main className="container mx-auto">
        
        {/* 상단 히어로 슬라이더 섹션 */}
        <section className="relative w-full h-[220px] md:h-[300px] mb-10 bg-black overflow-hidden md:rounded-b-[2.5rem] cursor-pointer">
          <AnimatePresence mode="wait">
            {/* 슬라이드 전체를 Link로 감싸서 클릭 시 이동하게 함 */}
            <Link to={`/festival/${heroItems[currentSlide].id}`} key={currentSlide} className="absolute inset-0 block">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 flex items-center justify-between px-10 md:px-24 lg:px-40"
              >
                {/* 배경 */}
                <div className="absolute inset-0">
                  <img src={heroItems[currentSlide].image} className="w-full h-full object-cover opacity-30 blur-md" alt="" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black via-black/30 to-transparent" />
                </div>

                {/* 텍스트 */}
                <div className="relative z-10 text-white max-w-sm">
                  <motion.h1 initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-xl md:text-3xl font-black mb-2 leading-tight drop-shadow-lg">
                    {heroItems[currentSlide].title}
                  </motion.h1>
                  <div className="text-gray-400 space-y-0.5 text-xs md:text-sm font-medium">
                    <p>📍 {heroItems[currentSlide].location}</p>
                    <p>📅 {heroItems[currentSlide].date}</p>
                  </div>
                </div>

                {/* 이미지 카드 */}
                <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="relative z-10 hidden md:block w-[180px] lg:w-[220px] aspect-[3/4] rounded-xl overflow-hidden shadow-2xl border border-white/10">
                  <img src={heroItems[currentSlide].image} className="w-full h-full object-cover" alt="" />
                </motion.div>
              </motion.div>
            </Link>
          </AnimatePresence>

          {/* 좌우 화살표 버튼 (Link 바깥 혹은 상위에 위치하여 별도 동작) */}
          <button 
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/5 hover:bg-white/15 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all active:scale-90"
          >
            <ChevronLeft size={22} />
          </button>
          <button 
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/5 hover:bg-white/15 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all active:scale-90"
          >
            <ChevronRight size={22} />
          </button>

          {/* 인디케이터 */}
          <div className="absolute bottom-6 right-10 z-20 flex items-center bg-black/40 backdrop-blur-lg px-4 py-1.5 rounded-full border border-white/5">
            <div className="text-white text-[10px] font-bold tracking-widest">
              {String(currentSlide + 1).padStart(2, '0')} <span className="text-gray-500 mx-1">/</span> {String(heroItems.length).padStart(2, '0')}
            </div>
          </div>
        </section>

        <div className="px-4">
          <div className="flex gap-6 mb-10 border-b border-gray-100">
            <button onClick={() => setActiveTab("list")} className={`pb-3 text-lg font-bold transition-colors relative ${activeTab === "list" ? "text-[#FF3478]" : "text-gray-400 hover:text-gray-600"}`}>목록보기 {activeTab === "list" && <motion.div layoutId="t-line" className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#FF3478]" />}</button>
            <button onClick={() => setActiveTab("map")} className={`pb-3 text-lg font-bold transition-colors relative ${activeTab === "map" ? "text-[#FF3478]" : "text-gray-400 hover:text-gray-600"}`}>지도보기 {activeTab === "map" && <motion.div layoutId="t-line" className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#FF3478]" />}</button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "list" ? (
              <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {/* 섹션 1: TOP! 베스트 축제 */}
                <section className="mb-16 relative group">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-[22px] font-extrabold italic underline decoration-[#FF3478]/20 underline-offset-8">TOP! 베스트 축제</h2>
                    <div className="flex gap-2">
                      <button onClick={() => handleScroll(bestScrollRef, "left")} className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center bg-white shadow-sm hover:bg-gray-50 transition-all"><ChevronLeft size={18} /></button>
                      <button onClick={() => handleScroll(bestScrollRef, "right")} className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center bg-white shadow-sm hover:bg-gray-50 transition-all"><ChevronRight size={18} /></button>
                    </div>
                  </div>
                  <div ref={bestScrollRef} className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-4">
                    {(topFestivals as Festival[]).map((festival, idx) => (
                      <Link to={`/festival/${festival.id}`} key={`best-${festival.id}`} className="min-w-[calc(50%-10px)] md:min-w-[calc(20%-12.8px)] snap-start group/card cursor-pointer">
                        <div className="relative mb-3 aspect-[4/5] rounded-xl overflow-hidden shadow-sm bg-gray-50">
                          <img src={festival.image} alt={festival.title} className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-110" />
                          <div onClick={(e) => toggleWishlist(e, festival.id)} className="absolute top-2 right-2 z-10 p-1 cursor-pointer" style={heartBtnStyle}>
                            <motion.svg whileTap={{ scale: 0.7 }} width="24" height="24" viewBox="0 0 24 24" fill={wishlistedIds.includes(festival.id) ? "#FF3478" : "rgba(255,255,255,0.4)"} stroke="white" strokeWidth="2" className="drop-shadow-md"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.505 4.04 3 5.5l7 7Z" /></motion.svg>
                          </div>
                          <div className="absolute top-2 left-2"><span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${festival.status === 'ended' ? 'bg-gray-500/80' : 'bg-[#FF3478]/90'} backdrop-blur-sm shadow-md`}>{getStatusLabel(festival.status)}</span></div>
                          <div className="absolute bottom-0 left-0 leading-none pointer-events-none text-[#111111] font-black italic text-5xl opacity-80 px-2 drop-shadow-lg">{idx + 1}</div>
                        </div>
                        <div className="px-1">
                          <span className="text-[11px] text-[#FF3478] font-bold mb-1 block uppercase tracking-tight">{festival.category}</span>
                          <h3 className="font-bold text-[14.5px] line-clamp-2 leading-snug mb-2 h-[40px] group-hover/card:text-[#FF3478] transition-colors">{festival.title}</h3>
                          <p className="text-[12px] text-[#555555] font-semibold mb-0.5">{festival.location}</p>
                          <p className="text-[12px] text-gray-400">{festival.date}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>

                {/* 섹션 2, 3, 4 (기존과 동일) */}
                <section className="mb-16 relative group">
                  <div className="flex justify-between items-center mb-6"><h2 className="text-[22px] font-extrabold">지금 인기 급상승 🔥</h2></div>
                  <div ref={risingScrollRef} className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-4">
                    {(mockFestivals as Festival[]).map((festival) => (
                      <Link to={`/festival/${festival.id}`} key={`rising-${festival.id}`} className="min-w-[calc(50%-10px)] md:min-w-[calc(20%-12.8px)] snap-start group/card cursor-pointer">
                        <div className="relative mb-3 aspect-[4/5] rounded-xl overflow-hidden shadow-sm bg-gray-50">
                          <img src={festival.image} alt={festival.title} className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-110" />
                          <div onClick={(e) => toggleWishlist(e, festival.id)} className="absolute top-2 right-2 z-10 p-1 cursor-pointer" style={heartBtnStyle}><motion.svg whileTap={{ scale: 0.7 }} width="24" height="24" viewBox="0 0 24 24" fill={wishlistedIds.includes(festival.id) ? "#FF3478" : "rgba(255,255,255,0.4)"} stroke="white" strokeWidth="2" className="drop-shadow-md"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.505 4.04 3 5.5l7 7Z" /></motion.svg></div>
                          <div className="absolute top-2 left-2"><span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${festival.status === 'ended' ? 'bg-gray-500/80' : 'bg-[#FF3478]/90'} backdrop-blur-sm shadow-md`}>{getStatusLabel(festival.status)}</span></div>
                        </div>
                        <div className="px-1"><h3 className="font-bold text-[14.5px] line-clamp-2 leading-snug mb-2 group-hover/card:text-[#FF3478] transition-colors">{festival.title}</h3><p className="text-[12px] text-gray-400">{festival.date}</p></div>
                      </Link>
                    ))}
                  </div>
                </section>

                <section className="mb-20 relative group">
                  <div className="mb-6"><h2 className="text-[22px] font-bold">취향에 따라 고르는 여행</h2></div>
                  <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar">
                    {tastes.map((taste) => (<button key={taste} onClick={() => setSelectedTaste(taste)} className={`px-4 py-2 rounded-full text-sm font-bold border transition-all shrink-0 ${selectedTaste === taste ? "bg-[#111111] text-white border-[#111111]" : "bg-[#F5F5F5] text-[#666666] border-transparent"}`}>{taste}</button>))}
                  </div>
                  <div ref={tasteScrollRef} className="flex gap-5 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-4">
                    {filteredList.map((festival) => (
                      <Link to={`/festival/${festival.id}`} key={`holic-${festival.id}`} className="w-[280px] md:w-[320px] flex-shrink-0 snap-start group/card cursor-pointer">
                        <div className="relative mb-4 aspect-[1.4/1] rounded-2xl overflow-hidden shadow-md bg-gray-100">
                          <img src={festival.image} alt={festival.title} className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105" />
                          <div className="absolute top-3 left-3 flex flex-col gap-1"><span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white w-fit ${festival.status === 'ended' ? 'bg-gray-500/80' : 'bg-[#FF3478]/90'} backdrop-blur-sm shadow-md`}>{getStatusLabel(festival.status)}</span></div>
                        </div>
                        <h3 className="font-bold text-[17px] line-clamp-1 group-hover/card:text-[#FF3478] transition-colors">{festival.title}</h3>
                        <p className="text-[13px] text-gray-500 mt-1">{festival.location}</p>
                      </Link>
                    ))}
                  </div>
                </section>

                <section className="mb-20 space-y-4">
                  <h2 className="text-[22px] font-extrabold mb-6">테마 추천</h2>
                  {themes.map((theme, idx) => {
                    const isExpanded = expandedIndex === idx;
                    return (
                      <div key={idx} className={`border rounded-2xl overflow-hidden transition-all duration-300 ${isExpanded ? "border-blue-500 ring-1 ring-blue-500 shadow-md" : "border-gray-200 shadow-sm"}`}>
                        <button onClick={() => setExpandedIndex(isExpanded ? null : idx)} className="w-full px-6 py-5 flex justify-between items-center bg-white transition-colors"><span className={`text-lg font-bold ${isExpanded ? "text-gray-900" : "text-gray-500"}`}>{theme.title}</span><ChevronLeft className={`w-6 h-6 transition-transform duration-300 ${isExpanded ? "-rotate-90 text-blue-500" : "rotate-0 text-gray-400"}`} /></button>
                        <AnimatePresence>{isExpanded && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}><div className="px-6 pb-8"><div className="flex gap-4 overflow-x-auto no-scrollbar pb-2 snap-x">{theme.items.map((item) => (<Link to={`/festival/${item.id}`} key={item.id} className="min-w-[160px] md:min-w-[200px] snap-start group/item relative"><div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-2"><img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover/item:scale-110" /><div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4"><p className="text-white font-bold text-sm leading-tight line-clamp-2">{item.title}</p></div></div></Link>))}</div></div></motion.div>)}</AnimatePresence>
                      </div>
                    );
                  })}
                </section>
              </motion.div>
            ) : (
              <div className="h-[650px] bg-[#F8F9FA] rounded-[2rem] flex items-center justify-center border border-gray-100 overflow-hidden relative shadow-inner"><KoreaMap selectedRegion={selectedRegion} onRegionSelect={handleRegionSelect} /></div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}