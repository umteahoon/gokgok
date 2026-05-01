import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ChevronLeft, Share2, Heart, Star, 
  MapPin, Calendar, Clock, Users, 
  Info, AlertCircle, Ticket
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { mockFestivals, topFestivals } from "@/lib/index";

export default function FestivalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // 데이터 찾아오기 (전체 데이터 중 ID 일치하는 항목)
  const allFestivals = [...topFestivals, ...mockFestivals];
  const festival = allFestivals.find((f) => String(f.id) === id);

  if (!festival) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg font-medium">정보를 찾을 수 없습니다.</p>
      </div>
    );
  }

  const menuTabs = ["공지사항", "캐스팅", "상품상세", "가격", "할인정보", "이용안내", "취소 및 환불규정", "장소", "리뷰"];

  return (
    <div className="min-h-screen bg-white pb-24 font-sans">
      {/* 1. 상단 포스터 영역 */}
      <section className="relative w-full aspect-[4/3] md:aspect-[16/7] overflow-hidden bg-gray-900">
        {/* 배경 블러 처리 */}
        <div 
          className="absolute inset-0 bg-cover bg-center blur-2xl opacity-50 scale-110"
          style={{ backgroundImage: `url(${festival.image})` }}
        />
        {/* 메인 포스터 이미지 */}
        <div className="relative h-full flex items-center justify-center p-6">
          <motion.img 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            src={festival.image} 
            alt={festival.title}
            className="h-full object-contain rounded-lg shadow-2xl"
          />
          {/* 페이지 카운터 */}
          <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-2 py-1 rounded">
            1 / 1
          </div>
        </div>
        {/* 뒤로가기 버튼 */}
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 p-2 bg-black/20 backdrop-blur-md rounded-full text-white hover:bg-black/40 transition-all"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      </section>

      {/* 2. 타이틀 및 기본 정보 */}
      <main className="container mx-auto px-4 mt-6 max-w-4xl">
        <div className="flex justify-between items-start mb-2">
          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-1 group cursor-pointer">
            {festival.category} 〈{festival.title}〉
            <ChevronLeft className="w-5 h-5 rotate-180 text-gray-400 group-hover:text-black" />
          </h1>
          <div className="flex gap-4">
            <button className="text-gray-900"><Share2 className="w-6 h-6" /></button>
            <button className="text-gray-900"><Heart className="w-6 h-6" /></button>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-8">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="font-bold text-sm">4.3</span>
          <button className="text-sm text-gray-500 underline underline-offset-4">리뷰 7개</button>
        </div>

        {/* 3. 수평 스크롤 메뉴 탭 */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-8 border-b border-gray-100 pb-2">
          {menuTabs.map((tab, idx) => (
            <button 
              key={idx}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border ${
                tab === "상품상세" ? "bg-white border-gray-200 text-black" : "bg-gray-50 border-transparent text-gray-400"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* 4. 필수 정보 리스트 */}
        <div className="space-y-4 text-sm mb-10">
          <div className="flex gap-4">
            <span className="text-gray-400 w-12 shrink-0">장소</span>
            <button className="font-medium flex items-center gap-1">
              {festival.location} <ChevronLeft className="w-4 h-4 rotate-180 text-gray-400" />
            </button>
          </div>
          <div className="flex gap-4">
            <span className="text-gray-400 w-12 shrink-0">기간</span>
            <span className="font-medium">{festival.date}</span>
          </div>
          <div className="flex gap-4">
            <span className="text-gray-400 w-12 shrink-0">시간</span>
            <span className="font-medium">90분</span>
          </div>
          <div className="flex gap-4">
            <span className="text-gray-400 w-12 shrink-0">연령</span>
            <span className="font-medium">14세 이상 관람가</span>
          </div>
        </div>

        {/* 5. 아이콘 배지 영역 */}
        <div className="grid grid-cols-3 gap-2 py-6 border-y border-gray-50 mb-10">
          <div className="flex items-center justify-center gap-2 text-xs font-bold">
            <Ticket className="w-5 h-5 text-gray-900" /> 뮤지컬 주간 20위
          </div>
          <div className="flex items-center justify-center gap-2 text-xs font-bold">
            <Clock className="w-5 h-5 text-orange-400" /> 예매대기 <Info className="w-3 h-3 text-gray-300" />
          </div>
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-green-600">
            <Users className="w-5 h-5" /> 청년문화패스
          </div>
        </div>

        {/* 6. 필수 확인 사항 섹션 */}
        <section className="mt-10">
          <h2 className="text-lg font-bold mb-6">필수 확인 사항</h2>
          <div className="space-y-8 text-[13.5px] leading-relaxed text-gray-800">
            <div>
              <p className="text-blue-600 font-bold mb-2">◈ 예매자는 본 안내 페이지의 모든 내용을 숙지 및 동의한 것으로 간주합니다.</p>
              <p>관람 연령/티켓 수령(할인권종 선택 포함)/공연 관람 안내 미숙지로 인한 책임은 관람자 본인에게 있으며, 예매 티켓의 취소/변경/환불은 불가하오니 각별히 유의하시기 바랍니다.</p>
            </div>
            <div>
              <p className="text-blue-600 font-bold mb-2">◈ 14세 이상 관람가 (2013년 포함 이전 출생자)</p>
              <p>- 관람 연령 기준은 생년월일을 기준으로 하며, 내외국 학교 재학 여부와 무관합니다.</p>
              <p>- 청소년의 경우 티켓 수령 및 객석 입장 시 연령 확인을 위해 생년월일이 기재된 증빙서류(청소년증, 학생증, 여권 등) 확인을 할 수 있으며, 연령 확인 후에 입장이 가능하오니 반드시 지참하시기 바랍니다. (육안으로 나이 확인 불가)</p>
            </div>
          </div>
        </section>
      </main>

      {/* 하단 플로팅 예약 버튼 (옵션) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 md:hidden">
        <Button className="w-full h-12 bg-primary text-white text-base font-bold rounded-xl">
          예매하기
        </Button>
      </div>
    </div>
  );
}