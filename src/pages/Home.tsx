import { motion } from "framer-motion";
import { IMAGES } from "@/assets/images";

// 🔥 바로 이 부분! assets 폴더에 넣은 사진을 리액트가 멱살 잡고 확실하게 끌고 옵니다.
import bgImage from "@/assets/busan.jpg"; 

const topDestinations = [
  { rank: 1, name: "진해 군항제", trend: "up" },
  { rank: 2, name: "진주 남강 유등축제", trend: "up" },
  { rank: 3, name: "무주 반딧불축제", trend: "same" },
  { rank: 4, name: "여수 밤바다 불꽃축제", trend: "down" },
  { rank: 5, name: "금산 인삼축제", trend: "new" },
  { rank: 6, name: "경주 벚꽃축제", trend: "up" },
  { rank: 7, name: "보령 머드축제", trend: "same" },
  { rank: 8, name: "안동 국제탈춤페스티벌", trend: "down" },
  { rank: 9, name: "화천 산천어축제", trend: "up" },
  { rank: 10, name: "부산 불꽃축제", trend: "new" },
];

const trendingSpots = [
  { id: 1, name: "포항 스페이스워크", desc: "영일대 해수욕장의 야경 맛집", tag: "야경맛집", img: IMAGES.CULTURAL_EVENT_1 },
  { id: 2, name: "제주 스누피가든", desc: "자연 속 힐링 포토존", tag: "사진명소", img: IMAGES.FESTIVAL_EVENT_5 },
  { id: 3, name: "경주 황리단길", desc: "전통과 현대가 어우러진 거리", tag: "먹거리", img: IMAGES.FESTIVAL_MAIN_7 },
  { id: 4, name: "부산 블루라인파크", desc: "바다를 품은 해변열차", tag: "오션뷰", img: IMAGES.CULTURAL_EVENT_6 },
];

export default function Home() {
  const renderTrend = (trend: string) => {
    switch (trend) {
      case "up": return <span className="text-[#FF2D55] text-xs font-bold">▲ up</span>; 
      case "down": return <span className="text-[#0A84FF] text-xs font-bold">▼</span>; 
      case "new": return <span className="text-[#30D158] text-[10px] font-bold tracking-tighter">new</span>;
      default: return <span className="text-gray-400 text-xs font-medium">same</span>;
    }
  };

  return (
    <div className="relative w-full min-h-screen overflow-x-hidden text-white">
      
      {/* ======================================================== */}
      {/* 1. 배경 이미지 (import 해온 bgImage를 변수로 사용합니다!) */}
      {/* ======================================================== */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-black">
        <img
          src={bgImage} /* 🔥 문자열이 아닌 bgImage 변수를 넣어서 무조건 나오게 세팅 완료! */
          alt="메인 배경"
          className="w-full h-full object-cover opacity-80" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
      </div>

      {/* ======================================================== */}
      {/* 2. 메인 컨텐츠 영역 */}
      {/* ======================================================== */}
      <div className="relative z-10 flex flex-col items-center w-full">
        
        <section className="relative h-screen flex flex-col pt-[20vh] px-6 md:px-16 lg:px-24 w-full">
          <div className="flex w-full justify-end">
            <div className="text-right flex flex-col items-end">
              <h1 
                className="text-8xl md:text-[10rem] font-black tracking-tighter leading-none mb-2 text-white" 
                style={{ 
                  fontFamily: "'GmarketSansBold', sans-serif",
                  textShadow: "4px 4px 0px rgba(212, 175, 55, 0.4)" 
                }}
              >
                곡곡
              </h1>
              
              <p 
                className="text-3xl md:text-5xl font-bold tracking-[0.2em] mb-8 text-white/90"
                style={{ textShadow: "2px 2px 0px rgba(212, 175, 55, 0.3)" }}
              >
                GokGok
              </p>

              <p className="text-sm md:text-lg font-medium tracking-wide text-white/70">
                당신의 다음 여정, 이곳에서 시작됩니다.
              </p>
            </div>
          </div>

          <motion.div
            className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50"
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          >
            <div className="w-[1px] h-8 bg-white/50 rounded-full"></div>
          </motion.div>
        </section>

        <section className="relative w-full max-w-6xl pt-10 pb-32 px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 lg:p-10 border border-white/10 shadow-lg">
            <div className="mb-6 border-b border-white/10 pb-4">
              <h2 className="text-xl md:text-2xl font-bold text-white" style={{ fontFamily: 'GmarketSansBold' }}>
                실시간 TOP 여행지
              </h2>
              <p className="text-xs text-white/50 mt-1">대한민국 방방곡곡 인기 순위</p>
            </div>
            <ul className="space-y-4">
              {topDestinations.map((item) => (
                <li key={item.rank} className="flex items-center justify-between group cursor-pointer hover:bg-white/5 p-2 -mx-2 rounded-lg transition-colors">
                  <div className="flex items-center gap-4">
                    <span className={`text-sm font-bold w-5 text-center ${item.rank <= 3 ? "text-[#D4AF37]" : "text-white/40"}`}>
                      {item.rank}.
                    </span>
                    <span className="text-sm md:text-base font-medium text-white/90 group-hover:text-white">
                      {item.name}
                    </span>
                  </div>
                  <div>{renderTrend(item.trend)}</div>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 lg:p-10 border border-white/10 shadow-lg flex flex-col">
            <div className="mb-6 border-b border-white/10 pb-4">
              <h2 className="text-xl md:text-2xl font-bold text-white" style={{ fontFamily: 'GmarketSansBold' }}>
                최근 뜨는 관광지
              </h2>
              <p className="text-xs text-white/50 mt-1">에디터 추천 핫 플레이스</p>
            </div>
            
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {trendingSpots.map((spot) => (
                <div 
                  key={spot.id} 
                  className="group relative h-64 rounded-lg overflow-hidden border border-white/10 shadow-md cursor-pointer"
                >
                  <img 
                    src={spot.img} 
                    alt={spot.name} 
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-5 w-full">
                    <span className="inline-block text-[9px] px-2 py-0.5 bg-[#D4AF37] text-white rounded mb-2 font-bold uppercase tracking-wider">
                      {spot.tag}
                    </span>
                    <h3 className="text-base font-bold text-white mb-1">
                      {spot.name}
                    </h3>
                    <p className="text-[11px] text-white/70 line-clamp-1">
                      {spot.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </section>
      </div>
    </div>
  );
}