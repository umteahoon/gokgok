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
  ];

  const trendingSpots = [
    { id: 1, name: "포항 스페이스워크", desc: "야경이 아름다운 핫플레이스", tag: "야경맛집" },
    { id: 2, name: "제주 스누피가든", desc: "MZ세대 인생샷 성지", tag: "사진명소" },
    { id: 3, name: "경주 황리단길", desc: "전통과 현대가 공존하는 거리", tag: "먹거리" },
    { id: 4, name: "부산 해운대 블루라인파크", desc: "바다를 가로지르는 해변열차", tag: "오션뷰" },
  ];

  const renderTrend = (trend: string) => {
    switch (trend) {
      case "up": return <span className="text-red-500 text-xs font-bold animate-pulse">▲</span>;
      case "down": return <span className="text-blue-500 text-xs font-bold">▼</span>;
      case "new": return <span className="text-emerald-500 text-[10px] font-bold tracking-tighter">NEW</span>;
      default: return <span className="text-gray-400 text-xs font-bold">-</span>;
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-foreground relative">
      
      {/* 1. 배경 이미지 (여기에 네가 준 바다 사진이 들어감!) */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <img
          src="/main-bg.jpg" // 👈 public 폴더에 저장한 사진 이름이랑 똑같이 맞춰줘!
          alt="메인 배경"
          className="w-full h-full object-cover opacity-30 dark:opacity-15 transition-opacity duration-700"
        />
        {/* 아래로 내려갈수록 글씨가 잘 보이도록 부드럽게 배경색으로 덮어주는 그라데이션 */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/5 via-background/60 to-background" />
      </div>

      {/* 2. 메인 컨텐츠 영역 */}
      <div className="relative z-10">
        
        {/* ======================================================== */}
        {/* 첫 번째 화면: 미니멀한 타이틀 영역 */}
        {/* ======================================================== */}
        <section className="relative h-[90vh] flex flex-col justify-center px-6 sm:px-12 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="flex w-full justify-end mt-[-10vh]"
          >
            <div className="text-right">
              <h1 
                className="text-7xl md:text-9xl font-bold text-foreground tracking-tighter" 
                style={{ fontFamily: 'GmarketSansBold' }}
              >
                곡곡
              </h1>
              <p className="text-2xl md:text-3xl font-light text-foreground/70 mt-2 tracking-[0.25em] uppercase">
                GokGok
              </p>
              <p className="text-lg md:text-xl text-foreground/50 mt-8 font-medium tracking-wide">
                당신의 다음 여정,<br />이곳에서 시작됩니다.
              </p>
            </div>
          </motion.div>

          <motion.div
            className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 opacity-40"
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          >
            <span className="text-[10px] uppercase tracking-[0.3em] font-semibold">Scroll</span>
            <div className="w-[1px] h-12 bg-foreground/40"></div>
          </motion.div>
        </section>

        {/* ======================================================== */}
        {/* 두 번째 화면: 정보 큐레이션 영역 */}
        {/* ======================================================== */}
        <section className="relative flex items-center justify-center pt-10 pb-32 px-4 sm:px-8">
          <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="bg-white/60 dark:bg-[#1E1E1E]/60 backdrop-blur-xl rounded-3xl p-8 lg:p-10 border border-white/40 dark:border-white/5 shadow-sm transition-colors duration-300"
            >
              <div className="flex items-center gap-3 mb-8">
                <span className="text-2xl">🔥</span>
                <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'GmarketSansBold' }}>
                  실시간 TOP 여행지
                </h2>
              </div>
              <ul className="space-y-5">
                {topDestinations.map((item) => (
                  <li key={item.rank} className="flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center gap-4">
                      <span className={`text-lg font-bold w-5 text-center ${item.rank <= 3 ? "text-[#8B4513] dark:text-[#D4A373]" : "text-muted-foreground"}`}>
                        {item.rank}
                      </span>
                      <span className="text-base font-medium text-foreground/80 group-hover:text-foreground transition-colors">
                        {item.name}
                      </span>
                    </div>
                    <div>{renderTrend(item.trend)}</div>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="bg-white/60 dark:bg-[#1E1E1E]/60 backdrop-blur-xl rounded-3xl p-8 lg:p-10 border border-white/40 dark:border-white/5 shadow-sm flex flex-col transition-colors duration-300"
            >
              <div className="flex items-center gap-3 mb-8">
                <span className="text-2xl">✨</span>
                <h2 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'GmarketSansBold' }}>
                  최근 떠오르는 핫플
                </h2>
              </div>
              <div className="flex-1 flex flex-col justify-between gap-4">
                {trendingSpots.map((spot) => (
                  <div key={spot.id} className="group p-4 rounded-2xl hover:bg-white/50 dark:hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-white/30 dark:hover:border-white/10">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-lg font-bold text-foreground/90 group-hover:text-foreground transition-colors">
                        {spot.name}
                      </h3>
                      <span className="text-[11px] px-2 py-1 bg-foreground/5 text-foreground/60 rounded-md font-semibold tracking-wider">
                        {spot.tag}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/50">{spot.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>

          </div>
        </section>
      </div>
    </div>
  );
}