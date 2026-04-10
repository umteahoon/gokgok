import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Minus, Plus, Calendar, MapPin, Share2, X } from "lucide-react";
import { mockFestivals, topFestivals } from "@/lib/index";
import { fadeInUp, staggerContainer } from "@/lib/motion";

// 1. 티켓 타입 정의
type TicketType = 'adult' | 'youth' | 'night';

export default function FestivalDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // 2. 상태 관리
  const [isBookingMode, setIsBookingMode] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<TicketType>("adult");
  const [counts, setCounts] = useState<Record<TicketType, number>>({ 
    adult: 0, youth: 0, night: 0 
  });

  const allFestivals = [...topFestivals, ...mockFestivals];
  const festival = allFestivals.find((f) => String(f.id) === String(id));

  if (!festival) return <div className="p-20 text-center">정보를 찾을 수 없습니다.</div>;

  // 가격 데이터
  const prices: Record<TicketType, number> = { adult: 25000, youth: 15000, night: 10000 };

  // 3. 총액 계산 로직
  const totalPrice = (Object.keys(counts) as TicketType[]).reduce((acc, type) => 
    acc + (counts[type] * prices[type]), 0
  );

  const handleCount = (type: TicketType, delta: number) => {
    // 선택된 티켓일 때만 수량 조절 가능하게 방어 로직 추가
    if (selectedTicket !== type) return;
    setCounts(prev => ({ ...prev, [type]: Math.max(0, prev[type] + delta) }));
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#121212] transition-colors duration-300">
      <AnimatePresence mode="wait">
        
        {!isBookingMode ? (
          /* ======================================================= */
          /* VIEW 1: 축제 상세 정보 모드 */
          /* ======================================================= */
          <motion.div 
            key="detail"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="pb-20"
          >
            <section className="relative h-[60vh] w-full overflow-hidden">
              <img src={festival.image} alt={festival.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              <div className="absolute top-8 left-4 md:left-12 right-4 md:right-12 flex justify-between items-center z-10">
                <button onClick={() => navigate(-1)} className="p-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all">
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <button className="p-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all">
                  <Share2 className="w-6 h-6" />
                </button>
              </div>

              <div className="absolute bottom-12 left-4 md:left-12">
                <span className="px-3 py-1 bg-[#D4AF37] text-white text-xs font-bold rounded mb-4 inline-block uppercase tracking-widest">
                  {festival.category}
                </span>
                <h1 className="text-4xl md:text-6xl font-black text-white" style={{ fontFamily: 'GmarketSansBold' }}>
                  {festival.title}
                </h1>
              </div>
            </section>

            <section className="container mx-auto px-4 md:px-12 -mt-10 relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
              <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="lg:col-span-8 bg-white/80 dark:bg-[#1A1A1A]/80 backdrop-blur-xl p-8 md:p-12 rounded-[2.5rem] border border-black/5 shadow-xl">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-2 text-foreground">
                  <span className="w-1.5 h-6 bg-[#8B4513] rounded-full"></span>상세 설명
                </h3>
                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-8 break-keep">
                  {festival.description || "상세 설명이 곧 업데이트될 예정입니다."}
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <img src={festival.image} className="h-48 w-full object-cover rounded-2xl opacity-60" alt="gallery1" />
                  <img src={festival.image} className="h-48 w-full object-cover rounded-2xl opacity-60" alt="gallery2" />
                </div>
              </motion.div>

              <div className="lg:col-span-4 space-y-6">
                <div className="bg-[#F8F6F4] dark:bg-[#1A1A1A] p-8 rounded-[2.5rem] border border-black/5 shadow-md">
                  <h4 className="text-sm font-bold text-[#8B4513] mb-6 uppercase tracking-wider">Information</h4>
                  <ul className="space-y-6 mb-10">
                    <li className="flex gap-4 items-center">
                      <MapPin className="text-[#8B4513]" /> 
                      <div><p className="text-xs text-gray-400">장소</p><p className="font-bold text-foreground">{festival.location}</p></div>
                    </li>
                    <li className="flex gap-4 items-center">
                      <Calendar className="text-[#8B4513]" /> 
                      <div><p className="text-xs text-gray-400">기간</p><p className="font-bold text-foreground">{festival.date}</p></div>
                    </li>
                  </ul>
                  <button 
                    onClick={() => setIsBookingMode(true)}
                    className="w-full py-4 bg-[#2A2A2A] dark:bg-white text-white dark:text-black font-bold rounded-2xl hover:scale-105 transition-all shadow-lg"
                  >
                    티켓 예매하기
                  </button>
                </div>
              </div>
            </section>
          </motion.div>
        ) : (
          /* ======================================================= */
          /* VIEW 2: 티켓 예매 전용 모드 */
          /* ======================================================= */
          <motion.div 
            key="booking"
            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
            className="container mx-auto px-4 py-12 max-w-6xl"
          >
            <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-4">
                <button onClick={() => setIsBookingMode(false)} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-8 h-8 text-foreground" />
                </button>
                <h2 className="text-3xl font-black text-foreground" style={{ fontFamily: 'GmarketSansBold' }}>티켓 예매</h2>
              </div>
              <p className="text-gray-400 font-medium">{festival.title}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-8 space-y-4">
                {(['adult', 'youth', 'night'] as const).map((type) => {
                  const labels = { adult: "성인 종일권", youth: "청소년 종일권", night: "야간권" };
                  const isSelected = selectedTicket === type; // 현재 선택된 티켓인지 확인

                  return (
                    <div 
                      key={type}
                      onClick={() => setSelectedTicket(type)}
                      className={`flex items-center justify-between p-6 rounded-3xl border-2 transition-all cursor-pointer ${
                        isSelected 
                          ? "border-[#1A1A1A] dark:border-white bg-white dark:bg-[#2A2A2A] shadow-xl scale-[1.02]" 
                          : "border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5 opacity-50"
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? "border-[#1A1A1A] dark:border-white" : "border-gray-300"}`}>
                          {isSelected && <div className="w-3 h-3 bg-[#1A1A1A] dark:bg-white rounded-full" />}
                        </div>
                        <div>
                          <p className={`font-bold text-xl ${isSelected ? "text-foreground" : "text-gray-400"}`}>{labels[type]}</p>
                          <p className="text-gray-500">{prices[type].toLocaleString()}원</p>
                        </div>
                      </div>

                      {/* 수량 조절 버튼 영역 */}
                      <div 
                        className={`flex items-center gap-4 border rounded-xl p-2 transition-colors ${
                          isSelected 
                            ? "bg-white dark:bg-[#1A1A1A] border-gray-100 dark:border-white/10" 
                            : "bg-gray-100/50 dark:bg-black/20 border-transparent opacity-30 cursor-not-allowed"
                        }`}
                        onClick={e => e.stopPropagation()} // 수량 버튼 클릭 시 부모 클릭(선택) 방지
                      >
                        <button 
                          onClick={() => handleCount(type, -1)} 
                          disabled={!isSelected}
                          className={`p-1 rounded transition-colors ${isSelected ? "hover:bg-gray-100 dark:hover:bg-white/10 text-foreground" : "text-gray-300"}`}
                        >
                          <Minus className="w-5 h-5" />
                        </button>
                        <span className={`w-8 text-center font-bold text-xl ${isSelected ? "text-foreground" : "text-gray-300"}`}>
                          {counts[type]}
                        </span>
                        <button 
                          onClick={() => handleCount(type, 1)} 
                          disabled={!isSelected}
                          className={`p-1 rounded transition-colors ${isSelected ? "hover:bg-gray-100 dark:hover:bg-white/10 text-foreground" : "text-foreground/20"}`}
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="lg:col-span-4">
                <div className="bg-white dark:bg-[#1A1A1A] p-8 rounded-[2.5rem] border border-black/5 shadow-2xl sticky top-10 transition-colors">
                  <h3 className="text-xl font-bold mb-6 text-foreground">결제 요약</h3>
                  <div className="space-y-4 mb-10">
                    {(Object.keys(counts) as TicketType[]).map((type) => counts[type] > 0 && (
                      <div key={type} className="flex justify-between text-gray-500">
                        <span>{type === 'adult' ? '성인' : type === 'youth' ? '청소년' : '야간'} x {counts[type]}</span>
                        <span className="font-bold text-foreground">{(counts[type] * prices[type]).toLocaleString()}원</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-100 dark:border-white/10 pt-6 mb-10 flex justify-between items-end">
                    <span className="text-gray-400 font-bold">최종 결제 금액</span>
                    <span className="text-3xl font-black text-foreground">{totalPrice.toLocaleString()}원</span>
                  </div>
                  <button className="w-full py-5 bg-[#1A1A1A] dark:bg-white text-white dark:text-black font-bold rounded-2xl text-xl hover:scale-105 active:scale-95 transition-all shadow-lg">
                    예매 확정하기
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}