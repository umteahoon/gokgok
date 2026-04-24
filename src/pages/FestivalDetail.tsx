import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, MapPin, Share2 } from "lucide-react";
import { mockFestivals, topFestivals } from "@/lib/index";
import { fadeInUp } from "@/lib/motion";

export default function FestivalDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const allFestivals = [...topFestivals, ...mockFestivals];
  const festival = allFestivals.find((f) => String(f.id) === String(id));

  if (!festival)
    return <div className="p-20 text-center">정보를 찾을 수 없습니다.</div>;

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#121212] transition-colors duration-300">
      
      {/* 🔥 상단 이미지 */}
      <section className="relative h-[60vh] w-full overflow-hidden">
        <img
          src={festival.image}
          alt={festival.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* 상단 버튼 */}
        <div className="absolute top-8 left-4 md:left-12 right-4 md:right-12 flex justify-between items-center z-10">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

          <button className="p-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20">
            <Share2 className="w-6 h-6" />
          </button>
        </div>

        {/* 제목 */}
        <div className="absolute bottom-12 left-4 md:left-12">
          <span className="px-3 py-1 bg-[#D4AF37] text-white text-xs font-bold rounded mb-4 inline-block">
            {festival.category}
          </span>

          <h1 className="text-4xl md:text-6xl font-black text-white">
            {festival.title}
          </h1>
        </div>
      </section>

      {/* 🔥 상세 내용 */}
      <section className="container mx-auto px-4 md:px-12 -mt-10 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* 설명 */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="lg:col-span-8 bg-white/80 dark:bg-[#1A1A1A]/80 backdrop-blur-xl p-8 md:p-12 rounded-[2.5rem] border border-black/5 shadow-xl"
        >
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-[#8B4513] rounded-full"></span>
            상세 설명
          </h3>

          <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-8">
            {festival.description || "상세 설명이 곧 업데이트될 예정입니다."}
          </p>

          {/* 이미지 */}
          <div className="grid grid-cols-2 gap-4">
            <img
              src={festival.image}
              className="h-48 w-full object-cover rounded-2xl opacity-60"
            />
            <img
              src={festival.image}
              className="h-48 w-full object-cover rounded-2xl opacity-60"
            />
          </div>
        </motion.div>

        {/* 정보 */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#F8F6F4] dark:bg-[#1A1A1A] p-8 rounded-[2.5rem] border border-black/5 shadow-md">
            <h4 className="text-sm font-bold text-[#8B4513] mb-6 uppercase tracking-wider">
              Information
            </h4>

            <ul className="space-y-6">
              <li className="flex gap-4 items-center">
                <MapPin className="text-[#8B4513]" />
                <div>
                  <p className="text-xs text-gray-400">장소</p>
                  <p className="font-bold">{festival.location}</p>
                </div>
              </li>

              <li className="flex gap-4 items-center">
                <Calendar className="text-[#8B4513]" />
                <div>
                  <p className="text-xs text-gray-400">기간</p>
                  <p className="font-bold">{festival.date}</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}