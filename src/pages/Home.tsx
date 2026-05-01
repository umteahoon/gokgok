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
  return (
    <div className="relative w-full min-h-screen bg-white text-gray-900 font-sans">
      
      {/* ========================================== */}
      {/* 1. HERO SECTION (메인 배너 및 검색) */}
      {/* ========================================== */}
      <section className="relative w-full h-[50vh] md:h-[60vh] flex flex-col justify-center items-center">
        {/* 배경 이미지 */}
        <div className="absolute inset-0 z-0">
          <img
            src="/public/45f1c8951ca8a760d4a413a01a54dc50.jpg"
            alt="메인 배경"
            className="w-full h-full object-cover brightness-75"
          />
        </div>

        {/* 메인 텍스트 & 검색창 */}
        <div className="relative z-10 flex flex-col items-center w-full max-w-4xl px-4 mt-12">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 text-center tracking-tight"
            style={{ textShadow: "0 2px 10px rgba(0,0,0,0.3)" }}
          >
            어디로 떠나볼까요?
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-white/90 mb-8 text-center"
          >
            곡곡에서 전국의 즐거운 축제를 찾아보세요
          </motion.p>

          {/* 검색창 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full max-w-2xl bg-white p-2 rounded-full shadow-2xl flex items-center"
          >
            <input 
              type="text" 
              placeholder="검색어를 입력하세요 (예: 벚꽃, 진해)" 
              className="flex-1 bg-transparent px-6 py-3 md:py-4 text-base md:text-lg outline-none text-gray-800 placeholder-gray-400"
            />
            <button className="bg-[#E3051B] text-white px-8 py-3 md:py-4 rounded-full font-bold hover:bg-[#C10415] transition-colors whitespace-nowrap">
              검색
            </button>
          </motion.div>

          {/* 추천 해시태그 */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center gap-2 mt-6"
          >
            {topKeywords.map((keyword, idx) => (
              <button key={idx} className="text-sm text-white bg-black/30 hover:bg-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full transition-colors border border-white/20">
                {keyword}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ========================================== */}
      {/* 2. 지역별 필터 (네비게이션 바 형태) */}
      {/* ========================================== */}
      <div className="w-full border-b border-gray-200 bg-white sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 overflow-x-auto no-scrollbar">
          <div className="flex space-x-8 py-4 min-w-max">
            {regions.map((region, idx) => (
              <button 
                key={idx} 
                className={`text-lg font-bold pb-4 -mb-4 border-b-4 transition-colors ${
                  idx === 0 
                  ? "border-[#E3051B] text-[#E3051B]" 
                  : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
              >
                {region}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* 3. 메인 콘텐츠 영역 (화이트 배경, 깔끔한 카드) */}
      {/* ========================================== */}
      <section className="w-full max-w-7xl mx-auto py-16 px-4 md:px-8">
        
        {/* 섹션 타이틀 */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">이달의 추천 축제</h2>
            <p className="text-gray-500">지금 가장 사랑받는 전국의 축제들을 만나보세요.</p>
          </div>
          <button className="text-sm font-medium text-gray-500 hover:text-gray-900 flex items-center gap-1">
            더보기 &gt;
          </button>
        </div>

        {/* 축제 카드 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {festivalList.map((festival, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              key={festival.id} 
              className="group cursor-pointer flex flex-col"
            >
              {/* 썸네일 영역 */}
              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden mb-4 shadow-md group-hover:shadow-xl transition-shadow">
                <img 
                  src={festival.img} 
                  alt={festival.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                {/* 뱃지 */}
                <div className="absolute top-3 left-3">
                  <span className="bg-black/70 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-md">
                    진행중
                  </span>
                </div>
              </div>

              {/* 텍스트 영역 */}
              <div className="flex flex-col px-1">
                <span className="text-[#E3051B] text-sm font-bold mb-1">{festival.region}</span>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#E3051B] transition-colors line-clamp-1">
                  {festival.title}
                </h3>
                <p className="text-gray-500 text-sm mb-3 flex items-center gap-1">
                  🗓️ {festival.date}
                </p>
                <div>
                  <span className="inline-block text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-md">
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