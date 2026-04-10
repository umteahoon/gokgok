// (이동교 : 페이지 추가 => 특정 축제의 상세 정보를 보여주는 독립 페이지)
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, MapPin, Tag, Share2 } from "lucide-react";
import { mockFestivals, topFestivals } from "@/lib/index";
import { fadeInUp, staggerContainer } from "@/lib/motion";

export default function FestivalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // 모든 축제 데이터 합치기
  const allFestivals = [...topFestivals, ...mockFestivals];
  
  // 현재 id와 일치하는 축제 정보 찾기
  const festival = allFestivals.find((f) => f.id === id);

  // 축제 정보가 없을 경우의 처리
  if (!festival) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFBF7] dark:bg-[#121212]">
        <p className="text-xl font-bold mb-4">축제 정보를 찾을 수 없습니다.</p>
        <button 
          onClick={() => navigate(-1)}
          className="px-6 py-2 bg-[#8B4513] text-white rounded-full font-bold shadow-lg hover:scale-105 transition-transform"
        >
          뒤로가기
        </button>
      </div>
    );
  }

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="min-h-screen bg-[#FDFBF7] dark:bg-[#121212] transition-colors duration-300 pb-20"
    >
      {/* 1. 히어로 섹션: 이미지와 타이틀 */}
      <section className="relative h-[60vh] w-full overflow-hidden">
        {/* 배경 이미지 */}
        <motion.img 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5 }}
          src={festival.image} 
          alt={festival.title} 
          className="w-full h-full object-cover" 
        />
        
        {/* 이미지 위 어두운 그라데이션 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* 상단 네비게이션 버튼들 */}
        <div className="absolute top-8 left-4 md:left-12 right-4 md:right-12 flex justify-between items-center z-10">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white font-bold hover:bg-white/20 transition-all"
          >
            <ArrowLeft className="w-5 h-5" /> 목록으로
          </button>
          <button className="p-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white hover:bg-white/20 transition-all">
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        {/* 타이틀 영역 */}
        <div className="absolute bottom-12 left-4 md:left-12 right-4 md:right-12">
          <motion.div variants={fadeInUp}>
            <span className="inline-block px-3 py-1 bg-[#D4AF37] text-white text-xs font-bold rounded-md mb-4 uppercase tracking-widest">
              {festival.category}
            </span>
            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight" style={{ fontFamily: 'GmarketSansBold' }}>
              {festival.title}
            </h1>
          </motion.div>
        </div>
      </section>

      {/* 2. 콘텐츠 영역 */}
      <section className="container mx-auto px-4 md:px-12 -mt-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* 왼쪽: 주요 정보 카드 (Glassmorphism 적용) */}
          <motion.div 
            variants={fadeInUp}
            className="lg:col-span-8 bg-white/80 dark:bg-[#1A1A1A]/80 backdrop-blur-xl p-8 md:p-12 rounded-[2.5rem] border border-black/5 dark:border-white/5 shadow-xl"
          >
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-[#8B4513] rounded-full inline-block"></span>
                  상세 설명
                </h3>
                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed break-keep">
                  {festival.description || "해당 축제의 상세 설명이 곧 업데이트될 예정입니다. 잠시만 기다려 주세요!"}
                </p>
              </div>

              {/* 추가 이미지나 갤러리가 있다면 여기에 배치 */}
              <div className="grid grid-cols-2 gap-4">
                 <div className="h-48 bg-black/5 rounded-2xl overflow-hidden">
                    <img src={festival.image} className="w-full h-full object-cover opacity-50 grayscale hover:grayscale-0 transition-all duration-500" />
                 </div>
                 <div className="h-48 bg-black/5 rounded-2xl overflow-hidden">
                    <img src={festival.image} className="w-full h-full object-cover opacity-50 grayscale hover:grayscale-0 transition-all duration-500" />
                 </div>
              </div>
            </div>
          </motion.div>

          {/* 오른쪽: 요약 정보 바 */}
          <motion.div 
            variants={fadeInUp}
            className="lg:col-span-4 space-y-6"
          >
            {/* 핵심 정보 박스 */}
            <div className="bg-[#F8F6F4] dark:bg-[#1A1A1A] p-8 rounded-[2rem] border border-black/5 dark:border-white/5">
              <h4 className="text-sm font-bold text-[#8B4513] mb-6 uppercase tracking-wider">Information</h4>
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <div className="p-3 bg-white dark:bg-[#2A2A2A] rounded-xl shadow-sm">
                    <MapPin className="w-5 h-5 text-[#8B4513]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">장소</p>
                    <p className="font-bold text-gray-800 dark:text-gray-200">{festival.location}</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="p-3 bg-white dark:bg-[#2A2A2A] rounded-xl shadow-sm">
                    <Calendar className="w-5 h-5 text-[#8B4513]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">기간</p>
                    <p className="font-bold text-gray-800 dark:text-gray-200">{festival.date}</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="p-3 bg-white dark:bg-[#2A2A2A] rounded-xl shadow-sm">
                    <Tag className="w-5 h-5 text-[#8B4513]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">카테고리</p>
                    <p className="font-bold text-gray-800 dark:text-gray-200">{festival.category}</p>
                  </div>
                </li>
              </ul>

              {/* 예매하기 버튼 (곡곡 서비스의 핵심 기능 느낌) */}
              <button className="w-full mt-10 py-4 bg-[#2A2A2A] dark:bg-[#EAEAEA] text-white dark:text-black font-bold rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-lg">
                티켓 예매하기
              </button>
            </div>

            {/* 안내 문구 */}
            <div className="p-6 border border-dashed border-gray-300 dark:border-gray-700 rounded-2xl">
              <p className="text-xs text-gray-500 leading-relaxed">
                * 축제 일정은 주최측 사정에 따라 변경될 수 있습니다. 방문 전 반드시 공식 홈페이지를 확인해 주세요.
              </p>
            </div>
          </motion.div>

        </div>
      </section>
    </motion.div>
  );
}