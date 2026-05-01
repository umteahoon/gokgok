import { motion } from "framer-motion";
// 이미지는 assets/images에 저장되어 있다고 가정
import { IMAGES } from "@/assets/images";

// 실제 이미지 경로로 수정 (assets 폴더에 이미지가 있어야 함)
const festivalList = [
  { id: 1, title: "진해 군항제", region: "경남 창원시", date: "2026.03.22 ~ 04.01", tag: "#벚꽃명소", img: "/assets/images/jinhae_cherry.jpg" },
  { id: 2, title: "진주 남강 유등축제", region: "경남 진주시", date: "2026.10.05 ~ 10.20", tag: "#야경맛집", img: "/assets/images/jinju_lanterns.jpg" },
  { id: 3, title: "무주 반딧불축제", region: "전북 무주군", date: "2026.08.31 ~ 09.08", tag: "#생태체험", img: "/assets/images/muju_fireflies.jpg" },
  { id: 4, title: "여수 밤바다 불꽃축제", region: "전남 여수시", date: "2026.10.26 ~ 10.26", tag: "#불꽃놀이", img: "/assets/images/yeosu_fireworks.jpg" },
];

const regions = ["전체", "서울", "경기/인천", "강원", "충청", "전라", "경상", "제주"];

export default function Home() {
  return (
    <div className="w-full min-h-screen bg-[#FDF9F3] text-gray-900 font-sans">
      
      {/* 1. Header (로고 & GNB) */}
      <header className="fixed top-0 left-0 w-full bg-[#FDF9F3]/90 backdrop-blur-sm z-50 px-8 py-4 flex items-center justify-between border-b border-[#E3051B]/10">
        <div className="flex items-center gap-16">
          <h1 className="text-3xl font-bold text-gray-950 font-serif tracking-tight">곡곡</h1>
          <nav className="flex items-center gap-10 text-lg font-medium text-gray-700">
            {['마당', '축제', '수다', '내 정보'].map((item, idx) => (
              <a key={item} href="#" className={`relative ${idx === 0 ? 'text-[#E3051B]' : 'hover:text-[#E3051B]'}`}>
                {item}
                {idx === 0 && <span className="absolute -bottom-1 left-0 right-0 h-1 bg-[#E3051B] rounded-full" />}
              </a>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-gray-600 font-mono">00:52:48</span>
          <button className="bg-gray-100 px-4 py-1.5 rounded-full hover:bg-gray-200">연장</button>
          <button className="text-xl">🌙</button>
          <button className="bg-gray-100 px-4 py-1.5 rounded-full font-bold hover:bg-gray-200">로그아웃</button>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative w-full h-[65vh] flex items-center justify-center pt-24 overflow-hidden">
        {/* 풍등 야경 배경 이미지 */}
        <div className="absolute inset-0 z-0 scale-105">
          <img
            src="/assets/images/main_hero_ lanterns.jpg" // 등불 이미지로 대체
            alt="감성 배경"
            className="w-full h-full object-cover brightness-90"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

        {/* 메인 텍스트 */}
        <div className="relative z-10 text-center text-white flex flex-col items-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="font-serif text-[72px] font-medium leading-tight tracking-tighter"
          >
            <span className="block">대한민국의</span>
            <span className="block mt-[-10px]">따뜻한 매력을</span>
            <span className="block mt-[-10px]">구석구석 느껴보세요.</span>
          </motion.h1>
        </div>
      </section>
      
      {/* 3. 콘텐츠 영역 */}
      <main className="w-full max-w-7xl mx-auto py-16 px-8 bg-white rounded-t-3xl shadow-[-5px_0_30px_rgba(0,0,0,0.03)] -mt-12 relative z-20">
        
        {/* 지역별 필터 (현대적인 Pill 디자인) */}
        <div className="mb-12 pb-8 border-b border-gray-100">
          <div className="flex gap-3 overflow-x-auto no-scrollbar py-2">
            {regions.map((region, idx) => (
              <button
                key={region}
                className={`px-8 py-3.5 rounded-full text-base font-bold transition-all ${
                  idx === 0 
                  ? "bg-[#E3051B] text-white shadow-md shadow-[#E3051B]/20" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {region}
              </button>
            ))}
          </div>
        </div>

        {/* 이달의 추천 축제 */}
        <section className="mb-16">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-4xl font-serif font-medium text-gray-950 mb-3 tracking-tighter">이달의 추천 축제</h2>
              <p className="text-xl text-gray-600 font-medium">지금 가장 사랑받는 전국의 축제들을 만나보세요.</p>
            </div>
            <button className="text-lg font-bold text-gray-400 hover:text-gray-700 transition-colors">
              전체보기 &gt;
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {festivalList.map((festival, idx) => (
              <motion.div
                key={festival.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="group cursor-pointer rounded-3xl overflow-hidden bg-white shadow-xl shadow-gray-100 border border-gray-100 hover:shadow-2xl transition-all"
              >
                {/* 썸네일 */}
                <div className="aspect-[11/14] overflow-hidden bg-gray-200">
                  <img
                    src={festival.img}
                    alt={festival.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                </div>
                {/* 텍스트 정보 */}
                <div className="p-7">
                  <h3 className="text-2xl font-serif font-medium text-gray-950 mb-3 group-hover:text-[#E3051B]">
                    {festival.title}
                  </h3>
                  <p className="text-lg text-gray-600 font-medium mb-1 tracking-tight">
                    🗓️ {festival.date}
                  </p>
                  <p className="text-base text-[#E3051B] font-bold tracking-tighter">
                    #{festival.tag.replace('#', '')}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}