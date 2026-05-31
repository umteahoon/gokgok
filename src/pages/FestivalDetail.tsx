import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom"; // 🛠️ useLocation 모듈 import 추가 완료
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  Share2,
  Heart,
  Star,
  Users,
  Info,
  Clock,
  Ticket,
  Calendar,
  MapPin,
  Megaphone,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { mockFestivals, topFestivals } from "@/lib/index";

// 각 축제별 전용 상세 이미지 변수들
import group8 from "@/assets/group8.png";
import group9 from "@/assets/Group9.png";
import group10 from "@/assets/Group10.png";
import group11 from "@/assets/Group11.png";

export default function FestivalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation(); // 🛠️ 이전 마이페이지에서 넘겨받은 state 보관함 선언
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState("상품상세");
  const [isWishlisted, setIsWishlisted] = useState(false);

  // 데이터 병합 및 해당 축제 찾기
  const allData = [...topFestivals, ...mockFestivals];
  const festival = allData.find((f) => String(f.id) === id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    const savedWishlist = JSON.parse(
      localStorage.getItem("gokgok_wishlist") || "[]",
    );
    setIsWishlisted(savedWishlist.includes(id));
  }, [id]);

  const toggleWishlist = () => {
    const savedWishlist = JSON.parse(
      localStorage.getItem("gokgok_wishlist") || "[]",
    );
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

  const handleShare = async () => {
    const shareData = {
      title: `곡곡 - ${festival?.title}`,
      text: `${festival?.location}에서 열리는 ${festival?.title} 정보를 확인해보세요!`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "링크 복사 완료",
          description: "공유할 수 있도록 주소가 복사되었습니다.",
        });
      }
    } catch (err) {
      console.error("공유 실패:", err);
    }
  };

  if (!festival) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#111111] flex flex-col items-center justify-center font-sans">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF3478] mb-2" />
        <p className="text-zinc-400 text-sm font-medium">
          축제 정보를 불러오는 중입니다...
        </p>
      </div>
    );
  }

  // ==========================================
  // 축제별 전용 상세 이미지 매핑
  // ==========================================
  let detailImages: string[] = [];
  let notices: any[] = [];
  const infoTags = { age: "전체 이용가", target: "누구나" };

  if (festival.title.includes("군항제")) {
    detailImages = [group8];
    infoTags.target = "연인, 가족";
  } else if (festival.title.includes("순천만")) {
    detailImages = [group11];
    infoTags.target = "가족, 힐링";
  } else if (
    festival.title.includes("보령") ||
    festival.title.includes("머드")
  ) {
    detailImages = [group9];
    infoTags.target = "친구, 외국인";
  } else if (
    festival.title.includes("함평") ||
    festival.title.includes("나비")
  ) {
    detailImages = [group10];
    infoTags.target = "어린이, 가족";
  } else {
    detailImages = [festival.image];
  }

  notices = [
    {
      id: 1,
      title: `${festival.title} 운영 안내`,
      date: "2026.05.30",
      content:
        "안전하고 쾌적한 축제 관람을 위해 도보 이동 및 대중교통 이용을 권장합니다. 행사 세부 일정은 현장 상황에 따라 변경될 수 있습니다.",
    },
  ];

  const menuTabs = ["공지사항", "상품상세", "이용안내"];

  return (
    <div className="min-h-screen bg-white pb-28 font-sans text-zinc-900">
      {/* 1. 상단 배경 및 이미지 영역 */}
      <section className="relative w-full h-[300px] md:h-[400px] overflow-hidden bg-zinc-900">
        <div
          className="absolute inset-0 bg-cover bg-center blur-3xl opacity-40 scale-110"
          style={{ backgroundImage: `url(${festival.image})` }}
        />
        <div className="relative h-full flex items-center justify-center p-4">
          <motion.img
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            src={festival.image}
            alt={festival.title}
            className="h-[85%] w-auto object-contain rounded-xl shadow-2xl"
          />
        </div>
        {/* 🛠️ [뒤로가기 버튼 로직 전체 교체] state.from 분기를 타게 하여 이전 유저 기록으로 빈 레이어 없이 리턴 */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();

            if (location.state?.from) {
              navigate(location.state.from);
            } else {
              navigate(-1);
            }
          }}
          className="absolute top-4 left-4 p-2.5 bg-black/15 backdrop-blur-md rounded-full text-white hover:bg-black/40 transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </section>

      {/* 2. 타이틀 및 기본 정보 영역 */}
      <main className="container mx-auto px-5 mt-8 max-w-[800px]">
        <div className="flex justify-between items-start mb-3">
          <h1 className="text-2xl md:text-3xl font-extrabold leading-tight tracking-tight">
            <span className="text-[#FF3478] text-sm md:text-base font-bold block mb-1">
              {festival.category}
            </span>
            {festival.title}
          </h1>
          <div className="flex gap-3 pt-1">
            <button
              onClick={handleShare}
              className="p-2 text-zinc-700 active:scale-90 transition-transform"
            >
              <Share2 className="w-6 h-6" />
            </button>
            <button
              onClick={toggleWishlist}
              className="p-2 text-zinc-700 active:scale-90 transition-transform"
            >
              <Heart
                className={`w-6 h-6 transition-colors ${isWishlisted ? "fill-[#FF3478] text-[#FF3478]" : ""}`}
              />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1.5 mb-8">
          <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
          <span className="font-bold text-base">4.3</span>
        </div>

        {/* 3. 메뉴 탭 */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-8 border-b border-zinc-100 pb-3">
          {menuTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap border transition-all ${
                activeTab === tab
                  ? "bg-zinc-900 border-zinc-900 text-white shadow-md"
                  : "bg-zinc-50 border-transparent text-zinc-500 hover:bg-zinc-100"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* 4. 탭별 상세 내용 */}
        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            {/* 탭 1: 공지사항 */}
            {activeTab === "공지사항" && (
              <motion.section
                key="notice"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-10"
              >
                {notices.map((notice) => (
                  <div
                    key={notice.id}
                    className="border-b border-zinc-100 pb-10 last:border-0"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Megaphone className="w-4 h-4 text-[#FF3478]" />
                      <span className="text-sm font-medium text-zinc-500">
                        {notice.date}
                      </span>
                    </div>
                    <h3 className="font-bold text-xl mb-4">{notice.title}</h3>
                    <p className="text-base text-zinc-700 leading-relaxed">
                      {notice.content}
                    </p>
                  </div>
                ))}
              </motion.section>
            )}

            {/* 탭 2: 상품상세 */}
            {activeTab === "상품상세" && (
              <motion.section
                key="detail"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="flex flex-col -mx-5 md:-mx-0">
                  {detailImages.map((src, index) => (
                    <img
                      key={index}
                      src={src}
                      alt={`${festival.title} 상세이미지`}
                      className="w-full h-auto block"
                    />
                  ))}
                </div>
              </motion.section>
            )}

            {/* 탭 3: 이용안내 */}
            {activeTab === "이용안내" && (
              <motion.section
                key="info"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="space-y-4 text-[15px] mb-10 bg-zinc-50 p-6 rounded-2xl">
                  <div className="flex gap-4">
                    <span className="text-zinc-500 font-bold w-12 shrink-0">
                      장소
                    </span>
                    <span className="font-medium text-zinc-900">
                      {festival.location}
                    </span>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-zinc-500 font-bold w-12 shrink-0">
                      기간
                    </span>
                    <span className="font-medium text-zinc-900">
                      {festival.date}
                    </span>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-zinc-500 font-bold w-12 shrink-0">
                      연령
                    </span>
                    <span className="font-medium text-zinc-900">
                      {infoTags.age}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 py-6 border-y border-zinc-100 mb-12">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center">
                      <Ticket className="w-6 h-6 text-zinc-700" />
                    </div>
                    <span className="text-[12px] font-bold text-zinc-600">
                      축제 월간 상위권
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center">
                      <Clock className="w-6 h-6 text-orange-500" />
                    </div>
                    <span className="text-[12px] font-bold text-zinc-600 flex items-center gap-1">
                      대기 <Info className="w-3 h-3 text-zinc-400" />
                    </span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-emerald-600" />
                    </div>
                    <span className="text-[12px] font-bold text-zinc-600">
                      {infoTags.target}
                    </span>
                  </div>
                </div>

                <div className="mb-10">
                  <h2 className="text-xl font-extrabold mb-6">행사 정보</h2>
                  <div className="space-y-8">
                    <div className="flex gap-4">
                      <div className="mt-1">
                        <Calendar className="w-6 h-6 text-zinc-400" />
                      </div>
                      <div>
                        <p className="font-bold text-[16px] text-zinc-900 mb-1">
                          행사 기간
                        </p>
                        <p className="text-zinc-600 text-sm leading-relaxed">
                          {festival.date}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <div className="mt-1">
                        <MapPin className="w-6 h-6 text-zinc-400" />
                      </div>
                      <div>
                        <p className="font-bold text-[16px] text-zinc-900 mb-1">
                          행사 장소
                        </p>
                        <p className="text-zinc-600 text-sm leading-relaxed">
                          {festival.location} 일원
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/85 backdrop-blur-xl border-t border-zinc-100 md:hidden z-50">
        <Button className="w-full h-14 bg-zinc-900 text-white text-base font-bold rounded-xl active:scale-[0.98] transition-transform shadow-lg">
          축제 예매하기
        </Button>
      </div>
    </div>
  );
}
