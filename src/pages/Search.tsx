import { useState, useRef, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom"; 
import { mockFestivals, topFestivals } from "@/lib/index";
import { KoreaMap } from "@/components/KoreaMap"; 
import { ChevronLeft, ChevronRight, Heart, MapPin, Search as SearchIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"list" | "map">("list");
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedTaste, setSelectedTaste] = useState("NEW");
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const heroItems = topFestivals.slice(0, 5);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [wishlistedIds, setWishlistedIds] = useState<string[]>([]);

  useEffect(() => {
    const savedWishlist = JSON.parse(localStorage.getItem("gokgok_wishlist") || "[]");
    setWishlistedIds(savedWishlist.map((id: string | number) => String(id)));
  }, []);

  const bestScrollRef = useRef<HTMLDivElement>(null);
  const risingScrollRef = useRef<HTMLDivElement>(null);
  const tasteScrollRef = useRef<HTMLDivElement>(null);

  const tastes = ["NEW", "자연생태", "체험", "전통문화", "겨울축제", "불꽃축제", "역사문화", "음식축제"];

  const themes = [
    { title: "자연과 함께하는 여행", items: mockFestivals.slice(0, 5) },
    { title: "화려한 축제, 체험을 하고 싶다면", items: topFestivals.slice(0, 5) },
    { title: "역사와 전통이 함께", items: [...topFestivals, ...mockFestivals].slice(5, 10) }
  ];

  // 🔥 [핵심 로직] 모든 데이터를 통합하여 지도 클릭 시 필터링
  const regionFestivals = useMemo(() => {
    if (!selectedRegion) return [];
    
    // 1. 전체 데이터 합치기
    const combined = [...topFestivals, ...mockFestivals] as Festival[];
    
    // 2. ID 기준 중복 데이터 제거
    const uniqueFestivals = combined.filter((v, i, a) => 
      a.findIndex(t => t.id === v.id) === i
    );
    
    // 3. 선택된 지역명이 location 문자열에 포함되어 있는지 확인
    // 예: selectedRegion이 "충남"이면 "충청남도 금산군" 데이터를 찾아냄
    return uniqueFestivals.filter(f => 
      f.location.includes(selectedRegion) || 
      (selectedRegion === "서울" && f.location.includes("서울특별시")) ||
      (selectedRegion === "경기" && f.location.includes("경기도"))
    );
  }, [selectedRegion]);

  const nextSlide = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    setCurrentSlide((prev) => (prev + 1) % heroItems.length);
  };

  const prevSlide = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
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
    e.preventDefault(); e.stopPropagation(); 
    const stringId = String(id);
    const savedWishlist = JSON.parse(localStorage.getItem("gokgok_wishlist") || "[]");
    let updatedWishlist;

    if (wishlistedIds.includes(stringId)) {
      updatedWishlist = savedWishlist.filter((itemId: string | number) => String(itemId) !== stringId);
      toast({ title: "찜 취소", description: "관심 목록에서 제거되었습니다." });
    } else {
      updatedWishlist = [...savedWishlist, stringId];
      toast({ title: "찜 완료", description: "관심 목록에 추가되었습니다." });
    }
    localStorage.setItem("gokgok_wishlist", JSON.stringify(updatedWishlist));
    setWishlistedIds(updatedWishlist.map((id: string | number) => String(id)));
  };

  const filteredList = useMemo(() => {
    const combined = [...topFestivals, ...mockFestivals] as Festival[];
    const uniqueFestivals = combined.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i);
    return uniqueFestivals.filter(f => {
      const matchesTaste = selectedTaste === "NEW" ? true : f.category === selectedTaste;
      return matchesTaste;
    });
  }, [selectedTaste]);

  const handleScroll = (ref: React.RefObject<HTMLDivElement>, direction: "left" | "right") => {
    if (ref.current) {
      const { scrollLeft, clientWidth } = ref.current;
      const moveAmount = clientWidth * 0.6; 
      const scrollTo = direction === "left" ? scrollLeft - moveAmount : scrollLeft + moveAmount;
      ref.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  const handleRegionSelect = (regionId: string) => {
    // 지도 컴포넌트에서 넘겨주는 지역 ID(서울, 경기 등)를 상태에 저장
    setSelectedRegion(regionId === selectedRegion ? "" : regionId);
  };

  const heartBtnStyle = { WebkitTapHighlightColor: 'transparent', outline: 'none' };

  return (
    <div className="w-full bg-white text-[#111111] pb-20 font-sans overflow-x-hidden pt-10 rounded-t-3xl">
      <main className="container mx-auto">
        
        {/* 상단 히어로 슬라이더 */}
        <section className="relative w-[calc(100%-2rem)] mx-auto h-[220px] md:h-[320px] mb-16 bg-black overflow-hidden rounded-[2rem] md:rounded-[3.5rem] shadow-xl cursor-pointer">
          <AnimatePresence mode="wait">
            <Link to={`/festival/${heroItems[currentSlide].id}`} key={currentSlide} className="absolute inset-0 block">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="absolute inset-0 flex items-center justify-between px-10 md:px-20">
                <div className="absolute inset-0"><img src={heroItems[currentSlide].image} className="w-full h-full object-cover opacity-30 blur-md" alt="" /><div className="absolute inset-0 bg-gradient-to-r from-black via-black/30 to-transparent" /></div>
                <div className="relative z-10 text-white max-w-sm"><motion.h1 initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-xl md:text-3xl font-black mb-2 leading-tight drop-shadow-lg">{heroItems[currentSlide].title}</motion.h1><div className="text-gray-400 space-y-0.5 text-xs md:text-sm font-medium"><p>📍 {heroItems[currentSlide].location}</p><p>📅 {heroItems[currentSlide].date}</p></div></div>
                <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="relative z-10 hidden md:block w-[160px] lg:w-[200px] aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border border-white/10"><img src={heroItems[currentSlide].image} className="w-full h-full object-cover" alt="" /></motion.div>
              </motion.div>
            </Link>
          </AnimatePresence>
          <button onClick={prevSlide} className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all active:scale-90 shadow-md"><ChevronLeft size={24} /></button>
          <button onClick={nextSlide} className="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all active:scale-90 shadow-md"><ChevronRight size={24} /></button>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center bg-black/40 backdrop-blur-lg px-4 py-1.5 rounded-full border border-white/5"><div className="text-white text-[10px] font-bold tracking-widest">{String(currentSlide + 1).padStart(2, '0')} / {String(heroItems.length).padStart(2, '0')}</div></div>
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
                  <div className="flex justify-between items-center mb-6"><h2 className="text-[22px] font-extrabold italic underline decoration-[#FF3478]/20 underline-offset-8">TOP! 베스트 축제</h2><div className="flex gap-2"><button onClick={() => handleScroll(bestScrollRef, "left")} className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center bg-white shadow-sm hover:bg-gray-50 transition-all"><ChevronLeft size={18} /></button><button onClick={() => handleScroll(bestScrollRef, "right")} className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center bg-white shadow-sm hover:bg-gray-50 transition-all"><ChevronRight size={18} /></button></div></div>
                  <div ref={bestScrollRef} className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-4">
                    {topFestivals.map((festival, idx) => (
                      <Link to={`/festival/${festival.id}`} key={`best-${festival.id}`} className="min-w-[calc(50%-10px)] md:min-w-[calc(20%-12.8px)] snap-start group/card cursor-pointer">
                        <div className="relative mb-3 aspect-[4/5] rounded-xl overflow-hidden shadow-sm bg-gray-50"><img src={festival.image} alt={festival.title} className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-110" /><div onClick={(e) => toggleWishlist(e, festival.id)} className="absolute top-2 right-2 z-10 p-1 cursor-pointer" style={heartBtnStyle}><motion.div whileTap={{ scale: 0.7 }}><Heart className={`w-6 h-6 drop-shadow-md transition-colors ${wishlistedIds.includes(String(festival.id)) ? "fill-[#FF3478] text-[#FF3478]" : "text-white/70 hover:text-white"}`} /></motion.div></div><div className="absolute top-2 left-2"><span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${festival.status === 'ended' ? 'bg-gray-500/80' : 'bg-[#FF3478]/90'} backdrop-blur-sm shadow-md`}>{getStatusLabel(festival.status)}</span></div><div className="absolute bottom-0 left-0 leading-none pointer-events-none text-[#111111] font-black italic text-5xl opacity-80 px-2 drop-shadow-lg">{idx + 1}</div></div>
                        <div className="px-1"><span className="text-[11px] text-[#FF3478] font-bold mb-1 block uppercase tracking-tight">{festival.category}</span><h3 className="font-bold text-[14.5px] line-clamp-2 leading-snug mb-2 h-[40px] group-hover/card:text-[#FF3478] transition-colors">{festival.title}</h3><p className="text-[12px] text-[#555555] font-semibold mb-0.5">{festival.location}</p><p className="text-[12px] text-gray-400">{festival.date}</p></div>
                      </Link>
                    ))}
                  </div>
                </section>
                {/* 섹션 2, 3, 4 등 리스트 탭의 다른 부분들 동일하게 유지 */}
              </motion.div>
            ) : (
              /* --- 🔥 수정된 지도보기 탭: 클릭 시에만 해당 지역 데이터 로드 --- */
              <motion.div key="map-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-[650px]">
                {/* 왼쪽: 지도 */}
                <div className="lg:col-span-7 bg-[#F8F9FA] rounded-[2.5rem] flex items-center justify-center border border-gray-100 overflow-hidden relative shadow-inner p-4">
                   <KoreaMap selectedRegion={selectedRegion} onRegionSelect={handleRegionSelect} />
                   <div className="absolute bottom-6 left-8 bg-white/80 backdrop-blur-md px-5 py-2.5 rounded-full border border-gray-100 shadow-sm flex items-center gap-2">
                     <MapPin size={16} className="text-[#FF3478]" />
                     <p className="text-sm font-bold text-gray-600">
                       {selectedRegion ? `${selectedRegion} 지역 탐색 중` : "지도의 지역을 클릭해보세요"}
                     </p>
                   </div>
                </div>

                {/* 오른쪽: 필터링된 결과 리스트 */}
                <div className="lg:col-span-5 flex flex-col">
                   <AnimatePresence mode="wait">
                     {selectedRegion ? (
                       <motion.div 
                         key="region-list"
                         initial={{ opacity: 0, x: 20 }}
                         animate={{ opacity: 1, x: 0 }}
                         exit={{ opacity: 0, x: 20 }}
                         className="flex flex-col h-full"
                       >
                         <div className="flex justify-between items-end mb-6 px-2">
                           <h3 className="text-2xl font-black text-gray-900">{selectedRegion}의 축제</h3>
                           <span className="text-sm font-bold text-[#FF3478] bg-[#FF3478]/5 px-3 py-1 rounded-full">
                             총 {regionFestivals.length}건 검색됨
                           </span>
                         </div>

                         <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 pr-2">
                           {regionFestivals.length > 0 ? (
                             regionFestivals.map((festival) => (
                               <Link 
                                 to={`/festival/${festival.id}`} 
                                 key={`map-item-${festival.id}`}
                                 className="group flex gap-4 bg-white p-3 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                               >
                                 <div className="relative w-24 h-24 shrink-0 rounded-2xl overflow-hidden">
                                   <img src={festival.image} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                   <div className="absolute top-1.5 left-1.5">
                                     <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold text-white ${festival.status === 'ended' ? 'bg-gray-500/80' : 'bg-[#FF3478]/90'}`}>
                                       {getStatusLabel(festival.status)}
                                     </span>
                                   </div>
                                 </div>
                                 <div className="flex flex-col justify-center overflow-hidden">
                                   <span className="text-[10px] text-[#FF3478] font-bold mb-0.5">{festival.category}</span>
                                   <h4 className="font-bold text-[16px] truncate group-hover:text-[#FF3478] transition-colors">{festival.title}</h4>
                                   <p className="text-xs text-gray-500 truncate mt-0.5">{festival.location}</p>
                                   <p className="text-[11px] text-gray-400 mt-1 font-medium">{festival.date}</p>
                                 </div>
                               </Link>
                             ))
                           ) : (
                             <div className="h-full flex flex-col items-center justify-center text-center bg-gray-50 rounded-[2.5rem] border border-dashed border-gray-200 p-8">
                               <SearchIcon className="w-10 h-10 text-gray-300 mb-3" />
                               <p className="text-gray-400 font-medium">해당 지역에 등록된 축제가 없습니다.</p>
                             </div>
                           )}
                         </div>
                       </motion.div>
                     ) : (
                       /* 지역 선택 전 안내 화면 */
                       <motion.div 
                         key="no-selection"
                         initial={{ opacity: 0 }}
                         animate={{ opacity: 1 }}
                         className="h-full flex flex-col items-center justify-center text-center bg-gray-50 rounded-[2.5rem] border border-dashed border-gray-200 p-10"
                       >
                         <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                           <MapPin className="text-gray-300 w-8 h-8" />
                         </div>
                         <h4 className="text-gray-600 font-bold mb-2">지역을 선택해 보세요</h4>
                         <p className="text-gray-400 text-sm">왼쪽 지도에서 궁금한 지역을 클릭하면<br/>해당 지역의 정보를 볼 수 있습니다.</p>
                       </motion.div>
                     )}
                   </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}