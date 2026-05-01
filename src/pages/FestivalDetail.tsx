import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ChevronLeft, Share2, Heart, Star, 
  Users, Info, Clock, Ticket
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { mockFestivals, topFestivals } from "@/lib/index";

export default function FestivalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const allData = [...topFestivals, ...mockFestivals];
  const festival = allData.find((f) => String(f.id) === id);

  if (!festival) {
    return (
      <div className="min-h-screen flex items-center justify-center font-sans">
        <p className="text-gray-500 text-lg font-medium">정보를 찾을 수 없습니다.</p>
      </div>
    );
  }

  const menuTabs = ["공지사항", "상품상세","이용안내", "장소", "리뷰"];

  return (
    <div className="min-h-screen bg-white pb-24 font-sans">
      {/* 1. 상단 포스터 영역 (높이 축소 및 최적화) */}
      <section className="relative w-full h-[300px] md:h-[400px] overflow-hidden bg-zinc-900">
        {/* 배경 블러 처리 */}
        <div 
          className="absolute inset-0 bg-cover bg-center blur-3xl opacity-40 scale-110"
          style={{ backgroundImage: `url(${festival.image})` }}
        />
        
        {/* 메인 포스터 이미지 (사이즈 최적화) */}
        <div className="relative h-full flex items-center justify-center p-4">
          <motion.img 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            src={festival.image} 
            alt={festival.title}
            className="h-[85%] w-auto object-contain rounded-md shadow-2xl"
          />
          <div className="absolute bottom-3 right-4 bg-black/50 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded">
            1 / 1
          </div>
        </div>

        {/* 뒤로가기 버튼 */}
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 p-2 bg-black/10 backdrop-blur-md rounded-full text-white hover:bg-black/30 transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </section>

      {/* 2. 타이틀 및 상세 정보 */}
      <main className="container mx-auto px-5 mt-6 max-w-4xl">
        <div className="flex justify-between items-start mb-2">
          <h1 className="text-xl md:text-2xl font-bold leading-tight">
            {festival.category} 〈{festival.title}〉
          </h1>
          <div className="flex gap-4 pt-1">
            <button className="text-zinc-800"><Share2 className="w-5 h-5" /></button>
            <button className="text-zinc-800"><Heart className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="flex items-center gap-1.5 mb-6">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="font-bold text-sm">4.3</span>
          <button className="text-xs text-zinc-400 underline underline-offset-4 ml-1">리뷰 7개</button>
        </div>

        {/* 3. 메뉴 탭 */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-8 border-b border-zinc-100 pb-3">
          {menuTabs.map((tab, idx) => (
            <button 
              key={idx}
              className={`px-4 py-1.5 rounded-full text-[13px] font-medium whitespace-nowrap border transition-all ${
                tab === "상품상세" 
                ? "bg-zinc-900 border-zinc-900 text-white" 
                : "bg-zinc-50 border-transparent text-zinc-400 hover:bg-zinc-100"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* 4. 정보 리스트 */}
        <div className="space-y-3.5 text-sm mb-10">
          <div className="flex gap-4">
            <span className="text-zinc-400 w-12 shrink-0">장소</span>
            <span className="font-medium">{festival.location}</span>
          </div>
          <div className="flex gap-4">
            <span className="text-zinc-400 w-12 shrink-0">기간</span>
            <span className="font-medium">{festival.date}</span>
          </div>
          <div className="flex gap-4">
            <span className="text-zinc-400 w-12 shrink-0">연령</span>
            <span className="font-medium">14세 이상 관람가</span>
          </div>
        </div>

        {/* 5. 배지 섹션 */}
        <div className="grid grid-cols-3 gap-2 py-5 border-y border-zinc-100 mb-10">
          <div className="flex flex-col items-center justify-center gap-1">
            <Ticket className="w-5 h-5 text-zinc-800" />
            <span className="text-[10px] font-bold text-zinc-500 text-center">축제 월간 3위</span>
          </div>
          <div className="flex flex-col items-center justify-center gap-1">
            <Clock className="w-5 h-5 text-orange-500" />
            <span className="text-[10px] font-bold text-zinc-500 text-center flex items-center gap-0.5">
              대기 <Info className="w-2.5 h-2.5 text-zinc-300" />
            </span>
          </div>
          <div className="flex flex-col items-center justify-center gap-1">
            <Users className="w-5 h-5 text-emerald-600" />
            <span className="text-[10px] font-bold text-emerald-600 text-center">청년,가족</span>
          </div>
        </div>

        {/* 6. 필수 확인 사항 */}
        <section className="mt-8">
          <h2 className="text-lg font-bold mb-5">필수 확인 사항</h2>
          <div className="space-y-6 text-[13px] leading-relaxed text-zinc-600">
            <div className="bg-zinc-50 p-4 rounded-xl">
              <p className="text-blue-600 font-bold mb-2">◈ 축제 시 필독 안내</p>
              <p>본 페이지의 모든 내용을 숙지 및 동의한 것으로 간주합니다. 관람 안내 미숙지로 인한 책임은 본인에게 있으며, 취소 및 변경 규정을 반드시 확인 바랍니다.</p>
            </div>
            <div className="px-1">
              <p className="text-blue-600 font-bold mb-2">◈ 전체 이용가</p>
              <p>- 2013년 포함 이전 출생자 관람 가능합니다.</p>
              <p>- 입장 시 생년월일 확인이 가능한 증빙서류(학생증, 청소년증 등)를 반드시 지참하시기 바랍니다.</p>
            </div>
          </div>
        </section>
      </main>

      
    </div>
  );
}