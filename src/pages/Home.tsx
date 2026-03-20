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
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
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
          <h1 className="text-5xl md:text-6xl font-bold text-center mb-4 text-foreground">
            곡곡 <span className="text-primary">GokGok</span>
          </h1>
          <p className="text-xl text-center mb-12 text-muted-foreground">
            대한민국 구석구석, 지역 축제를 탐색하세요
          </p>
          <SearchBar />
        </motion.div>
      </section>

      {/* <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <motion.div
            className="lg:col-span-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-foreground">오늘의 축제</h2>
              <span className="text-sm text-muted-foreground">{mockFestivals.length}개</span>
            </div>
            <div className="space-y-4">
              {mockFestivals.slice(0, 4).map((festival) => (
                <motion.div key={festival.id} variants={staggerItem}>
                  <FestivalCard festival={festival} variant="compact" />
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="lg:col-span-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-foreground">요즘 뜨는 TOP 10</h2>
              <span className="text-sm text-primary font-medium">실시간 인기</span>
            </div>
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <TopRankingList festivals={topFestivals} />
            </div>
          </motion.div>

          <motion.div
            className="lg:col-span-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-foreground">최근 뜨는 행사</h2>
              <span className="text-sm text-muted-foreground">{recentFestivals.length}개</span>
            </div>
            <div className="space-y-4">
              {recentFestivals.slice(0, 4).map((festival) => (
                <motion.div key={festival.id} variants={staggerItem}>
                  <FestivalCard festival={festival} variant="compact" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-3xl font-semibold mb-4 text-foreground">지역별 인기 축제</h2>
            <p className="text-muted-foreground">전국 각지의 특색있는 축제를 만나보세요</p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            {mockFestivals.map((festival) => (
              <motion.div key={festival.id} variants={staggerItem}>
                <FestivalCard festival={festival} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <motion.div
          className="bg-gradient-to-br from-primary/10 via-accent/5 to-primary/5 rounded-2xl p-12 text-center border border-primary/20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <h2 className="text-3xl font-semibold mb-4 text-foreground">축제 정보를 찾고 계신가요?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            지역별, 날짜별, 카테고리별로 원하는 축제를 쉽게 찾아보세요
          </p>
          <a
            href="#/search"
            className="inline-flex items-center justify-center px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl"
          >
            축제 찾아보기
          </a>
        </motion.div>
      </section> */}
    </div>
  );
}
