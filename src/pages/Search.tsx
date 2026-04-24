import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";
import { mockFestivals, topFestivals } from "@/lib/index";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";
import { FestivalCard } from "@/components/FestivalCard";
import { KoreaMap } from "@/components/KoreaMap"; 
import { SearchBar } from "@/components/SearchBar";

export default function Search() {  
  
  const [activeTab, setActiveTab] = useState<"list" | "map">("list");
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // 🔥 찜 상태
  const [liked, setLiked] = useState<string[]>([]);

  const toggleLike = (id: string) => {
    setLiked((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  };

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
      className="min-h-screen bg-[#FDFBF7] dark:bg-[#121212] py-12"
    >
      <div className="container mx-auto px-4">
        
        {/* 타이틀 */}
        <div className="mb-16 flex flex-col items-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-8">
            전국 방방곡곡 축제 찾기
          </h1>
          <div className="w-full max-w-3xl">
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>

        {/* 탭 */}
        <div className="mb-8 flex justify-end">
          <div className="flex rounded-full p-1">
            <button onClick={() => setActiveTab("list")} className="w-[100px] py-2">
              목록보기
            </button>
            <button onClick={() => setActiveTab("map")} className="w-[100px] py-2">
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
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                
                {filteredFestivals.map((festival) => (
                  <motion.div key={festival.id} variants={staggerItem}>
                    
                    {/* 🔥 카드 + 하트 */}
                    <div className="relative">
                      <FestivalCard festival={festival} />

                      {/* 🔥 하트 (배경 없음) */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(String(festival.id));
                        }}
                        className="absolute top-3 right-3"
                      >
                        <Heart
                          className={`w-6 h-6 ${
                            liked.includes(String(festival.id))
                              ? "fill-red-500 text-red-500"
                              : "text-white"
                          }`}
                        />
                      </button>
                    </div>

                  </motion.div>
                ))}

              </div>
            </motion.div>
          ) : (
            <motion.div key="map">
              <KoreaMap 
                selectedRegion={selectedRegion} 
                onRegionSelect={handleRegionSelect} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}