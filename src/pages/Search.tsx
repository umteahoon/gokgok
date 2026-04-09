import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { mockFestivals, topFestivals } from "@/lib/index";
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

  const englishToKoreanMap: Record<string, string> = {
    Seoul: "서울",
    Gyeonggi: "경기",
    Incheon: "인천",
    Gangwon: "강원",
    Chungbuk: "충북",
    Chungnam: "충남",
    Daejeon: "대전",
    Sejong: "세종",
    Jeonbuk: "전북",
    Jeonnam: "전남",
    Gwangju: "광주",
    Gyeongbuk: "경북",
    Gyeongnam: "경남",
    Daegu: "대구",
    Ulsan: "울산",
    Busan: "부산",
    Jeju: "제주",
  };

  const currentKoreanRegion = englishToKoreanMap[selectedRegion] || "";

  const filteredFestivals = [...topFestivals, ...mockFestivals].filter((festival) => {
    const matchesSearch = searchQuery
      ? festival.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        festival.location.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const matchesRegion = currentKoreanRegion
      ? regionMap[currentKoreanRegion]?.some((loc) => festival.location.includes(loc))
      : true;

    return matchesSearch && matchesRegion;
  });

  const handleRegionSelect = (regionId: string) => {
    setSelectedRegion(regionId === selectedRegion ? "" : regionId);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-[#FDFBF7] dark:bg-[#121212] py-12 transition-colors duration-300"
    >
      <div className="container mx-auto px-4">
        
        <div className="mb-16 flex flex-col items-center">
          <h1 className="text-4xl md:text-5xl font-bold text-[#4A342E] dark:text-[#EAE5E1] mb-8 text-center transition-colors" 
              style={{ fontFamily: 'GmarketSansBold' }}>
            전국 방방곡곡 축제 찾기
          </h1>
          <div className="w-full max-w-3xl">
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>

        <div className="mb-8 flex justify-end">
          <div className="relative flex items-center bg-[#F5F1EE] dark:bg-[#1E1E1E] rounded-full p-1 shadow-inner border border-[#EAE5E1] dark:border-[#333333] transition-colors">
            <motion.div
              className="absolute top-1 bottom-1 w-[100px] bg-white dark:bg-[#333333] rounded-full shadow-sm"
              initial={false}
              animate={{ left: activeTab === "list" ? 4 : 104 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
            <button
              onClick={() => setActiveTab("list")}
              className={`relative z-10 w-[100px] py-2 text-sm font-bold transition-colors rounded-full ${
                activeTab === "list" ? "text-[#8B4513] dark:text-[#D4A373]" : "text-[#9CA3AF] dark:text-[#666666] hover:text-[#6B5A55] dark:hover:text-[#AAAAAA]"
              }`}
            >
              목록보기
            </button>
            <button
              onClick={() => setActiveTab("map")}
              className={`relative z-10 w-[100px] py-2 text-sm font-bold transition-colors rounded-full ${
                activeTab === "map" ? "text-[#8B4513] dark:text-[#D4A373]" : "text-[#9CA3AF] dark:text-[#666666] hover:text-[#6B5A55] dark:hover:text-[#AAAAAA]"
              }`}
            >
              지도보기
            </button>
          </div>
        </div>  

        <AnimatePresence mode="wait">
          {activeTab === "list" ? (
            <motion.div
              key="list"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: 20 }}
              // 🔥 바깥쪽 배경색을 페이지 배경색(#FDFBF7 / #121212)과 동일하게 맞춰 일체감을 주었습니다.
              className="bg-[#FDFBF7] dark:bg-[#121212] p-4 rounded-[2.5rem] transition-colors duration-300"
            >
              {/* 실제 테두리가 있는 안쪽 영역 - 배경색을 통일하여 테두리 선만 돋보이게 했습니다. */}
              <div className="h-[750px] overflow-y-auto p-8 pr-4 custom-scrollbar border-2 border-[#888888] dark:border-[#555555] rounded-[1.5rem]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
                  {filteredFestivals.length > 0 ? (
                    filteredFestivals.map((festival) => (
                      <motion.div key={festival.id} variants={staggerItem}>
                        <FestivalCard festival={festival} />
                      </motion.div>
                    ))
                  ) : (
                    // 결과 없음 메시지 영역도 배경색 일치
                    <div className="col-span-full text-center py-24 bg-[#FDFBF7] dark:bg-[#121212] rounded-3xl border border-dashed border-[#D1D5DB] dark:border-[#444444] transition-colors">
                      <p className="text-[#9CA3AF] dark:text-[#888888] text-xl font-medium">
                        찾으시는 축제 결과가 없습니다. 다시 검색해 보세요!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ) 

          : (
            <motion.div
              key="map"
              variants={fadeInUp}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: 20 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start"
            >
              {/* 좌측 지도 섹션 */}
              <div className="lg:col-span-7 bg-[#FDFBF7] dark:bg-[#121212] rounded-[2.5rem] p-4 h-[750px] flex flex-col transition-colors">
                <div className="flex-1 flex flex-col border-2 border-[#888888] dark:border-[#555555] rounded-[1.5rem] p-8 overflow-hidden">
                  <div className="flex items-center justify-between mb-4 shrink-0">
                    <h2 className="text-2xl font-bold text-[#4A342E] dark:text-[#EAE5E1] transition-colors">지역별 탐색</h2>
                    <span className="text-sm text-[#8B4513] dark:text-[#D4A373] font-semibold bg-[#FDFBF7] dark:bg-[#2A2A2A] px-3 py-1 rounded-full transition-colors">
                      원하는 지역을 클릭해 보세요
                    </span>
                  </div>
                  
                  <div className="flex-1 flex justify-center items-center w-full bg-[#FDFBF7] dark:bg-[#121212] rounded-2xl p-4 overflow-hidden relative transition-colors">
                    <KoreaMap 
                      selectedRegion={selectedRegion} 
                      onRegionSelect={handleRegionSelect} 
                    />
                  </div>
                </div>
              </div>

              {/* 우측 리스트 섹션 */}
              <div className="lg:col-span-5 bg-[#FDFBF7] dark:bg-[#121212] rounded-[2.5rem] p-4 h-[750px] flex flex-col transition-colors">
                <div className="flex-1 flex flex-col border-2 border-[#888888] dark:border-[#555555] rounded-[1.5rem] p-8 overflow-hidden">
                  <h2 className="text-2xl font-bold text-[#4A342E] dark:text-[#EAE5E1] mb-6 flex items-center gap-2 shrink-0 transition-colors">
                    <span className="w-2 h-6 bg-[#8B4513] dark:bg-[#D4A373] rounded-full inline-block"></span>
                    {currentKoreanRegion ? `${currentKoreanRegion} 지역 축제` : "전체 축제"}
                  </h2>
                  
                  <div className="flex-1 overflow-y-auto pr-3 custom-scrollbar relative">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={selectedRegion || "all"} 
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
                            <p className="text-[#9CA3AF] dark:text-[#888888]">
                              {currentKoreanRegion
                                ? `${currentKoreanRegion} 지역에 등록된 축제가 없습니다.`
                                : "표시할 축제 정보가 없습니다."}
                            </p>
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}