import { useState, useRef, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios"; 
import { KoreaMap } from "@/components/KoreaMap";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  MapPin,
  Search as SearchIcon,
  X,
  Image as ImageIcon,
  Building
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getCurrentUser } from "@/lib/login";

interface Festival {
  id: string | number;
  title: string;
  image: string;
  date: string;
  location: string;
  status: string;
  category?: string;
  description?: string;
}

// 🚀 관광지 공공데이터 규격 인터페이스 정의
interface TouristSpot {
  id?: number;
  name?: string;      // CSV 규격
  title?: string;     // 관광공사 API 규격
  type?: string;
  address_road?: string;  // CSV 규격
  addr1?: string;         // 관광공사 API 규격
  phone?: string;         // CSV 규격
  tel?: string;           // 관광공사 API 규격
  management_agency?: string;
  firstimage?: string;    // 관광공사 대표 이미지
  firstimage2?: string;   // 관광공사 썸네일
  description?: string;
}

const REGION_NAME_MAP: Record<string, string> = {
  Seoul: "서울", Gyeonggi: "경기", Incheon: "인천", Gangwon: "강원",
  Chungnam: "충남", Chungbuk: "충북", Daejeon: "대전", Sejong: "세종",
  Jeonbuk: "전북", Jeonnam: "전남", Gwangju: "광주", Gyeongbuk: "경북",
  Gyeongnam: "경남", Daegu: "대구", Busan: "부산", Ulsan: "울산", Jeju: "제주",
};

