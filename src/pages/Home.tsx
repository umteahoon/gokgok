import { motion } from "framer-motion";
import { IMAGES } from "@/assets/images";

export default function Home() {
  const topDestinations = [
    { rank: 1, name: "진해 군항제", trend: "up" },
    { rank: 2, name: "진주 유등축제", trend: "up" },
    { rank: 3, name: "무주 반딧불", trend: "same" },
    { rank: 4, name: "여수 불꽃축제", trend: "down" },
    { rank: 5, name: "금산 인삼축제", trend: "new" },
  ];

  const trendingSpots = [
    { id: 1, name: "포항 스페이스워크", desc: "야경맛집", tag: "인생샷" },
    { id: 2, name: "경주 황리단길", desc: "먹거리", tag: "레트로" },
    { id: 3, name: "제주 스누피가든", desc: "사진명소", tag: "MZ핫플" },
  ];

  const renderTrend = (trend: string) => {
    switch (trend) {
      case "up": return <span className="text-red-600 text-xs font-bold animate-pulse">▲</span>;
      case "down": return <span className="text-blue-600 text-xs font-bold">▼</span>;
      case "new": return <span className="text-emerald-600 text-[10px] font-bold tracking-tighter">NEW</span>;
      default: return <span className="text-gray-400 text-xs font-bold">-</span>;
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-foreground relative flex flex-col items-center">
      
      {/* 1. 배경 이미지 (여전히 아름다운 바다 뷰) */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <img
          src="/main-bg.jpg" // public 폴더에 넣은 바다 사진
          alt="메인 배경"
          className="w-full h-full object-cover opacity-25 dark:opacity-10 transition-opacity duration-700 blur-sm" // 사진을 살짝 흐릿하게 해서 민속풍 UI가 더 돋보이게 함
        />
        {/* 아래로 내려갈수록 배경색으로 덮어주는 은은한 페이드 */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/5 via-background/50 to-background/90" />
      </div>

      {/* ======================================================== */}
      {/* SECTION 1: 대문 - 고즈넉한 한국의 미가 반겨주는 타이틀 영역 */}
      {/* ======================================================== */}
      <section className="relative h-screen flex flex-col justify-center px-6 sm:px-12 max-w-7xl mx-auto w-full">
        {/* 타이틀을 오른쪽 중앙에 배치 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="flex w-full justify-end mt-[-10vh]"
        >
          <div className="text-right">
            {/* (박현준: 변경) 우리나라 전통 서예 느낌을 살린 타이포그래피 설정 */}
            <h1 
              className="text-8xl md:text-9xl font-extrabold text-foreground tracking-tighter" 
              style={{ fontFamily: 'var(--font-calligraphy), sans-serif', letterSpacing: '-0.08em' }} // 예시: 전통 서예체 폰트 (var 변수 설정 필요)
            >
              어디로<br />떠날까요?
            </h1>
            <p className="text-xl md:text-2xl font-light text-foreground/70 mt-4 tracking-[0.25em] uppercase">
              GokGok
            </p>
            <p className="text-lg md:text-xl text-foreground/50 mt-10 font-medium tracking-wide">
              당신의 다음 여정,<br />이곳에서 시작됩니다.
            </p>
          </div>
        </motion.div>

        {/* 스크롤 유도 애니메이션 (우리나라 전통 벼루 모양) */}
        <motion.div
          className="absolute bottom-16 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 opacity-40 cursor-pointer"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: "smooth" })}
        >
          <span className="text-[10px] uppercase tracking-[0.3em] font-semibold text-foreground/60">여정의 시작</span>
          <div className="w-[1px] h-12 bg-foreground/40"></div>
        </motion.div>
      </section>

      {/* ======================================================== */}
      {/* SECTION 2: 정보 큐레이션 영역 (스크롤 내리면 등장) */}
      {/* ======================================================== */}
      <section className="relative w-full max-w-7xl pt-10 pb-32 px-4 sm:px-12 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        
        {/* 왼쪽: 실시간 TOP 여행지 (두루마리가 펼쳐지는 느낌) */}
        <motion.div
          initial={{ opacity: 0, y: 50, scaleX: 0 }}
          whileInView={{ opacity: 1, y: 0, scaleX: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{ transformOrigin: "center top" }}
          // (박현준: 변경) 벤토 박스를 빼고, 한지 질감과 패턴 테두리를 준 '두루마리' 패널로 변경
          className="bg-white/70 dark:bg-[#e0e0e0]/70 backdrop-blur-xl rounded-t-sm rounded-b-2xl p-10 lg:p-12 shadow-[0_4px_30px_rgb(0,0,0,0.02)] border border-gray-100/50 transition-colors duration-300 relative"
        >
          {/* 한지 특유의 질감 효과 (public 폴더의 한지 이미지 사용) */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('/hanji-texture.jpg')", backgroundSize: 'cover' }} />
          
          <div className="flex items-center gap-4 mb-10 relative z-10">
            <span className="text-3xl">🏮</span>
            <h2 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-serif-bold), serif' }}>
              실시간 TOP 여행지
            </h2>
          </div>
          <ul className="space-y-6 relative z-10">
            {topDestinations.map((item) => (
              <li key={item.rank} className="flex items-center justify-between group cursor-pointer border-b border-gray-200 last:border-0 pb-3">
                <div className="flex items-center gap-5">
                  <span className={`text-xl font-bold w-6 text-center ${item.rank <= 3 ? "text-[#8B4513] dark:text-[#D4A373]" : "text-gray-400"}`}>
                    {item.rank}
                  </span>
                  <span className="text-lg font-medium text-gray-800 group-hover:text-black transition-colors">
                    {item.name}
                  </span>
                </div>
                <div>{renderTrend(item.trend)}</div>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* 오른쪽: 최근 뜨는 핫플 (조각보가 짜이는 듯한 느낌) */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          // (박현준: 변경) 한지 질감과 단청 색상을 포인트로 준 '조각보' 패널로 변경
          className="bg-white/70 dark:bg-[#e0e0e0]/70 backdrop-blur-xl rounded-2xl p-10 lg:p-12 shadow-[0_4px_30px_rgb(0,0,0,0.02)] border border-gray-100/50 flex flex-col transition-colors duration-300 relative"
        >
          {/* 한지 특유의 질감 효과 */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('/hanji-texture.jpg')", backgroundSize: 'cover' }} />

          <div className="flex items-center gap-4 mb-10 relative z-10">
            <span className="text-3xl">✨</span>
            <h2 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-serif-bold), serif' }}>
              최근 뜨는 관광지
            </h2>
          </div>
          <div className="flex-1 flex flex-col justify-between gap-5 relative z-10">
            {trendingSpots.map((spot, index) => (
              // (박현준: 변경) 조각보를 닮은 컬러 포인트와 둥근 모서리 카드 디자인
              <div 
                key={spot.id} 
                className={`group p-6 rounded-2xl bg-white dark:bg-[#f5f5f5] hover:bg-gray-50 transition-colors cursor-pointer border border-gray-100 ${index % 3 === 0 ? "border-l-4 border-l-[#A62639]" : index % 3 === 1 ? "border-l-4 border-l-[#1D606C]" : "border-l-4 border-l-[#D4AF37]" }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-black transition-colors">
                    {spot.name}
                  </h3>
                  <span className="text-[11px] px-2 py-1 bg-gray-100 text-gray-600 rounded-md font-semibold tracking-wider">
                    {spot.tag}
                  </span>
                </div>
                <p className="text-base text-gray-600">{spot.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

      </section>
    </div>
  );
}