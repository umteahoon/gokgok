import { motion } from "framer-motion";

export default function Home() {
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
    { id: 1, name: "포항 스페이스워크", desc: "영일대 해수욕장의 야경 맛집", tag: "야경맛집" },
    { id: 2, name: "제주 스누피가든", desc: "자연 속 힐링 포토존", tag: "사진명소" },
    { id: 3, name: "경주 황리단길", desc: "전통과 현대가 어우러진 거리", tag: "먹거리" },
    { id: 4, name: "부산 블루라인파크", desc: "바다를 품은 해변열차", tag: "오션뷰" },
  ];

  const renderTrend = (trend: string) => {
    switch (trend) {
      case "up": return <span className="text-[#A62639] text-xs font-bold">▲ up</span>; 
      case "down": return <span className="text-[#1D606C] text-xs font-bold">▼</span>; 
      case "new": return <span className="text-emerald-600 text-[10px] font-bold tracking-tighter">new</span>;
      default: return <span className="text-gray-400 text-xs font-medium">same</span>;
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-foreground relative flex flex-col items-center overflow-x-hidden">
      
      {/* 1. 배경 이미지 */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <img
          src="/main-bg.jpg"
          alt="메인 배경"
          className="w-full h-full object-cover opacity-20 dark:opacity-10 transition-opacity duration-700 blur-[2px]" 
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-background/60 to-background/95" />
      </div>

      {/* ======================================================== */}
      {/* SECTION 1: 타이틀 (우측으로 밀고 안전한 3D 그림자 적용) */}
      {/* ======================================================== */}
      <section className="relative h-screen flex flex-col pt-[20vh] px-6 md:px-16 lg:px-24 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="flex w-full justify-end"
        >
          <div className="text-right flex flex-col items-end">
            
            {/* 안전한 인라인 스타일로 3D 레트로 폰트 효과 구현 */}
            <h1 
              className="text-8xl md:text-[10rem] font-black text-[#2A2A2A] dark:text-[#EAEAEA] tracking-tighter leading-none mb-2" 
              style={{ 
                fontFamily: "'GmarketSansBold', sans-serif",
                textShadow: "4px 4px 0px rgba(212, 175, 55, 0.4)" // 에러 안 나는 안전한 그림자 코드
              }}
            >
              곡곡
            </h1>
            
            <p 
              className="text-3xl md:text-5xl font-bold text-foreground/80 tracking-[0.2em] mb-8"
              style={{ textShadow: "2px 2px 0px rgba(212, 175, 55, 0.3)" }}
            >
              GokGok
            </p>

            <p className="text-sm md:text-lg text-foreground/60 font-medium tracking-wide">
              당신의 다음 여정, 이곳에서 시작됩니다.
            </p>
          </div>
        </motion.div>

        {/* 스크롤 유도선 */}
        <motion.div
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50"
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <div className="w-[1px] h-8 bg-foreground/50 rounded-full"></div>
        </motion.div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 2: 정보 영역 */}
      {/* ======================================================== */}
      <section className="relative w-full max-w-6xl pt-10 pb-32 px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        
        {/* 왼쪽: 실시간 TOP 여행지 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="bg-[#F8F6F4]/80 dark:bg-[#1A1A1A]/80 backdrop-blur-md rounded-xl p-8 lg:p-10 border border-black/5 dark:border-white/5 shadow-sm"
        >
          <div className="mb-6 border-b border-foreground/10 pb-4">
            <h2 className="text-xl md:text-2xl font-bold text-foreground" style={{ fontFamily: 'GmarketSansBold' }}>
              실시간 TOP 여행지
            </h2>
            <p className="text-xs text-foreground/50 mt-1">대한민국 방방곡곡 인기 순위</p>
          </div>
          <ul className="space-y-4">
            {topDestinations.map((item) => (
              <li key={item.rank} className="flex items-center justify-between group cursor-pointer hover:bg-foreground/5 p-2 -mx-2 rounded-lg transition-colors">
                <div className="flex items-center gap-4">
                  <span className={`text-sm font-bold w-5 text-center ${item.rank <= 3 ? "text-[#D4AF37]" : "text-foreground/40"}`}>
                    {item.rank}.
                  </span>
                  <span className="text-sm md:text-base font-medium text-foreground/90 group-hover:text-foreground">
                    {item.name}
                  </span>
                </div>
                <div>{renderTrend(item.trend)}</div>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* 오른쪽: 최근 뜨는 관광지 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
          className="bg-[#F8F6F4]/80 dark:bg-[#1A1A1A]/80 backdrop-blur-md rounded-xl p-8 lg:p-10 border border-black/5 dark:border-white/5 shadow-sm flex flex-col"
        >
          <div className="mb-6 border-b border-foreground/10 pb-4">
            <h2 className="text-xl md:text-2xl font-bold text-foreground" style={{ fontFamily: 'GmarketSansBold' }}>
              최근 뜨는 관광지
            </h2>
            <p className="text-xs text-foreground/50 mt-1">에디터 추천 핫 플레이스</p>
          </div>
          
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {trendingSpots.map((spot) => (
              <div 
                key={spot.id} 
                className="group flex flex-col justify-between p-5 rounded-lg bg-white/50 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 border border-black/5 dark:border-white/5 transition-all cursor-pointer"
              >
                <div>
                  <h3 className="text-base font-bold text-foreground mb-1">
                    {spot.name}
                  </h3>
                  <p className="text-xs text-foreground/60 line-clamp-2">
                    {spot.desc}
                  </p>
                </div>
                <div className="mt-4">
                  <span className="text-[10px] px-2 py-1 bg-foreground/5 text-foreground/70 rounded font-medium">
                    {spot.tag}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

      </section>
    </div>
  );
}