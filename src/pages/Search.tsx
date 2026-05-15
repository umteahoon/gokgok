import { useState, useRef, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom"; 
import { mockFestivals, topFestivals } from "@/lib/index";
import { KoreaMap } from "@/components/KoreaMap"; 
import { ChevronLeft, ChevronRight, Heart, MapPin, Search as SearchIcon, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Festival { id: string | number; title: string; image: string; date: string; location: string; status: string; category?: string; description?: string; }
const REGION_NAME_MAP: Record<string, string> = { Seoul: "서울", Gyeonggi: "경기", Incheon: "인천", Gangwon: "강원", Chungnam: "충남", Chungbuk: "충북", Daejeon: "대전", Sejong: "세종", Jeonbuk: "전북", Jeonnam: "전남", Gwangju: "광주", Gyeongbuk: "경북", Gyeongnam: "경남", Daegu: "대구", Busan: "부산", Ulsan: "울산", Jeju: "제주" };

export default function Search() {  
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"list" | "map">("list");
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedTaste, setSelectedTaste] = useState("NEW");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [wishlistedIds, setWishlistedIds] = useState<string[]>([]);
  
  // ✅ 검색 관련 상태 추가
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const heroItems = topFestivals.slice(0, 5);

  useEffect(() => { heroItems.forEach((item) => { const img = new Image(); img.src = item.image; }); }, [heroItems]);
  useEffect(() => { const savedWishlist = JSON.parse(localStorage.getItem("gokgok_wishlist") || "[]"); setWishlistedIds(savedWishlist.map((id: string | number) => String(id))); }, []);

  const bestScrollRef = useRef<HTMLDivElement>(null); 
  const risingScrollRef = useRef<HTMLDivElement>(null); 
  const tasteScrollRef = useRef<HTMLDivElement>(null);
  
  const tastes = ["NEW", "자연생태", "체험", "전통문화", "겨울축제", "불꽃축제", "역사문화", "음식축제"];
  const themes = [ { title: "자연과 함께하는 여행", items: mockFestivals.slice(0, 5) }, { title: "화려한 축제, 체험을 하고 싶다면", items: topFestivals.slice(0, 5) }, { title: "역사와 전통이 함께", items: [...topFestivals, ...mockFestivals].slice(5, 10) } ];

  // ✅ 실시간 검색 로직
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const combined = [...topFestivals, ...mockFestivals] as Festival[];
    const unique = combined.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
    return unique.filter(f => 
      f.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      f.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const regionFestivals = useMemo(() => {
    if (!selectedRegion) return [];
    const combined = [...topFestivals, ...mockFestivals] as Festival[];
    const unique = combined.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
    const target = REGION_NAME_MAP[selectedRegion] || selectedRegion;
    return unique.filter(f => f.location.includes(target));
  }, [selectedRegion]);

  const filteredList = useMemo(() => {
    const combined = [...topFestivals, ...mockFestivals] as Festival[];
    const unique = combined.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
    return unique.filter(f => selectedTaste === "NEW" ? true : f.category === selectedTaste);
  }, [selectedTaste]);

  const nextSlide = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); setCurrentSlide((p) => (p + 1) % heroItems.length); };
  const prevSlide = (e: React.MouseEvent) => { e.preventDefault(); e.stopPropagation(); setCurrentSlide((p) => (p - 1 + heroItems.length) % heroItems.length); };
  const getStatusLabel = (s: string) => { switch (s) { case "ongoing": return "진행중"; case "upcoming": return "예정"; case "ended": return "종료"; default: return s; } };

  const toggleWishlist = (e: React.MouseEvent, id: string | number) => {
    e.preventDefault(); e.stopPropagation(); 
    const strId = String(id);
    const saved = JSON.parse(localStorage.getItem("gokgok_wishlist") || "[]");
    let updated;
    if (wishlistedIds.includes(strId)) {
      updated = saved.filter((i: string | number) => String(i) !== strId);
      toast({ title: "찜 취소", description: "관심 목록에서 제거되었습니다." });
    } else {
      updated = [...saved, strId];
      toast({ title: "찜 완료", description: "관심 목록에 추가되었습니다." });
    }
    localStorage.setItem("gokgok_wishlist", JSON.stringify(updated));
    setWishlistedIds(updated.map((id: string | number) => String(id)));
  };

  const handleScroll = (ref: React.RefObject<HTMLDivElement>, dir: "left" | "right") => {
    if (ref.current) {
      const { scrollLeft, clientWidth } = ref.current;
      const move = clientWidth * 0.6; 
      ref.current.scrollTo({ left: dir === "left" ? scrollLeft - move : scrollLeft + move, behavior: "smooth" });
    }
  };

  const handleRegionSelect = (id: any) => {
    setSelectedRegion(id === selectedRegion ? "" : id);
  };

  const heartBtnStyle = { WebkitTapHighlightColor: 'transparent', outline: 'none' };

  return (
    <div className="w-full bg-white dark:bg-[#111111] text-[#111111] dark:text-white pb-20 font-sans overflow-x-hidden pt-10 rounded-t-3xl transition-colors">
      <main className="container mx-auto">
        {/* 히어로 슬라이더 (건드리지 않음) */}
        <section className="relative w-[calc(100%-2rem)] mx-auto h-[220px] md:h-[320px] mb-16 bg-black overflow-hidden rounded-[2.5rem] md:rounded-[3.5rem] shadow-xl">
          <AnimatePresence mode="popLayout">
            <motion.div key={currentSlide} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="absolute inset-0">
              <Link to={`/festival/${heroItems[currentSlide].id}`} className="relative flex items-center justify-between px-10 md:px-24 lg:px-40 h-full w-full">
                <div className="absolute inset-0"><img src={heroItems[currentSlide].image} className="w-full h-full object-cover opacity-30 blur-md" alt="" /><div className="absolute inset-0 bg-gradient-to-r from-black via-black/30 to-transparent" /></div>
                <div className="relative z-10 text-white max-w-sm">
                  <motion.h1 initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-xl md:text-3xl font-black mb-2 leading-tight drop-shadow-lg">{heroItems[currentSlide].title}</motion.h1>
                  <div className="text-gray-400 space-y-0.5 text-xs md:text-sm font-medium"><p>📍 {heroItems[currentSlide].location}</p><p>📅 {heroItems[currentSlide].date}</p></div>
                </div>
                <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="relative z-10 hidden md:block w-[180px] lg:w-[220px] aspect-[3/4] rounded-xl overflow-hidden shadow-2xl border border-white/10"><img src={heroItems[currentSlide].image} className="w-full h-full object-cover" alt="" /></motion.div>
              </Link>
            </motion.div>
          </AnimatePresence>
          <button onClick={prevSlide} className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all active:scale-90 shadow-md"><ChevronLeft size={24} /></button>
          <button onClick={nextSlide} className="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all active:scale-90 shadow-md"><ChevronRight size={24} /></button>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center bg-black/40 backdrop-blur-lg px-4 py-1.5 rounded-full border border-white/5"><div className="text-white text-[10px] font-bold tracking-widest">{String(currentSlide + 1).padStart(2, '0')} / {String(heroItems.length).padStart(2, '0')}</div></div>
        </section>

        <div className="px-4 max-w-[1200px] mx-auto">
          {/* ✅ 탭 및 검색 아이콘 버튼 */}
          <div className="flex items-center justify-between mb-10 border-b border-gray-100 dark:border-gray-800 relative">
            <div className="flex gap-6">
              <button onClick={() => setActiveTab("list")} className={`pb-3 text-lg font-bold transition-colors relative ${activeTab === "list" ? "text-[#FF3478]" : "text-gray-400"}`}>목록보기 {activeTab === "list" && <motion.div layoutId="t-line" className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#FF3478]" />}</button>
              <button onClick={() => setActiveTab("map")} className={`pb-3 text-lg font-bold transition-colors relative ${activeTab === "map" ? "text-[#FF3478]" : "text-gray-400"}`}>지도보기 {activeTab === "map" && <motion.div layoutId="t-line" className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#FF3478]" />}</button>
            </div>
            <button onClick={() => { setIsSearchOpen(!isSearchOpen); if(isSearchOpen) setSearchQuery(""); }} className={`pb-3 px-2 transition-colors ${isSearchOpen ? "text-[#FF3478]" : "text-gray-400"}`}>
              {isSearchOpen ? <X size={26} strokeWidth={2.5} /> : <SearchIcon size={26} strokeWidth={2.5} />}
            </button>
          </div>

          {/* ✅ 실시간 검색 입력창 */}
          <AnimatePresence>
            {isSearchOpen && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-12">
                <div className="relative max-w-3xl mx-auto">
                  <input autoFocus type="text" placeholder="축제 이름이나 키워드를 입력하세요" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-8 py-5 bg-[#F8F9FA] dark:bg-[#1a1a1a] rounded-[2rem] border-2 border-transparent focus:border-[#FF3478]/30 outline-none font-bold text-lg shadow-inner" />
                  <SearchIcon className="absolute right-8 top-1/2 -translate-y-1/2 text-[#FF3478]" size={24} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {activeTab === "list" ? (
              <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                
                {/* ✅ 검색 결과 섹션 */}
                {searchQuery && (
                  <section className="mb-16">
                    <h2 className="text-xl font-black mb-8 px-2">검색 결과 <span className="text-[#FF3478]">{searchResults.length}</span></h2>
                    {searchResults.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {searchResults.map((f) => (
                          <Link key={f.id} to={`/festival/${f.id}`} className="group flex gap-4 bg-white dark:bg-[#222] p-3 rounded-[1.5rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all">
                            <div className="w-20 h-20 md:w-24 md:h-24 shrink-0 rounded-xl overflow-hidden bg-gray-50"><img src={f.image} className="w-full h-full object-cover" alt="" /></div>
                            <div className="flex flex-col justify-center overflow-hidden">
                              <span className="text-[10px] text-[#FF3478] font-black mb-1 uppercase tracking-tighter">{f.category}</span>
                              <h4 className="font-bold text-[16px] text-gray-900 dark:text-white truncate">{f.title}</h4>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{f.location}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="py-20 text-center bg-gray-50 dark:bg-[#1a1a1a] rounded-[2.5rem] border border-dashed border-gray-200">일치하는 축제가 없습니다.</div>
                    )}
                  </section>
                )}

                {/* 섹션 1: TOP! 베스트 축제 */}
                <section className="mb-16 relative group">
                  <div className="flex justify-between items-center mb-6"><h2 className="text-[22px] font-extrabold italic underline decoration-[#FF3478]/20 underline-offset-8 text-gray-900 dark:text-white">TOP! 베스트 축제</h2><div className="flex gap-2"><button onClick={() => handleScroll(bestScrollRef, "left")} className="w-9 h-9 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center bg-white dark:bg-[#222] shadow-sm hover:bg-gray-50 dark:hover:bg-[#333] transition-all"><ChevronLeft size={18} /></button><button onClick={() => handleScroll(bestScrollRef, "right")} className="w-9 h-9 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center bg-white dark:bg-[#222] shadow-sm hover:bg-gray-50 dark:hover:bg-[#333] transition-all"><ChevronRight size={18} /></button></div></div>
                  {/* ✅ 스크롤바 제거 스타일 추가 */}
                  <div ref={bestScrollRef} className="flex gap-4 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory pb-4">
                    {topFestivals.map((festival, idx) => (
                      <Link to={`/festival/${festival.id}`} key={`best-${festival.id}`} className="min-w-[calc(50%-10px)] md:min-w-[calc(20%-12.8px)] snap-start group/card cursor-pointer">
                        <div className="relative mb-3 aspect-[4/5] rounded-xl overflow-hidden shadow-sm bg-gray-50 dark:bg-[#222222]">
                          <img src={festival.image} alt={festival.title} className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-110" />
                          <div onClick={(e) => toggleWishlist(e, festival.id)} className="absolute top-2 right-2 z-10 p-1 cursor-pointer" style={heartBtnStyle}><motion.div whileTap={{ scale: 0.7 }}><Heart className={`w-6 h-6 drop-shadow-md transition-colors ${wishlistedIds.includes(String(festival.id)) ? "fill-[#FF3478] text-[#FF3478]" : "text-white/70 hover:text-white"}`} /></motion.div></div>
                          <div className="absolute top-2 left-2"><span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${festival.status === 'ended' ? 'bg-gray-500/80' : 'bg-[#FF3478]/90'} backdrop-blur-sm shadow-md`}>{getStatusLabel(festival.status || "")}</span></div>
                          {/* ✅ 숫자 색깔 하얀색 변경 및 그림자 추가 */}
                          <div className="absolute bottom-0 left-0 leading-none pointer-events-none text-white font-black italic text-5xl opacity-90 px-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">{idx + 1}</div>
                        </div>
                        <div className="px-1"><span className="text-[11px] text-[#FF3478] font-bold mb-1 block uppercase tracking-tight">{festival.category}</span><h3 className="font-bold text-[14.5px] line-clamp-2 h-[40px] text-gray-900 dark:text-white group-hover/card:text-[#FF3478]">{festival.title}</h3><p className="text-[12px] text-[#555555] dark:text-gray-400 font-semibold mb-0.5">{festival.location}</p></div>
                      </Link>
                    ))}
                  </div>
                </section>

                {/* 섹션 2: 지금 인기 급상승 🔥 */}
                <section className="mb-16 relative group">
                  <div className="flex justify-between items-center mb-6"><h2 className="text-[22px] font-extrabold text-gray-900 dark:text-white">지금 인기 급상승 🔥</h2><div className="flex gap-2"><button onClick={() => handleScroll(risingScrollRef, "left")} className="w-9 h-9 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center bg-white dark:bg-[#222] shadow-sm hover:bg-gray-50 dark:hover:bg-[#333] transition-all"><ChevronLeft size={18} /></button><button onClick={() => handleScroll(risingScrollRef, "right")} className="w-9 h-9 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center bg-white dark:bg-[#222] shadow-sm hover:bg-gray-50 dark:hover:bg-[#333] transition-all"><ChevronRight size={18} /></button></div></div>
                  <div ref={risingScrollRef} className="flex gap-4 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory pb-4">
                    {mockFestivals.map((festival) => (
                      <Link to={`/festival/${festival.id}`} key={`rising-${festival.id}`} className="min-w-[calc(50%-10px)] md:min-w-[calc(20%-12.8px)] snap-start group/card cursor-pointer">
                        <div className="relative mb-3 aspect-[4/5] rounded-xl overflow-hidden shadow-sm bg-gray-50 dark:bg-[#222222]">
                          <img src={festival.image} alt={festival.title} className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-110" />
                          <div onClick={(e) => toggleWishlist(e, festival.id)} className="absolute top-2 right-2 z-10 p-1 cursor-pointer" style={heartBtnStyle}><motion.div whileTap={{ scale: 0.7 }}><Heart className={`w-6 h-6 drop-shadow-md transition-colors ${wishlistedIds.includes(String(festival.id)) ? "fill-[#FF3478] text-[#FF3478]" : "text-white/70 hover:text-white"}`} /></motion.div></div>
                        </div>
                        <div className="px-1"><h3 className="font-bold text-[14.5px] line-clamp-2 h-[40px] text-gray-900 dark:text-white group-hover/card:text-[#FF3478] transition-colors">{festival.title}</h3></div>
                      </Link>
                    ))}
                  </div>
                </section>

                {/* 섹션 3: 취향에 따라 고르는 여행 */}
                <section className="mb-20 relative group">
                  <div className="flex justify-between items-center mb-6"><h2 className="text-[22px] font-bold text-gray-900 dark:text-white">취향에 따라 고르는 여행</h2><div className="flex gap-2"><button onClick={() => handleScroll(tasteScrollRef, "left")} className="w-9 h-9 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center bg-white dark:bg-[#222] shadow-sm hover:bg-gray-50 dark:hover:bg-[#333] transition-all"><ChevronLeft size={18} /></button><button onClick={() => handleScroll(tasteScrollRef, "right")} className="w-9 h-9 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center bg-white dark:bg-[#222] shadow-sm hover:bg-gray-50 dark:hover:bg-[#333] transition-all"><ChevronRight size={18} /></button></div></div>
                  <div className="flex gap-2 mb-8 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">{tastes.map((taste) => (<button key={taste} onClick={() => setSelectedTaste(taste)} className={`px-4 py-2 rounded-full text-sm font-bold border transition-all shrink-0 ${selectedTaste === taste ? "bg-[#111111] dark:bg-white text-white dark:text-[#111111] border-[#111111] dark:border-white" : "bg-[#F5F5F5] dark:bg-[#222222] text-[#666666] border-transparent"}`}>{taste}</button>))}</div>
                  <div ref={tasteScrollRef} className="flex gap-5 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory pb-4">
                    {filteredList.map((festival) => (
                      <Link to={`/festival/${festival.id}`} key={`holic-${festival.id}`} className="w-[280px] md:w-[320px] flex-shrink-0 snap-start group/card cursor-pointer">
                        <div className="relative mb-4 aspect-[1.4/1] rounded-2xl overflow-hidden shadow-md bg-gray-100 dark:bg-[#222222]"><img src={festival.image} alt={festival.title} className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105" /></div>
                        <h3 className="font-bold text-[17px] line-clamp-1 text-gray-900 dark:text-white group-hover/card:text-[#FF3478] transition-colors">{festival.title}</h3>
                        <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-1">{festival.location}</p>
                      </Link>
                    ))}
                  </div>
                </section>

                {/* 섹션 4: 테마 추천 (Accordion) */}
                <section className="mb-20 space-y-4">
                  <h2 className="text-[22px] font-extrabold mb-6 text-gray-900 dark:text-white">테마 추천</h2>
                  {themes.map((theme, idx) => {
                    const isExpanded = expandedIndex === idx;
                    return (
                      <div key={idx} className={`border rounded-2xl overflow-hidden transition-all duration-300 ${isExpanded ? "border-blue-500 ring-1 ring-blue-500 shadow-md" : "border-gray-200 dark:border-gray-800 shadow-sm"}`}>
                        <button onClick={() => setExpandedIndex(isExpanded ? null : idx)} className="w-full px-6 py-5 flex justify-between items-center bg-white dark:bg-[#1a1a1a] transition-colors"><span className={`text-lg font-bold ${isExpanded ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"}`}>{theme.title}</span><ChevronLeft className={`w-6 h-6 transition-transform duration-300 ${isExpanded ? "-rotate-90 text-blue-500" : "rotate-0 text-gray-400"}`} /></button>
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="bg-white dark:bg-[#1a1a1a]">
                              <div className="px-6 pb-8">
                                <div className="flex gap-4 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-2 snap-x">
                                  {theme.items.map((item) => (
                                    <Link to={`/festival/${item.id}`} key={item.id} className="min-w-[160px] md:min-w-[200px] snap-start group/item relative">
                                      <div className="aspect-[3/4] rounded-2xl overflow-hidden mb-2 shadow-sm"><img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover/item:scale-110" /></div>
                                      <p className="text-gray-900 dark:text-white font-bold text-sm leading-tight line-clamp-2">{item.title}</p>
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </section>
              </motion.div>
            ) : (
              /* 지도보기 탭 */
              <motion.div key="map-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-[650px]">
                <div className="lg:col-span-7 bg-[#F8F9FA] dark:bg-[#1a1a1a] rounded-[3rem] flex items-center justify-center border border-gray-100 dark:border-[#333] overflow-hidden relative shadow-inner p-4">
                   <KoreaMap selectedRegion={selectedRegion} onRegionSelect={handleRegionSelect} />
                </div>
                <div className="lg:col-span-5 flex flex-col">
                   {selectedRegion ? (
                     <div className="flex flex-col h-full">
                       <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-6 px-2">{REGION_NAME_MAP[selectedRegion]} 축제</h3>
                       <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] space-y-4 pr-2">
                         {regionFestivals.map((festival) => (
                           <Link to={`/festival/${festival.id}`} key={`map-item-${festival.id}`} className="group flex gap-4 bg-white dark:bg-[#222] p-3 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all active:scale-[0.98]">
                             <div className="w-24 h-24 shrink-0 rounded-2xl overflow-hidden shadow-sm"><img src={festival.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform" /></div>
                             <div className="flex flex-col justify-center overflow-hidden">
                               <span className="text-[10px] text-[#FF3478] font-bold mb-0.5">{festival.category}</span>
                               <h4 className="font-bold text-[16px] text-gray-900 dark:text-white truncate group-hover:text-[#FF3478] transition-colors">{festival.title}</h4>
                               <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{festival.location}</p>
                             </div>
                           </Link>
                         ))}
                       </div>
                     </div>
                   ) : (
                     <div className="h-full flex flex-col items-center justify-center text-center bg-gray-50 dark:bg-[#1a1a1a] rounded-[2.5rem] border border-dashed border-gray-200 dark:border-gray-800 p-10">
                       <MapPin className="text-gray-300 dark:text-gray-500 w-12 h-12 mb-4" />
                       <h4 className="text-gray-600 dark:text-gray-300 font-bold mb-2 text-lg">지역을 선택해 보세요</h4>
                     </div>
                   )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}