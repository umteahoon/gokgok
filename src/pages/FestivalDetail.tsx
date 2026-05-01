import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ChevronLeft, Share2, Heart, Star, 
  Users, Info, Clock, Ticket, 
  Calendar, MapPin, Phone, Megaphone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast"; // 토스트 알림 훅
import { mockFestivals, topFestivals } from "@/lib/index";
import datePoster from "@/assets/date.png"; 

export default function FestivalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState("상품상세");
  const [isWishlisted, setIsWishlisted] = useState(false); // 찜하기 상태

  const allData = [...topFestivals, ...mockFestivals];
  const festival = allData.find((f) => String(f.id) === id);

  // --- 🔥 기능 1: 찜하기 로직 (localStorage 연동) ---
  useEffect(() => {
    const savedWishlist = JSON.parse(localStorage.getItem("gokgok_wishlist") || "[]");
    setIsWishlisted(savedWishlist.includes(id));
  }, [id]);

  const toggleWishlist = () => {
    const savedWishlist = JSON.parse(localStorage.getItem("gokgok_wishlist") || "[]");
    let updatedWishlist;

    if (isWishlisted) {
      updatedWishlist = savedWishlist.filter((itemId: string) => itemId !== id);
      toast({ title: "찜 취소", description: "관심 목록에서 제거되었습니다." });
    } else {
      updatedWishlist = [...savedWishlist, id];
      toast({ title: "찜 완료", description: "관심 목록에 추가되었습니다." });
    }

    localStorage.setItem("gokgok_wishlist", JSON.stringify(updatedWishlist));
    setIsWishlisted(!isWishlisted);
  };

  // --- 🔥 기능 2: 공유하기 로직 ---
  const handleShare = async () => {
    const shareData = {
      title: `곡곡 - ${festival?.title}`,
      text: `${festival?.location}에서 열리는 ${festival?.title} 정보를 확인해보세요!`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        // 모바일 기기 공유 기능
        await navigator.share(shareData);
      } else {
        // PC 브라우저 클립보드 복사 기능
        await navigator.clipboard.writeText(window.location.href);
        toast({ title: "링크 복사 완료", description: "공유할 수 있도록 주소가 복사되었습니다." });
      }
    } catch (err) {
      console.error("공유 실패:", err);
    }
  };

  if (!festival) {
    return (
      <div className="min-h-screen flex items-center justify-center font-sans">
        <p className="text-gray-500 text-lg font-medium">정보를 찾을 수 없습니다.</p>
      </div>
    );
  }

  const menuTabs = ["공지사항", "상품상세", "이용안내", "장소", "리뷰"];
  const notices = [
    { id: 1, title: "우천 시 행사 일정 변경 안내", date: "2026.04.15", content: "기상 악화로 인해 야외 공연 일정이 일부 조정될 수 있습니다.", image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=1000&auto=format&fit=crop" },
    { id: 2, title: "현장 주차장 만차 및 대중교통 이용 권장", date: "2026.04.10", content: "축제 기간 중 방문객 급증으로 현장 주차장이 매우 혼잡하오니 대중교통 이용을 권장합니다.", image: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?q=80&w=1000&auto=format&fit=crop" }
  ];
  const detailImages = [datePoster];

  return (
    <div className="min-h-screen bg-white pb-24 font-sans text-zinc-900">
      {/* 1. 상단 포스터 영역 */}
      <section className="relative w-full h-[300px] md:h-[400px] overflow-hidden bg-zinc-900">
        <div className="absolute inset-0 bg-cover bg-center blur-3xl opacity-40 scale-110" style={{ backgroundImage: `url(${festival.image})` }} />
        <div className="relative h-full flex items-center justify-center p-4">
          <motion.img initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} src={festival.image} alt={festival.title} className="h-[85%] w-auto object-contain rounded-md shadow-2xl" />
        </div>
        <button onClick={() => navigate(-1)} className="absolute top-4 left-4 p-2 bg-black/10 backdrop-blur-md rounded-full text-white hover:bg-black/30 transition-all">
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
            {/* 🔥 공유 버튼 */}
            <button onClick={handleShare} className="text-zinc-800 active:scale-90 transition-transform">
              <Share2 className="w-5 h-5" />
            </button>
            {/* 🔥 찜하기 버튼 */}
            <button onClick={toggleWishlist} className="text-zinc-800 active:scale-90 transition-transform">
              <Heart className={`w-5 h-5 ${isWishlisted ? "fill-[#FF3478] text-[#FF3478]" : ""}`} />
            </button>
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
            <button key={idx} onClick={() => setActiveTab(tab)} className={`px-4 py-1.5 rounded-full text-[13px] font-medium whitespace-nowrap border transition-all ${activeTab === tab ? "bg-zinc-900 border-zinc-900 text-white" : "bg-zinc-50 border-transparent text-zinc-400 hover:bg-zinc-100"}`}>
              {tab}
            </button>
          ))}
        </div>

        {/* --- 탭별 조건부 렌더링 --- */}
        {activeTab === "공지사항" ? (
          <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
            {notices.map((notice) => (
              <div key={notice.id} className="border-b border-zinc-100 pb-10 last:border-0">
                <div className="flex items-center gap-2 mb-3">
                  <Megaphone className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs text-zinc-400">{notice.date}</span>
                </div>
                <h3 className="font-bold text-lg mb-4">{notice.title}</h3>
                <div className="rounded-2xl overflow-hidden mb-5 shadow-sm border border-zinc-100"><img src={notice.image} alt="공지" className="w-full h-auto object-cover" /></div>
                <p className="text-sm text-zinc-600 leading-relaxed">{notice.content}</p>
              </div>
            ))}
          </motion.section>
        ) : activeTab === "상품상세" ? (
          <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex flex-col gap-0 -mx-5 md:-mx-0"> 
              {detailImages.map((src, index) => (<img key={index} src={src} alt="상세이미지" className="w-full h-auto display-block" />))}
            </div>
          </motion.section>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="space-y-3.5 text-sm mb-10">
              <div className="flex gap-4"><span className="text-zinc-400 w-12 shrink-0">장소</span><span className="font-medium">{festival.location}</span></div>
              <div className="flex gap-4"><span className="text-zinc-400 w-12 shrink-0">기간</span><span className="font-medium">{festival.date}</span></div>
              <div className="flex gap-4"><span className="text-zinc-400 w-12 shrink-0">연령</span><span className="font-medium">전체 이용가</span></div>
            </div>
            <div className="grid grid-cols-3 gap-2 py-5 border-y border-zinc-100 mb-10">
              <div className="flex flex-col items-center justify-center gap-1"><Ticket className="w-5 h-5 text-zinc-800" /><span className="text-[10px] font-bold text-zinc-500 text-center">축제 월간 3위</span></div>
              <div className="flex flex-col items-center justify-center gap-1"><Clock className="w-5 h-5 text-orange-500" /><span className="text-[10px] font-bold text-zinc-500 text-center flex items-center gap-0.5">대기 <Info className="w-2.5 h-2.5 text-zinc-300" /></span></div>
              <div className="flex flex-col items-center justify-center gap-1"><Users className="w-5 h-5 text-emerald-600" /><span className="text-[10px] font-bold text-emerald-600 text-center">청년, 가족</span></div>
            </div>
            <section className="mb-16 pt-10 border-t border-zinc-100">
              <h2 className="text-lg font-bold mb-8">행사 정보</h2>
              <div className="space-y-10">
                <div className="flex gap-4"><Calendar className="w-6 h-6 text-emerald-500 shrink-0" /><div><p className="font-bold text-[15px]">행사 기간</p><p className="text-zinc-600 text-sm">{festival.date}</p></div></div>
                <div className="flex gap-4"><MapPin className="w-6 h-6 text-emerald-500 shrink-0" /><div><p className="font-bold text-[15px]">행사 장소</p><p className="text-zinc-600 text-sm font-medium">{festival.location} 일원</p></div></div>
              </div>
            </section>
          </motion.div>
        )}
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-lg border-t border-zinc-100 md:hidden z-50">
        <Button className="w-full h-12 bg-zinc-900 text-white font-bold rounded-xl active:scale-[0.98] transition-transform">
          축제 예매하기
        </Button>
      </div>
    </div>
  );
}