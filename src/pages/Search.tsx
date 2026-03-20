import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { mockFestivals, topFestivals } from "@/lib/index";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";
import { FestivalCard } from "@/components/FestivalCard";
// (박현준 : 코드 변경) - img 태그 대신 다시 인터랙티브한 KoreaMap 컴포넌트를 불러옵니다.
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

  // 🔥 모든 축제 합치기 (mockFestivals + topFestivals)
  const allFestivals = [...topFestivals, ...mockFestivals];

  const filteredFestivals = allFestivals.filter((festival) => {
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
      className="min-h-screen bg-[#FDFBF7] py-12"
    >
      <div className="container mx-auto px-4">
        
        {/* 상단 검색 영역 (기존 유지) */}
        <div className="mb-16 flex flex-col items-center">
          <h1 className="text-4xl md:text-5xl font-bold text-[#4A342E] mb-8 text-center" 
              style={{ fontFamily: 'GmarketSansBold' }}> {/* 직접 폰트 지정 */}
            전국 방방곡곡 축제 찾기
          </h1>
          <div className="w-full max-w-3xl rounded-2xl backdrop-blur-lg bg-white/10 border border-white/20 shadow-lg">
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>

        {/* 뷰 모드 토글 스위치 (기존 우측 정렬 유지) */}
        <div className="mb-8 flex justify-end">
          <div className="relative flex items-center bg-[#F5F1EE] rounded-full p-1 shadow-inner border border-[#EAE5E1]">
            <motion.div
              className="absolute top-1 bottom-1 w-[100px] bg-white rounded-full shadow-sm"
              initial={false}
              animate={{ left: activeTab === "list" ? 4 : 104 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
            <button
              onClick={() => setActiveTab("list")}
              className={`relative z-10 w-[100px] py-2 text-sm font-bold transition-colors rounded-full ${
                activeTab === "list" ? "text-[#8B4513]" : "text-[#9CA3AF] hover:text-[#6B5A55]"
              }`}
            >
              목록보기
            </button>
            <button
              onClick={() => setActiveTab("map")}
              className={`relative z-10 w-[100px] py-2 text-sm font-bold transition-colors rounded-full ${
                activeTab === "map" ? "text-[#8B4513]" : "text-[#9CA3AF] hover:text-[#6B5A55]"
              }`}
            >
              지도보기
            </button>
          </div>
        </div>

        {/* 콘텐츠 영역 */}
        <AnimatePresence mode="wait">
          {activeTab === "list" ? (
            /* 이동교(코드추가) 스크롤 기능 */
            <motion.div
              key="list"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: 20 }}
              className="h-[750px] overflow-y-auto pr-4 custom-scrollbar"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
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
              </div>
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
              <div className="lg:col-span-7 bg-white rounded-3xl border border-[#F5F1EE] p-8 shadow-sm h-[750px] flex flex-col">
                <div className="flex items-center justify-between mb-4 shrink-0">
                  <h2 className="text-2xl font-bold text-[#4A342E]">지역별 탐색</h2>
                  <span className="text-sm text-[#8B4513] font-semibold bg-[#FDFBF7] px-3 py-1 rounded-full">
                    원하는 지역을 클릭해 보세요
                  </span>
                </div>
                
                {/* (박현준 : 코드 변경) - img 태그를 빼고, 선택 기능이 담긴 KoreaMap 컴포넌트를 배치했습니다. */}
                <div className="flex-1 flex justify-center items-center w-full bg-[#FDFBF7] rounded-2xl p-4 overflow-hidden relative">
                  <KoreaMap 
                    selectedRegion={selectedRegion} 
                    onRegionSelect={handleRegionSelect} 
                  />
                </div>
              </div>

              {/* 우측 리스트 섹션 */}
              <div className="lg:col-span-5 bg-white rounded-3xl border border-[#F5F1EE] p-8 shadow-sm h-[750px] flex flex-col">
                <h2 className="text-2xl font-bold text-[#4A342E] mb-6 flex items-center gap-2 shrink-0">
                  <span className="w-2 h-6 bg-[#8B4513] rounded-full inline-block"></span>
                  {selectedRegion ? `${selectedRegion} 지역 축제` : "전체 축제"}
                </h2>
                
                <div className="flex-1 overflow-y-auto pr-3 custom-scrollbar relative">
                  {/* (박현준 : 코드 변경) - 지도에서 지역을 클릭하면 이 영역이 스르륵 교체되도록 AnimatePresence 적용 */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selectedRegion || "all"} // key가 바뀌어야 애니메이션이 발동됨
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="space-y-5"
                    >
                      {filteredFestivals.length > 0 ? (
                        filteredFestivals.map((festival) => (
                          <FestivalCard key={festival.id} festival={festival} variant="compact" />
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
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}