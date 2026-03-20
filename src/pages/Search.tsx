import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { mockFestivals } from "@/lib/index";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";
import { FestivalCard } from "@/components/FestivalCard";
import { KoreaMap } from "@/components/KoreaMap";
import { SearchBar } from "@/components/SearchBar";

export default function Search() {
  const [activeTab, setActiveTab] = useState<"list" | "map">("list");
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const regionMap: Record<string, string[]> = {
    서울: ["서울특별시"],
    경기: ["경기도"],
    인천: ["인천광역시"],
    강원: ["강원도"],
    충북: ["충청북도"],
    충남: ["충청남도"],
    대전: ["대전광역시"],
    세종: ["세종특별자치시"],
    전북: ["전라북도"],
    전남: ["전라남도"],
    광주: ["광주광역시"],
    경북: ["경상북도"],
    경남: ["경상남도"],
    대구: ["대구광역시"],
    울산: ["울산광역시"],
    부산: ["부산광역시"],
    제주: ["제주특별자치도"],
  };

  const filteredFestivals = mockFestivals.filter((festival) => {
    const matchesSearch = searchQuery
      ? festival.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        festival.location.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const matchesRegion = selectedRegion
      ? regionMap[selectedRegion]?.some((loc) => festival.location.includes(loc))
      : true;

    return matchesSearch && matchesRegion;
  });

  const handleRegionSelect = (region: string) => {
    setSelectedRegion(region === selectedRegion ? "" : region);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-[#FDFBF7] py-12" /* 배경색을 따뜻한 톤으로 변경 */
    >
      <div className="container mx-auto px-4">
        
        {/* 상단 검색 영역: 시안 느낌 반영 */}
        <div className="mb-16 flex flex-col items-center">
          <h1 className="text-4xl md:text-5xl font-bold text-[#4A342E] mb-8 text-center">
            전국 방방곡곡 축제 찾기
          </h1>
          <div className="w-full max-w-3xl shadow-2xl rounded-2xl overflow-hidden bg-white">
            {/* SearchBar 내부의 지역/기간 바는 SearchBar.tsx 파일에서 지워야 하지만, 
                여기서도 max-w를 넓게 잡아 시원하게 보이게 설정했습니다. */}
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>

        {/* 탭 메뉴: 목록보기 / 지도보기 */}
        <div className="mb-10 border-b border-[#E5E7EB]">
          <div className="flex gap-10 justify-center md:justify-start">
            {(["list", "map"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 px-4 text-xl font-bold transition-all relative ${
                  activeTab === tab
                    ? "text-[#8B4513]"
                    : "text-[#9CA3AF] hover:text-[#6B5A55]"
                }`}
              >
                {tab === "list" ? "목록보기" : "지도보기"}
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute bottom-0 left-0 right-0 h-1 bg-[#8B4513] rounded-t-full"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* 콘텐츠 영역 */}
        <AnimatePresence mode="wait">
          {activeTab === "list" ? (
            <motion.div
              key="list"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: 20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredFestivals.length > 0 ? (
                filteredFestivals.map((festival) => (
                  <motion.div key={festival.id} variants={staggerItem}>
                    <FestivalCard festival={festival} />
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full text-center py-24 bg-white rounded-3xl border border-dashed border-[#D1D5DB]">
                  <p className="text-[#9CA3AF] text-xl font-medium">
                    찾으시는 축제 결과가 없습니다. 다시 검색해 보세요!
                  </p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="map"
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: 20 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start"
            >
              {/* 좌측 지도 섹션 */}
              <div className="lg:col-span-7 bg-white rounded-3xl border border-[#F5F1EE] p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-[#4A342E]">지역별 탐색</h2>
                  <span className="text-sm text-[#8B4513] font-semibold bg-[#FDFBF7] px-3 py-1 rounded-full">
                    지도를 클릭해 보세요
                  </span>
                </div>
                <KoreaMap
                  onRegionSelect={handleRegionSelect}
                  selectedRegion={selectedRegion}
                />
              </div>

              {/* 우측 리스트 섹션 */}
              <div className="lg:col-span-5 bg-white rounded-3xl border border-[#F5F1EE] p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-[#4A342E] mb-6 flex items-center gap-2">
                  <span className="w-2 h-6 bg-[#8B4513] rounded-full inline-block"></span>
                  {selectedRegion ? `${selectedRegion} 지역 축제` : "전체 축제"}
                </h2>
                <div className="space-y-5 max-h-[700px] overflow-y-auto pr-3 custom-scrollbar">
                  {filteredFestivals.length > 0 ? (
                    filteredFestivals.map((festival) => (
                      <motion.div
                        key={festival.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        <FestivalCard festival={festival} variant="compact" />
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-20">
                      <p className="text-[#9CA3AF]">
                        {selectedRegion
                          ? `${selectedRegion} 지역에 등록된 축제가 없습니다.`
                          : "표시할 축제 정보가 없습니다."}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}