export default function Search() {
  const currentUser = getCurrentUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // 🎯 실서버 축제 및 관광지 데이터 상태 주머니
  const [dbFestivals, setDbFestivals] = useState<Festival[]>([]);
  const [touristSpots, setTouristSpots] = useState<TouristSpot[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [spotsLoading, setSpotsLoading] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<"list" | "map">("list");
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedTaste, setSelectedTaste] = useState("NEW");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [wishlistedIds, setWishlistedIds] = useState<string[]>([]);
  const [isLoginNoticeOpen, setIsLoginNoticeOpen] = useState(false);

  // 🎯 시연장 킥: 관광지 데이터 타입 모드 ('csv' 모드 / 'api' 모드 토글)
  const [spotMode, setSpotMode] = useState<'csv' | 'api'>('csv');

  // 검색 관련 상태
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const bestScrollRef = useRef<HTMLDivElement>(null);
  const risingScrollRef = useRef<HTMLDivElement>(null);
  const tasteScrollRef = useRef<HTMLDivElement>(null);
  const spotScrollRef = useRef<HTMLDivElement>(null); // 관광지 전용 스크롤 ref

  // 🚀 1. 축제 데이터 초기 수신 파이프라인
  useEffect(() => {
    const loadServerFestivals = async () => {
      try {
        setLoading(true);
        const response = await axios.get("https://gokgok-8ztf.onrender.com/api/festivals");
        if (response.data && response.data.success) {
          setDbFestivals(response.data.data);
        }
      } catch (err) {
        console.error("❌ 축제 마스터 API 수신 실패:", err);
      } finally {
        setLoading(false);
      }
    };
    loadServerFestivals();
  }, []);

  // 🚀 2. [흡수 통합 핵심] 모드 변경에 따른 공공 관광 데이터 수신 파이프라인
  useEffect(() => {
    const loadTouristData = async () => {
      try {
        setSpotsLoading(true);
        const endpoint = spotMode === 'csv' 
          ? "https://gokgok-8ztf.onrender.com/api/festivals/tourist-spots"
          : "https://gokgok-8ztf.onrender.com/api/festivals/tour-api";

        const response = await axios.get(endpoint);
        
        if (spotMode === 'csv') {
          setTouristSpots(response.data.slice(0, 15)); // CSV 데이터는 상위 15개만 쇼케이스 렌더링
        } else {
          setTouristSpots(response.data.success ? response.data.data : []);
        }
      } catch (err) {
        console.error("❌ 관광지 데이터 수신 실패:", err);
      } {
        setSpotsLoading(false);
      }
    };
    loadTouristData();
  }, [spotMode]);

  const heroItems = useMemo(() => {
    if (dbFestivals.length > 0) {
      return dbFestivals.filter(f => f.status === "ongoing" || f.category === "전통문화").slice(0, 5);
    }
    return [];
  }, [dbFestivals]);

  useEffect(() => {
    if (heroItems.length > 0) {
      heroItems.forEach((item) => {
        const img = new Image();
        img.src = item.image;
      });
    }
  }, [heroItems]);

  useEffect(() => {
    const savedWishlist = JSON.parse(localStorage.getItem("gokgok_wishlist") || "[]");
    setWishlistedIds(savedWishlist.map((id: string | number) => String(id)));
  }, []);

  const tastes = ["NEW", "자연생태", "체험", "전통문화", "겨울축제", "불꽃축제", "역사문화", "음식축제"];
  
  const themes = useMemo(() => {
    return [
      { title: "자연과 함께하는 여행", items: dbFestivals.filter(f => f.category === "자연생태").slice(0, 5) },
      { title: "화려한 축제, 체험을 하고 싶다면", items: dbFestivals.filter(f => f.category === "체험").slice(0, 5) },
      { title: "역사와 전통이 함께", items: dbFestivals.filter(f => f.category === "전통문화").slice(0, 5) },
    ];
  }, [dbFestivals]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return dbFestivals.filter(
      (f) =>
        f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, dbFestivals]);

  const regionFestivals = useMemo(() => {
    if (!selectedRegion) return [];
    const target = REGION_NAME_MAP[selectedRegion] || selectedRegion;
    return dbFestivals.filter((f) => f.location.includes(target));
  }, [selectedRegion, dbFestivals]);

  const filteredList = useMemo(() => {
    return dbFestivals.filter((f) =>
      selectedTaste === "NEW" ? true : f.category === selectedTaste
    );
  }, [selectedTaste, dbFestivals]);

  const nextSlide = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (heroItems.length > 0) setCurrentSlide((p) => (p + 1) % heroItems.length);
  };
  const prevSlide = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (heroItems.length > 0) setCurrentSlide((p) => (p - 1 + heroItems.length) % heroItems.length);
  };
  
  const getStatusLabel = (s: string) => {
    switch (s) {
      case "ongoing": return "진행중";
      case "upcoming": return "예정";
      case "ended": return "종료";
      default: return s;
    }
  };

  const toggleWishlist = (e: React.MouseEvent, id: string | number) => {
    e.preventDefault(); e.stopPropagation();
    if (!currentUser) {
      setIsLoginNoticeOpen(true);
      return;
    }
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
      ref.current.scrollTo({
        left: dir === "left" ? scrollLeft - move : scrollLeft + move,
        behavior: "smooth",
      });
    }
  };

  const handleRegionSelect = (id: any) => {
    setSelectedRegion(id === selectedRegion ? "" : id);
  };

  return (
    <div className="w-full bg-white dark:bg-[#111111] text-[#111111] dark:text-white pb-20 font-sans overflow-x-hidden pt-10 rounded-t-3xl transition-colors relative">
      <main className="container mx-auto">
        
        {loading ? (
          <div className="w-full h-[300px] flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF3478]"></div>
            <p className="text-gray-400 text-sm mt-4 font-medium">곡곡 실시간 통합 데이터 수신 중...</p>
          </div>
        ) : (
          <>
            {/* 히어로 슬라이더 */}
            {heroItems.length > 0 && (
              <section className="relative w-[calc(100%-2rem)] mx-auto h-[220px] md:h-[320px] mb-16 bg-black overflow-hidden rounded-[2.5rem] md:rounded-[3.5rem] shadow-xl">
                <AnimatePresence mode="popLayout">
                  <motion.div key={currentSlide} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="absolute inset-0">
                    <Link to={`/festival/${heroItems[currentSlide].id}`} className="relative flex items-center justify-between px-10 md:px-24 lg:px-40 h-full w-full">
                      <div className="absolute inset-0">
                        <img src={heroItems[currentSlide].image} className="w-full h-full object-cover opacity-30 blur-md" alt="" />
                        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/30 to-transparent" />
                      </div>
                      <div className="relative z-10 text-white max-w-sm">
                        <motion.h1 initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-xl md:text-3xl font-black mb-2 leading-tight drop-shadow-lg">{heroItems[currentSlide].title}</motion.h1>
                        <div className="text-gray-400 space-y-0.5 text-xs md:text-sm font-medium">
                          <p>📍 {heroItems[currentSlide].location}</p>
                          <p>📅 {heroItems[currentSlide].date}</p>
                        </div>
                      </div>
                      <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="relative z-10 hidden md:block w-[180px] lg:w-[220px] aspect-[3/4] rounded-xl overflow-hidden shadow-2xl border border-white/10">
                        <img src={heroItems[currentSlide].image} className="w-full h-full object-cover" alt="" />
                      </motion.div>
                    </Link>
                  </motion.div>
                </AnimatePresence>
                <button onClick={prevSlide} className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all active:scale-90 shadow-md"><ChevronLeft size={24} /></button>
                <button onClick={nextSlide} className="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all active:scale-90 shadow-md"><ChevronRight size={24} /></button>
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center bg-black/40 backdrop-blur-lg px-4 py-1.5 rounded-full border border-white/5">
                  <div className="text-white text-[10px] font-bold tracking-widest">{String(currentSlide + 1).padStart(2, "0")} / {String(heroItems.length).padStart(2, "0")}</div>
                </div>
              </section>
            )}

            <div className="w-[calc(100%-2rem)] mx-auto">
              {/* 탭 헤더 */}
              <div className="flex items-center justify-between mb-10 border-b border-gray-100 dark:border-gray-800 relative">
                <div className="flex gap-6">
                  <button onClick={() => setActiveTab("list")} className={`pb-3 text-lg font-bold transition-colors relative ${activeTab === "list" ? "text-[#FF3478]" : "text-gray-400"}`}>목록보기 {activeTab === "list" && <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#FF3478]" />}</button>
                  <button onClick={() => setActiveTab("map")} className={`pb-3 text-lg font-bold transition-colors relative ${activeTab === "map" ? "text-[#FF3478]" : "text-gray-400"}`}>지도보기 {activeTab === "map" && <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#FF3478]" />}</button>
                </div>
                <button onClick={() => { setIsSearchOpen(!isSearchOpen); if (isSearchOpen) setSearchQuery(""); }} className={`pb-3 px-2 transition-colors ${isSearchOpen ? "text-[#FF3478]" : "text-gray-400"}`}>{isSearchOpen ? <X size={26} strokeWidth={2.5} /> : <SearchIcon size={26} strokeWidth={2.5} />}</button>
              </div>

              {/* 실시간 검색창 */}
              <AnimatePresence>
                {isSearchOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-12">
                    <div className="relative w-full">
                      <input autoFocus type="text" placeholder="축제 이름이나 키워드를 입력하세요" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full px-8 py-5 bg-[#F8F9FA] dark:bg-[#1a1a1a] rounded-[2rem] border-2 border-transparent focus:border-[#FF3478]/30 outline-none font-bold text-lg shadow-inner" />
                      <SearchIcon className="absolute right-8 top-1/2 -translate-y-1/2 text-[#FF3478]" size={24} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence mode="wait">
                {activeTab === "list" ? (
                  <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    
                    {/* 실시간 검색결과 섹션 */}
                    {searchQuery && (
                      <section className="mb-16">
                        <h2 className="text-xl font-black mb-8 px-2">검색 결과 <span className="text-[#FF3478]">{searchResults.length}</span></h2>
                        {searchResults.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {searchResults.map((f) => (
                              <Link key={f.id} to={`/festival/${f.id}`} className="group flex gap-4 bg-white dark:bg-[#222] p-3 rounded-[1.5rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all">
                                <div className="w-20 h-20 md:w-24 md:h-24 shrink-0 rounded-xl overflow-hidden bg-gray-50"><img src={f.image} className="w-full h-full object-cover" alt="" /></div>
                                <div className="flex flex-col justify-center overflow-hidden">
                                  <span className="text-[10px] text-[#FF3478] font-black mb-1 uppercase tracking-tighter">{f.category}</span>
                                  <h4 className="font-bold text-[16px] text-gray-900 dark:text-white truncate group-hover:text-[#FF3478]">{f.title}</h4>
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

                    {/* TOP! 베스트 축제 섹션 */}
                    <section className="mb-16 relative group">
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-[22px] font-extrabold italic underline decoration-[#FF3478]/20 underline-offset-8 text-gray-900 dark:text-white">TOP! 베스트 축제</h2>
                        <div className="flex gap-2">
                          <button onClick={() => handleScroll(bestScrollRef, "left")} className="w-9 h-9 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center bg-white dark:bg-[#222] shadow-sm hover:bg-gray-50 dark:hover:bg-[#333] transition-all"><ChevronLeft size={18} /></button>
                          <button onClick={() => handleScroll(bestScrollRef, "right")} className="w-9 h-9 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center bg-white dark:bg-[#222] shadow-sm hover:bg-gray-50 dark:hover:bg-[#333] transition-all"><ChevronRight size={18} /></button>
                        </div>
                      </div>
                      <div ref={bestScrollRef} className="flex gap-4 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory pb-4">
                        {dbFestivals.slice(0, 8).map((festival, idx) => (
                          <Link to={`/festival/${festival.id}`} key={`best-${festival.id}`} className="min-w-[calc(50%-10px)] md:min-w-[calc(25%-12px)] lg:min-w-[calc(20%-12px)] snap-start group/card cursor-pointer">
                            <div className="relative mb-3 aspect-[4/5] rounded-xl overflow-hidden shadow-sm bg-gray-50 dark:bg-[#222222]">
                              <img src={festival.image} alt={festival.title} className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-110" />
                              <div onClick={(e) => toggleWishlist(e, festival.id)} className="absolute top-2 right-2 z-10 p-1" style={{ outline: "none" }}><motion.div whileTap={{ scale: 0.7 }}><Heart className={`w-6 h-6 drop-shadow-md transition-colors ${wishlistedIds.includes(String(festival.id)) ? "fill-[#FF3478] text-[#FF3478]" : "text-white/70 hover:text-white"}`} /></motion.div></div>
                              <div className="absolute top-2 left-2"><span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${festival.status === "ended" ? "bg-gray-500/80" : "bg-[#FF3478]/90"} backdrop-blur-sm shadow-md`}>{getStatusLabel(festival.status || "")}</span></div>
                              <div className="absolute bottom-0 left-0 leading-none pointer-events-none text-white font-black italic text-5xl opacity-90 px-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">{idx + 1}</div>
                            </div>
                            <div className="px-1">
                              <span className="text-[11px] text-[#FF3478] font-bold mb-1 block uppercase tracking-tight">{festival.category}</span>
                              <h3 className="font-bold text-[14.5px] line-clamp-2 h-[40px] text-gray-900 dark:text-white group-hover/card:text-[#FF3478]">{festival.title}</h3>
                              <p className="text-[12px] text-[#555555] dark:text-gray-400 font-semibold mb-0.5">{festival.location}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </section>

                    {/* 🔥 [흡수 통합 대형 킥] 주변 관광 명소 공공데이터 결합 섹션 배치 */}
                    <section className="mb-16 bg-[#F9FAFB] dark:bg-[#161616] p-6 rounded-[2.5rem] border border-gray-100 dark:border-gray-900 relative">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                        <div>
                          <h2 className="text-[22px] font-black text-gray-900 dark:text-white flex items-center gap-2">
                            ✨ 대한민국 구석구석 추천 로컬 명소
                          </h2>
                          <p className="text-xs text-gray-400 mt-0.5 font-medium">공공데이터 마스터 데이터셋과 관광공사 실시간 연동</p>
                        </div>
                        
                        {/* 🎛️ 실시간 데이터 결합 모드 전환용 인라인 토글 탭 */}
                        <div className="flex bg-gray-200/70 dark:bg-[#222] p-1 rounded-full self-start">
                          <button 
                            onClick={() => setSpotMode('csv')} 
                            className={`px-3 py-1.5 rounded-full text-xs font-black transition-all ${spotMode === 'csv' ? 'bg-[#111] text-white shadow-sm' : 'text-gray-500'}`}
                          >
                            전국 마스터 (854개)
                          </button>
                          <button 
                            onClick={() => setSpotMode('api')} 
                            className={`px-3 py-1.5 rounded-full text-xs font-black transition-all ${spotMode === 'api' ? 'bg-[#FF3478] text-white shadow-sm' : 'text-gray-500'}`}
                          >
                            실시간 관광공사 (사진제공)
                          </button>
                        </div>
                      </div>

                      {spotsLoading ? (
                        <div className="h-[200px] flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF3478]"></div>
                        </div>
                      ) : (
                        <div ref={spotScrollRef} className="flex gap-4 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory pb-2">
                          {touristSpots.map((spot, idx) => {
                            const title = spot.name || spot.title || '테마 파크';
                            const address = spot.address_road || spot.addr1 || '대한민국 구석구석';
                            const phone = spot.phone || spot.tel || '정보 제공 (곡곡)';
                            // 엑박 원천 방지용 Unsplash 기본 Landscape 썸네일 가드
                            const img = spot.firstimage || spot.firstimage2 || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=500&q=80';

                            return (
                              <div key={idx} className="min-w-[260px] md:min-w-[300px] bg-white dark:bg-[#222] rounded-2xl overflow-hidden shadow-sm border border-gray-50 dark:border-gray-800 p-3 snap-start flex flex-col justify-between">
                                <div className="h-36 w-full rounded-xl overflow-hidden bg-gray-100 relative mb-3">
                                  <img src={img} alt={title} className="w-full h-full object-cover transition-transform duration-300 hover:scale-105" onError={(e)=>{e.currentTarget.src='https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=500&q=80'}} />
                                  {spot.type && <span className="absolute top-2 left-2 bg-black/60 text-white text-[9px] px-2 py-0.5 rounded-full font-bold">{spot.type}</span>}
                                </div>
                                <div className="flex-1 flex flex-col justify-between">
                                  <div>
                                    <h4 className="font-extrabold text-[15.5px] text-gray-900 dark:text-white line-clamp-1 mb-1">{title}</h4>
                                    {spot.description && <p className="text-[12px] text-gray-400 line-clamp-2 leading-tight mb-2">{spot.description}</p>}
                                  </div>
                                  <div className="space-y-0.5 text-[11px] text-gray-500 dark:text-gray-400 border-t pt-2 mt-2">
                                    <div className="flex items-center gap-1"><MapPin size={12} className="text-gray-400 shrink-0" /><span className="truncate">{address}</span></div>
                                    {spot.management_agency && <div className="flex items-center gap-1"><Building size={12} className="text-gray-400 shrink-0" /><span className="truncate">{spot.management_agency}</span></div>}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </section>

                    {/* 지금 인기 급상승 섹션 */}
                    <section className="mb-16 relative group">
                      <div className="flex justify-between items-center mb-6"><h2 className="text-[22px] font-extrabold text-gray-900 dark:text-white">지금 인기 급상승 🔥</h2>
                        <div className="flex gap-2">
                          <button onClick={() => handleScroll(risingScrollRef, "left")} className="w-9 h-9 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center bg-white dark:bg-[#222] shadow-sm hover:bg-gray-50 dark:hover:bg-[#333] transition-all"><ChevronLeft size={18} /></button>
                          <button onClick={() => handleScroll(risingScrollRef, "right")} className="w-9 h-9 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center bg-white dark:bg-[#222] shadow-sm hover:bg-gray-50 dark:hover:bg-[#333] transition-all"><ChevronRight size={18} /></button>
                        </div>
                      </div>
                      <div ref={risingScrollRef} className="flex gap-4 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory pb-4">
                        {[...dbFestivals].reverse().slice(0, 10).map((festival) => (
                          <Link to={`/festival/${festival.id}`} key={`rising-${festival.id}`} className="min-w-[calc(50%-10px)] md:min-w-[calc(25%-12px)] lg:min-w-[calc(20%-12px)] snap-start group/card cursor-pointer">
                            <div className="relative mb-3 aspect-[4/5] rounded-xl overflow-hidden shadow-sm bg-gray-50 dark:bg-[#222222]">
                              <img src={festival.image} alt={festival.title} className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-110" />
                              <div onClick={(e) => toggleWishlist(e, festival.id)} className="absolute top-2 right-2 z-10 p-1"><motion.div whileTap={{ scale: 0.7 }}><Heart className={`w-6 h-6 drop-shadow-md transition-colors ${wishlistedIds.includes(String(festival.id)) ? "fill-[#FF3478] text-[#FF3478]" : "text-white/70 hover:text-white"}`} /></motion.div></div>
                            </div>
                            <div className="px-1"><h3 className="font-bold text-[14.5px] line-clamp-2 h-[40px] text-gray-900 dark:text-white group-hover/card:text-[#FF3478] transition-colors">{festival.title}</h3></div>
                          </Link>
                        ))}
                      </div>
                    </section>

                    {/* 취향 선택 섹션 */}
                    <section className="mb-20 relative group">
                      <div className="flex justify-between items-center mb-6"><h2 className="text-[22px] font-bold text-gray-900 dark:text-white">취향에 따라 고르는 여행</h2>
                        <div className="flex gap-2">
                          <button onClick={() => handleScroll(tasteScrollRef, "left")} className="w-9 h-9 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center bg-white dark:bg-[#222] shadow-sm hover:bg-gray-50 dark:hover:bg-[#333] transition-all"><ChevronLeft size={18} /></button>
                          <button onClick={() => handleScroll(tasteScrollRef, "right")} className="w-9 h-9 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center bg-white dark:bg-[#222] shadow-sm hover:bg-gray-50 dark:hover:bg-[#333] transition-all"><ChevronRight size={18} /></button>
                        </div>
                      </div>
                      <div className="flex gap-2 mb-8 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        {tastes.map((taste) => (<button key={taste} onClick={() => setSelectedTaste(taste)} className={`px-4 py-2 rounded-full text-sm font-bold border transition-all shrink-0 ${selectedTaste === taste ? "bg-[#111111] dark:bg-white text-white dark:text-[#111111] border-[#111111] dark:border-white" : "bg-[#F5F5F5] dark:bg-[#222222] text-[#666666] border-transparent"}`}>{taste}</button>))}
                      </div>
                      <div ref={tasteScrollRef} className="flex gap-5 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory pb-4">
                        {filteredList.map((festival) => (
                          <Link to={`/festival/${festival.id}`} key={`holic-${festival.id}`} className="w-[280px] md:w-[340px] flex-shrink-0 snap-start group/card cursor-pointer">
                            <div className="relative mb-4 aspect-[1.4/1] rounded-2xl overflow-hidden shadow-md bg-gray-100 dark:bg-[#222222]"><img src={festival.image} alt={festival.title} className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-105" /></div>
                            <h3 className="font-bold text-[17px] line-clamp-1 text-gray-900 dark:text-white group-hover/card:text-[#FF3478] transition-colors">{festival.title}</h3>
                            <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-1">{festival.location}</p>
                          </Link>
                        ))}
                      </div>
                    </section>

                    {/* 테마 추천 아코디언 */}
                    <section className="mb-20 space-y-4">
                      <h2 className="text-[22px] font-extrabold mb-6 text-gray-900 dark:text-white">테마 추천</h2>
                      {themes.map((theme, idx) => {
                        const isExpanded = expandedIndex === idx;
                        return (
                          <div key={idx} className={`border rounded-2xl overflow-hidden transition-all duration-300 ${isExpanded ? "border-blue-500 ring-1 ring-blue-500 shadow-md" : "border-gray-200 dark:border-gray-800 shadow-sm"}`}>
                            <button onClick={() => setExpandedIndex(isExpanded ? null : idx)} className="w-full px-6 py-5 flex justify-between items-center bg-white dark:bg-[#1a1a1a] transition-colors">
                              <span className={`text-lg font-bold ${isExpanded ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"}`}>{theme.title}</span>
                              <ChevronLeft className={`w-6 h-6 transition-transform duration-300 ${isExpanded ? "-rotate-90 text-blue-500" : "rotate-0 text-gray-400"}`} />
                            </button>
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="bg-white dark:bg-[#1a1a1a]">
                                  <div className="px-6 pb-8">
                                    <div className="flex gap-4 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-2 snap-x">
                                      {theme.items.map((item) => (
                                        <Link to={`/festival/${item.id}`} key={item.id} className="min-w-[160px] md:min-w-[220px] snap-start group/item relative">
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
                  /* 지도보기 탭 (정밀 연동 버전 유지) */
                  <motion.div key="map-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-[650px]">
                    <div className="lg:col-span-7 bg-[#F8F9FA] dark:bg-[#1a1a1a] rounded-[3rem] flex items-center justify-center border border-gray-100 dark:border-[#333] overflow-hidden relative shadow-inner p-4">
                      {/* 🗺️ 부모 상태인 dbFestivals 주머니를 지도로 전달하여 실시간 카운팅 동기화 */}
                      <KoreaMap selectedRegion={selectedRegion} onRegionSelect={handleRegionSelect} festivalData={dbFestivals} />
                    </div>
                    <div className="lg:col-span-5 flex flex-col">
                      {selectedRegion ? (
                        <div className="flex flex-col h-full px-2">
                          <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-6">{REGION_NAME_MAP[selectedRegion]} 축제</h3>
                          <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] space-y-4 pr-2">
                            {regionFestivals.length > 0 ? (
                              regionFestivals.map((festival) => (
                                <Link to={`/festival/${festival.id}`} key={`map-item-${festival.id}`} className="group flex gap-4 bg-white dark:bg-[#222] p-3 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all active:scale-[0.98]">
                                  <div className="w-24 h-24 shrink-0 rounded-2xl overflow-hidden shadow-sm"><img src={festival.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform" /></div>
                                  <div className="flex flex-col justify-center overflow-hidden">
                                    <span className="text-[10px] text-[#FF3478] font-bold mb-0.5">{festival.category}</span>
                                    <h4 className="font-bold text-[16px] text-gray-900 dark:text-white truncate group-hover:text-[#FF3478] transition-colors">{festival.title}</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{festival.location}</p>
                                  </div>
                                </Link>
                              ))
                            ) : (
                              <div className="text-center py-12 text-gray-400 font-medium">해당 지역에 등록된 실시간 축제가 없습니다.</div>
                            )}
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
          </>
        )}
      </main>

      {/* 로그인 유도 커스텀 모달 */}
      <AnimatePresence>
        {isLoginNoticeOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[500] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setIsLoginNoticeOpen(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-[#1a1a1a] w-full max-w-[320px] rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 p-6 text-center">
              <div className="w-12 h-12 bg-pink-50 dark:bg-pink-950/30 rounded-full flex items-center justify-center mx-auto mb-4"><Heart className="text-[#FF3478] w-6 h-6" fill="currentColor" /></div>
              <h3 className="text-[18px] font-black text-gray-900 dark:text-white mb-2">로그인이 필요합니다</h3>
              <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed mb-6">축제 관심목록 찜 기능은<br />로그인 후 이용하실 수 있습니다.</p>
              <div className="flex flex-col gap-2">
                <button onClick={() => { setIsLoginNoticeOpen(false); navigate("/notmypage"); }} className="w-full py-3.5 bg-[#111111] dark:bg-white text-white dark:text-black font-bold rounded-full text-sm shadow-sm hover:opacity-90 transition-all">로그인하러 가기</button>
                <button onClick={() => setIsLoginNoticeOpen(false)} className="w-full py-2 text-gray-400 dark:text-gray-500 font-medium rounded-full text-xs hover:text-gray-600 transition-colors">취소</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}