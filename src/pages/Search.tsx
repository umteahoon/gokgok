import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search as SearchIcon } from "lucide-react"; // lucide-react에서 돋보기 아이콘 가져오기
import { mockFestivals, topFestivals } from "@/lib/index";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/motion";
import { FestivalCard } from "@/components/FestivalCard";
// (박현준 : 코드 변경) - 인터랙티브한 KoreaMap 컴포넌트를 불러옵니다.
import { KoreaMap } from "@/components/KoreaMap"; 

export default function Search() {
  
  const [activeTab, setActiveTab] = useState<"list" | "map">("list");
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  // 🌟 Community.tsx와 동일하게 검색어 상태 관리
  const [searchTerm, setSearchTerm] = useState<string>("");

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

  // 🌟 Community.tsx 처럼 실시간으로 필터링하는 로직!
  const filteredFestivals = [...topFestivals, ...mockFestivals].filter((festival) => {
    // 검색어를 소문자로 변환 (대소문자 무시)
    const keyword = searchTerm.trim().toLowerCase();

    // 1. 키워드 검색 (제목, 지역, 키워드, 설명 포함)
    const matchesSearch = keyword
      ? (
          (festival.title || "").toLowerCase().includes(keyword) ||
          (festival.location || "").toLowerCase().includes(keyword) ||
          (festival as any).keywords?.some((kw: string) => (kw || "").toLowerCase().includes(keyword)) ||
          (festival as any).description?.toLowerCase().includes(keyword)
        )
      : true;

    // 2. 지도 지역 클릭 검색
    const matchesRegion = currentKoreanRegion
      ? regionMap[currentKoreanRegion]?.some((loc) => (festival.location || "").includes(loc))
      : true;

    // 둘 다 만족해야 화면에 보임
    return matchesSearch && matchesRegion;
  });

  const handleRegionSelect = (regionId: string) => {
    setSelectedRegion(regionId === selectedRegion ? "" : regionId);
  };

  // 🌟 Community.tsx와 동일한 실시간 onChange 핸들러
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-[#FDFBF7] py-12"
    >
      <div className="container mx-auto px-4">
        
        {/* 상단 검색 영역 */}
        <div className="mb-16 flex flex-col items-center">
          <h1 className="text-4xl md:text-5xl font-bold text-[#4A342E] mb-8 text-center" 
              style={{ fontFamily: 'GmarketSansBold' }}>
            전국 방방곡곡 축제 찾기
          </h1>
          
          {/* 🌟 Community.tsx 스타일의 실시간 검색창을 직접 내장합니다! */}
          <div className="w-full max-w-3xl relative">
            <div className="flex items-center w-full bg-white p-2 rounded-full border border-[#EAE5E1] shadow-lg focus-within:ring-2 focus-within:ring-[#8B4513]">
              <div className="pl-4 pr-2 text-gray-400">
                <SearchIcon size={20} />
              </div>
              <input
                type="text"
                placeholder="축제 이름, 지역, 키워드 검색..."
                value={searchTerm} // 상태 연결
                onChange={handleSearchChange} // 글자 칠 때마다 실시간 업데이트!
                className="flex-1 py-3 px-2 text-gray-700 bg-transparent outline-none text-lg"
              />
            </div>
          </div>
        </div>

        {/* 뷰 모드 토글 스위치 */}
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
            /* 🌟 key 값에 searchTerm을 추가하여 검색어가 바뀔 때마다 리스트를 완전히 새로 그림! */
            <motion.div
              key={`list-${searchTerm}`} 
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: 20 }}
              className="bg-white border border-[#EAE5E1] rounded-3xl p-6 md:p-8 shadow-sm"
            >
              {/* 이동교(코드추가) 스크롤 기능 - 스크롤 영역을 박스 안으로 넣었습니다 */}
              <div className="h-[700px] overflow-y-auto pr-4 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
                  {filteredFestivals.length > 0 ? (
                    filteredFestivals.map((festival) => (
                      <motion.div 
                        // 🌟 key 값을 더 확실하게 고유하게 만듦
                        key={`festival-${festival.id}-${searchTerm}`} 
                        variants={staggerItem}
                        // 카드가 추가되는 듯한 어색함을 줄이기 위해 layout 속성 부여
                        layout 
                      >
                        <FestivalCard festival={festival} />
                      </motion.div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-24 bg-[#FDFBF7] rounded-2xl border border-dashed border-[#D1D5DB]">
                      <p className="text-[#9CA3AF] text-xl font-medium">
                        {searchTerm 
                          ? `"${searchTerm}"에 대한 검색 결과가 없습니다.` 
                          : "찾으시는 축제 결과가 없습니다. 다시 검색해 보세요!"}
                      </p>
                    </div>
                  )}
                </div>
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
                
                {/* (박현준 : 코드 변경) - 선택 기능이 담긴 KoreaMap 컴포넌트를 배치 */}
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
                  {/* (박현준 : 코드 변경) - 우측 텍스트는 한국어로 번역된 값을 띄워줌 */}
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
                          <p className="text-[#9CA3AF]">
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}