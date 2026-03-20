import { motion } from "framer-motion";
import { mockFestivals, topFestivals, recentFestivals } from "@/lib/index";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";
import { SearchBar } from "@/components/SearchBar";
import { FestivalCard } from "@/components/FestivalCard";
import { TopRankingList } from "@/components/TopRankingList";
import { IMAGES } from "@/assets/images";

export default function Home() {
  return (
    <div className="min-h-screen">
      <section className="relative h-[700px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={IMAGES.FESTIVAL_MAIN_1}
            alt="축제 배경"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-transparent to-background/70" />
        </div>

        <motion.div
          className="relative z-10 w-full max-w-4xl px-4"
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
        >
          
          <SearchBar />
        </motion.div>
      </section>
    </div>
  );
}
