import { useState } from "react";
import { motion } from "framer-motion";
import { IMAGES } from "@/assets/images";

// 대한민국 구석구석 스타일: 날짜와 지역 정보가 중요함
const festivalList = [
  { id: 1, title: "진해 군항제", region: "경남 창원시", date: "2026.03.22 ~ 04.01", tag: "#벚꽃명소", img: IMAGES.CULTURAL_EVENT_1 },
  { id: 2, title: "진주 남강 유등축제", region: "경남 진주시", date: "2026.10.05 ~ 10.20", tag: "#야경맛집", img: IMAGES.FESTIVAL_EVENT_5 },
  { id: 3, title: "무주 반딧불축제", region: "전북 무주군", date: "2026.08.31 ~ 09.08", tag: "#생태체험", img: IMAGES.FESTIVAL_MAIN_7 },
  { id: 4, title: "여수 밤바다 불꽃축제", region: "전남 여수시", date: "2026.10.26 ~ 10.26", tag: "#불꽃놀이", img: IMAGES.CULTURAL_EVENT_6 },
];

const topKeywords = ["#벚꽃", "#봄꽃여행", "#야경", "#가족여행", "#먹거리", "#전통체험"];
const regions = ["전체", "서울", "경기/인천", "강원", "충청", "전라", "경상", "제주"];

export default function Home() {
  // 지역 탭 상태 관리 추가
  const [activeRegion, setActiveRegion] = useState("전체");

  return (
    // 배경을 약간의 회색톤(gray-50)으로 주어 흰색 카드가 더 돋보이게 처리
    <div className="relative w-full min-h-screen bg-gray-50 text-gray-900 font-sans">
      
      {/* ========================================== */}
      {/* 1. HERO SECTION (메인 배너 및 감성 타이틀) */}
      {/* ========================================== */}
      <section className="relative w-full h-[55vh] md:h-[65vh] flex flex-col justify-center items-center overflow-hidden">
        {/* 배경 이미지 & 그라데이션 오버레이 */}
        <div className="absolute inset-0 z-0">
          <img
            src="/public/45f1c8951ca8a760d4a413a01a54dc50.jpg"
            alt="메인 배경"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/60"></div>
        </div>

        {/* 감성 타이틀 영역 */}
        <div className="relative z-10 flex flex-col items-center w-full max-w-4xl px-4 mt-8">
          {/* Framer Motion의 staggerChildren을 사용하기 위한 컨테이너 */}
          <motion.div
            initial="initial"
            animate="animate"
            variants={{
              initial: { opacity: 0 },
              animate: { opacity: 1, transition: { staggerChildren: 0.3 } },
            }}
            className="flex items-center gap-1 mb-6"
          >
            {/* "곡" 두 글자를 분리하여 순서대로 나타나게 함 */}
            {["곡", "곡"].map((char, index) => (
              <motion.h1
                key={index}
                variants={{
                  initial: { opacity: 0, y: 30, scale: 1.1 },
                  animate: { opacity: 1, y: 0, scale: 1 },
                }}
                transition={{ duration: 0.8, ease: [0.6, 0.05, -0.01, 0.9] }}
                // CSS에서 정의한 .font-nanum-brush 클래스 적용
                className="font-nanum-brush text-[80px] md:text-[100px] lg:text-[120px] font-normal text-white drop-shadow-lg leading-none"
              >
                {char}
              </motion.h1>
            ))}
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }} // 타이틀 애니메이션이 끝난 후 나타나도록 지연
            className="text-lg md:text-xl text-white/90 mb-10 text-center drop-shadow-md font-medium"
          >
            방구석 구석, 전국의 즐거운 축제를 만나보세요
          </motion.p>

          {/* 기존 검색창은 제거 */}

          {/* 추천 해시태그 (디자인 정제, 마진 조정) */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }} // p 태그 애니메이션 후 나타나도록 지연
            className="flex flex-wrap justify-center gap-2.5 mt-2" // 마진 줄임
          >
            {topKeywords.map((keyword, idx) => (
              <button key={idx} className="text-sm font-medium text-white bg-white/10 hover:bg-white/25 backdrop-blur-md px-4 py-2 rounded-full transition-all border border-white/30 hover:border-white/60">
                {keyword}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ========================================== */}
      {/* 2. 지역별 필터 (현대적인 Pill 스타일 디자인) */}
      {/* ========================================== */}
      <div className="w-full bg-white sticky top-0 z-20 shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 overflow-x-auto no-scrollbar">
          <div className="flex gap-2 py-4 min-w-max items-center">
            {regions.map((region) => (
              <button 
                key={region} 
                onClick={() => setActiveRegion(region)}
                className={`text-sm md:text-base font-bold px-5 py-2.5 rounded-full transition-all duration-200 ${
                  activeRegion === region 
                  ? "bg-[#E3051B] text-white shadow-md" 
                  : "bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-900 border border-transparent"
                }`}
              >
                {region}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* 3. 메인 콘텐츠 영역 (카드 UI 고도화) */}
      {/* ========================================== */}
      <section className="w-full max-w-7xl mx-auto py-16 px-4 md:px-8">
        
        {/* 섹션 타이틀 */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">이달의 추천 축제</h2>
            <p className="text-gray-500 font-medium">지금 가장 사랑받는 전국의 축제들을 만나보세요.</p>
          </div>
          <button className="text-sm font-bold text-gray-400 hover:text-gray-800 transition-colors flex items-center gap-1">
            전체보기 <span className="text-lg leading-none">›</span>
          </button>
        </div>

        {/* 축제 카드 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {festivalList.map((festival, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              key={festival.id} 
              className="group cursor-pointer flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-1"
            >
              {/* 썸네일 영역 */}
              <div className="relative w-full aspect-[4/3] overflow-hidden bg-gray-200">
                <img 
                  src={festival.img} 
                  alt={festival.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out" 
                />
                {/* 뱃지 */}
                <div className="absolute top-3 left-3 z-10">
                  <span className="bg-black/60 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-md shadow-sm border border-white/10">
                    진행중
                  </span>
                </div>
                {/* 하단 그라데이션 (이미지-텍스트 경계 부드럽게) */}
                <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent"></div>
              </div>

              {/* 텍스트 영역 (패딩 추가로 깔끔하게 정리) */}
              <div className="flex flex-col p-5">
                <span className="text-[#E3051B] text-xs font-extrabold mb-2 tracking-tight">{festival.region}</span>
                <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-[#E3051B] transition-colors line-clamp-1">
                  {festival.title}
                </h3>
                <p className="text-gray-500 text-sm mb-4 font-medium flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 opacity-70">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                  {festival.date}
                </p>
                <div className="mt-auto">
                  <span className="inline-block text-xs font-bold text-gray-600 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg">
                    {festival.tag}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
      </section>
    </div>
  );
}