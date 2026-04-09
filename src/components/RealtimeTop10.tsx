import { motion } from "framer-motion";

export function RealtimeTop10() {
  // 실시간 추천 여행지 목업 데이터
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

  // 트렌드 아이콘 렌더링 함수
  const renderTrend = (trend: string) => {
    switch (trend) {
      case "up":
        return <span className="text-red-500 text-xs animate-bounce">▲</span>;
      case "down":
        return <span className="text-blue-500 text-xs">▼</span>;
      case "new":
        return <span className="text-emerald-500 text-[10px] font-bold tracking-tighter">NEW</span>;
      default:
        return <span className="text-gray-400 text-xs">-</span>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      // (박현준) 디자인 핵심: 투명한 유리 질감(backdrop-blur) + 다크모드 완벽 대응
      className="absolute bottom-10 left-10 z-20 w-64 rounded-2xl bg-white/70 dark:bg-[#1A1A1A]/80 backdrop-blur-md shadow-2xl border border-white/40 dark:border-[#333333]/50 p-5 overflow-hidden transition-colors duration-300"
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">🔥</span>
        <h3 className="font-bold text-gray-900 dark:text-gray-100 text-base" style={{ fontFamily: 'GmarketSansBold' }}>
          실시간 TOP 10 여행지
        </h3>
      </div>

      <ul className="space-y-3">
        {topDestinations.map((item) => (
          <li key={item.rank} className="flex items-center justify-between group cursor-pointer">
            <div className="flex items-center gap-3">
              {/* 1~3위는 특별한 색상, 나머지는 회색 */}
              <span 
                className={`font-bold w-4 text-center ${
                  item.rank <= 3 ? "text-[#8B4513] dark:text-[#D4A373]" : "text-gray-400 dark:text-gray-500"
                }`}
              >
                {item.rank}
              </span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-black dark:group-hover:text-white transition-colors">
                {item.name}
              </span>
            </div>
            <div>{renderTrend(item.trend)}</div>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}