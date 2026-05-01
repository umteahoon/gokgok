import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { mockFestivals } from "@/lib/index";

// ✅ 수정 포인트: @/ 경로 대신 상대 경로(../)를 사용하여 확실하게 이미지를 불러옵니다.
// 만약 Home.tsx 파일이 src 폴더 바로 안에 있다면 "./assets/busan.jpg" 로 변경해주세요!
import busanBg from "../assets/busan.jpg";

// Festival 인터페이스 정의
interface Festival {
  id: string | number;
  title: string;
  image: string;
  date: string;
  location: string;
  status: "ongoing" | "upcoming" | "ended" | string;
  category?: string;
}

const regions = ["전체", "서울", "경기/인천", "강원", "충청", "전라", "경상", "제주"];

export default function Home() {
  const [activeRegion, setActiveRegion] = useState("전체");
  
  // 찜하기 상태 관리
  const [wishlistedIds, setWishlistedIds] = useState<(string | number)[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "ongoing": return "진행중";
      case "upcoming": return "예정";
      case "ended": return "종료";
      default: return status;
    }
  };

  // 찜하기 토글 (클릭 시 상세페이지 이동 방지)
  const toggleWishlist = (e: React.MouseEvent, id: string | number) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlistedIds(prev => 
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  // 가로 스크롤 로직
  const handleScroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const moveAmount = clientWidth * 0.8;
      const scrollTo = direction === "left" ? scrollLeft - moveAmount : scrollLeft + moveAmount;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  const heartBtnStyle = { WebkitTapHighlightColor: 'transparent', outline: 'none' };
  const recommendedFestivals = mockFestivals.slice(0, 6) as Festival[];

  return (
    <div className="relative w-full min-h-screen bg-white text-[#111111] font-sans pb-20 overflow-x-hidden">
      
      {/* ========================================== */}
      {/* 1. Hero Section (busan.jpg 배경 적용) */}
      {/* ========================================== */}
      <section className="relative w-full h-[60vh] md:h-[70vh] flex items-center justify-center overflow-hidden">
        {/* 배경 이미지 */}
        <div className="absolute inset-0 z-0">
          <img
            src={busanBg} // ✅ 여기서 위에서 불러온 busanBg 변수를 사용합니다.
            alt="메인 배경"
            className="w-full h-full object-cover brightness-[0.85]"
          />
        </div>
        
        {/* 그라데이션 오버레이 (텍스트가 잘 보이도록 어둡게 처리) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>

        {/* 메인 텍스트 */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center text-white flex flex-col items-center px-4 pt-10"
        >
          <h2 className="text-[42px] sm:text-[52px] md:text-[64px] font-extrabold leading-[1.15] tracking-tight drop-shadow-xl">
            <span className="block opacity-95">대한민국의</span>
            <span className="block mt-1">따뜻한 매력을</span>
            <span className="block mt-1">구석구석 느껴보세요.</span>
          </h2>
        </motion.div>
      </section>
      
      {/* ========================================== */}
      {/* 2. 콘텐츠 영역 (Search.tsx 스타일 적용) */}
      {/* ========================================== */}
      <main className="w-full max-w-[1200px] mx-auto py-12 px-4 md:px-10 bg-white rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.05)] relative z-20 -mt-16 border-t border-gray-100">
        
        {/* 지역별 필터 */}
        <div className="mb-14 pb-6 border-b border-gray-100 flex justify-center">
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-2 px-2">
            {regions.map((region) => (
              <button
                key={region}
                onClick={() => setActiveRegion(region)}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all whitespace-nowrap border ${
                  activeRegion === region 
                  ? "bg-[#111111] text-white border-[#111111] shadow-md" 
                  : "bg-[#F5F5F5] text-[#666666] border-transparent hover:bg-gray-200"
                }`}
              >
                {region}
              </button>
            ))}
          </div>
        </div>

        {/* 이달의 추천 축제 */}
        <section className="mb-16 relative group">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h3 className="text-[24px] md:text-[28px] font-extrabold mb-1 tracking-tight">이달의 추천 축제 🌸</h3>
              <p className="text-sm md:text-base text-gray-500 font-medium">지금 가장 사랑받는 전국의 축제를 만나보세요.</p>
            </div>
            {/* 좌우 스크롤 화살표 */}
            <div className="hidden sm:flex gap-2">
              <button onClick={() => handleScroll("left")} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center bg-white shadow-sm hover:bg-gray-50 transition-all">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18L9 12L15 6"/></svg>
              </button>
              <button onClick={() => handleScroll("right")} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center bg-white shadow-sm hover:bg-gray-50 transition-all">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
              </button>
            </div>
          </div>

          {/* 가로 스크롤 컨테이너 */}
          <div ref={scrollRef} className="flex gap-4 md:gap-5 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-6 pt-2">
            {recommendedFestivals.map((festival) => (
              <Link to={`/festival/${festival.id}`} key={`rec-${festival.id}`} className="min-w-[75%] sm:min-w-[calc(33.333%-16px)] lg:min-w-[calc(25%-15px)] snap-start group/card cursor-pointer">
                
                {/* 썸네일 영역 */}
                <div className="relative mb-3 aspect-[4/5] rounded-2xl overflow-hidden shadow-sm bg-gray-50">
                  <img src={festival.image} alt={festival.title} className="w-full h-full object-cover transition-transform duration-500 group-hover/card:scale-110" />
                  
                  {/* 찜하기 버튼 */}
                  <div 
                    onClick={(e) => toggleWishlist(e, festival.id)}
                    className="absolute top-3 right-3 z-10 cursor-pointer select-none"
                    style={heartBtnStyle}
                  >
                    <motion.svg 
                      whileTap={{ scale: 0.7 }}
                      width="26" height="26" viewBox="0 0 24 24" 
                      fill={wishlistedIds.includes(festival.id) ? "#FF3478" : "rgba(255,255,255,0.4)"} 
                      stroke="white" strokeWidth="2.5"
                      className="drop-shadow-md transition-colors"
                    >
                      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.505 4.04 3 5.5l7 7Z" />
                    </motion.svg>
                  </div>

                  {/* 상태 뱃지 */}
                  <div className="absolute top-3 left-3">
                    <span className={`px-2.5 py-1 rounded text-[11px] font-bold text-white ${festival.status === 'upcoming' ? 'bg-blue-500/90' : festival.status === 'ended' ? 'bg-gray-500/90' : 'bg-[#FF3478]/90'} backdrop-blur-sm shadow-md`}>
                      {getStatusLabel(festival.status)}
                    </span>
                  </div>
                </div>
                
                {/* 텍스트 영역 */}
                <div className="px-1">
                  <span className="text-[11px] text-[#FF3478] font-bold mb-1 block uppercase tracking-tight">
                    {festival.category || "테마여행"}
                  </span>
                  <h3 className="font-bold text-[16px] line-clamp-2 leading-snug mb-1.5 h-[44px] group-hover/card:text-[#FF3478] transition-colors">
                    {festival.title}
                  </h3>
                  <p className="text-[13px] text-[#555555] font-semibold mb-0.5">{festival.location}</p>
                  <p className="text-[13px] text-gray-400">{festival.date}</p>
                </div>
                
              </Link>
            ))}
          </div>
        </section>
        
      </main>
    </div>
  );
}