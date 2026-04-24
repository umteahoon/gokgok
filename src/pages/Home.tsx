// Home.tsx
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import homeBack from "@/assets/homeBack.jpg";

const backgrounds = [
  homeBack,
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1600",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1600",
  "https://images.unsplash.com/photo-1491553895911-0055eca6402d?q=80&w=1600",
];

const topDestinations = [
  { rank: "01", name: "진해 군항제", trend: "up" },
  { rank: "02", name: "진주 남강 유등축제", trend: "up" },
  { rank: "03", name: "무주 반딧불축제", trend: "same" },
  { rank: "04", name: "여수 밤바다 불꽃축제", trend: "down" },
  { rank: "05", name: "금산 인삼축제", trend: "new" },
  { rank: "06", name: "경주 벚꽃축제", trend: "up" },
  { rank: "07", name: "보령 머드축제", trend: "same" },
  { rank: "08", name: "안동 국제탈춤페스티벌", trend: "down" },
  { rank: "09", name: "화천 산천어축제", trend: "up" },
  { rank: "10", name: "부산 불꽃축제", trend: "new" },
];

const trendingSpots = [
  {
    id: 1,
    name: "포항 스페이스워크",
    tag: "야경 맛집",
    img: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000",
  },
  {
    id: 2,
    name: "제주 스누피가든",
    tag: "사진 명소",
    img: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1000",
  },
  {
    id: 3,
    name: "경주 황리단길",
    tag: "먹거리",
    img: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?q=80&w=1000",
  },
  {
    id: 4,
    name: "부산 블루라인파크",
    tag: "오션 뷰",
    img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000",
  },
];

export default function Home() {
  const [selected, setSelected] = useState<any>(null);

  // 🔥 배경 인덱스
  const [bgIndex, setBgIndex] = useState(0);

  // 🔥 자동 슬라이드
  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % backgrounds.length);
    }, 4000); // 4초마다 변경

    return () => clearInterval(interval);
  }, []);

  // ESC 키로 닫기
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const renderTrend = (trend: string) => {
    switch (trend) {
      case "up":
        return (
          <span className="text-[#A62639] text-[9px] font-black tracking-widest uppercase italic">
            ▲ up
          </span>
        );
      case "down":
        return (
          <span className="text-[#1D606C] text-[9px] font-black italic uppercase">
            ▼ down
          </span>
        );
      case "new":
        return (
          <span className="text-emerald-600 text-[9px] font-black tracking-tighter uppercase italic">
            new
          </span>
        );
      default:
        return (
          <span className="text-neutral-300 text-[9px] font-medium italic uppercase tracking-widest">
            same
          </span>
        );
    }
  };

  return (
    <div className="relative w-full text-foreground overflow-x-hidden bg-white">
      {/* SECTION 1 */}
      <section className="relative h-screen flex flex-col justify-end px-8 md:px-16 pb-24">
        {/* 🔥 배경 이미지 슬라이드 */}
        <div className="absolute inset-0 z-0 w-full h-full overflow-hidden">
          <AnimatePresence>
            <motion.img
              key={bgIndex}
              src={backgrounds[bgIndex]}
              alt="Background"
              className="absolute w-full h-full object-cover brightness-[0.75]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
            />
          </AnimatePresence>

          <div className="absolute inset-0 bg-black/20" />
        </div>

        <motion.div
          className="relative z-10"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
        >
          <h1 className="text-[22vw] md:text-[18vw] font-black leading-[0.8] tracking-tight text-white">
            <br />
            <span className="opacity-20"></span>
          </h1>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mt-10">
            <p className="text-2xl md:text-3xl italic max-w-lg text-white">
              <br />
            </p>

            <div className="text-right border-t border-white/30 pt-6 max-w-[200px]">
              <p className="text-[11px] uppercase tracking-[0.2em] text-white">
                Exploration Bureau
              </p>
              <p className="text-[10px] text-white/60 mt-1">
                Est. 2026 / GOKGOK ARCHIVE
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 나머지 코드는 그대로 유지 */}
    </div>
  );
}
