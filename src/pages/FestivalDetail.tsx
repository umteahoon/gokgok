import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
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
  AlertTriangle,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { mockFestivals, topFestivals } from "@/lib/index";

// 💡 픽스 포인트 1: 빌드 에러를 유발하던 group8~11 로컬 이미지 임포트를 전면 차단했습니다.
// 💡 픽스 포인트 2: 공지사항 컴포넌트의 깨짐 방지를 위해 Unsplash 보완 주소로 정적 분리했습니다.
const carImg = "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=600";
const dogImg = "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=600";

export default function FestivalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
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
  // 💡 픽스 포인트 3: 복잡하고 터지기 쉬운 조건문 맵핑 대신, DB에서 받아온 무결점 이미지로 통합
  // ==========================================
  const detailImages: string[] = [festival.image || ""];
  const infoTags = { age: "전체 이용가", target: "누구나" };

  if (festival.title.includes("군항제")) {
    infoTags.target = "연인, 가족";
  } else if (festival.title.includes("순천만")) {
    infoTags.target = "가족, 힐링";
  } else if (festival.title.includes("보령") || festival.title.includes("머드")) {
    infoTags.target = "친구, 외국인";
  } else if (festival.title.includes("함평") || festival.title.includes("나비")) {
    infoTags.target = "어린이, 가족";
  }

  const notices = [
    {
      id: 1,
      type: "parking",
      title: "⚠️ [교통안내] 진해 군항제 임시 주차장 현황 및 무료 셔틀버스 노선",
      date: "2026.05.30",
      content:
        "축제 구역 내 교통 체증 완화를 위해 임시 주차장 통제 및 무료 셔틀버스를 연계 운행합니다. 탑뷰 맵에 표시된 파란색 셔틀 노선 유도선을 따라 이동하시면 대기 시간 없이 행사장 로터리까지 다이렉트로 진입하실 수 있습니다.",
      photoUrl: carImg,
      imageCaption:
        "📍 [종합 주차 가이드] 외곽 임시 주차 구역 및 무료 순환 셔틀버스 정류장 상세 노선도",
    },
    {
      id: 2,
      type: "safety",
      title: "🚫 [안내] 안전한 관람을 위한 반려동물 제한 및 반입 금지 물품 공지",
      date: "2026.05.29",
      content:
        "모든 관람객이 안전하고 쾌적하게 축제를 즐길 수 있도록 행사장 내 전 구역 공통 가이드라인을 공지합니다. 안전사고 우려가 있는 특정 이동 수단 및 안전거리 확보를 위한 규정 사항을 위 안내판 이미지를 통해 반드시 사전 숙지해 주시기 바랍니다.",
      photoUrl: dogImg,
      imageCaption:
        "🔒 [공통 규정] 관람 안전을 위한 물품 반입 제한 픽토그램 가이드 표준 안내판",
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
                className="space-y-16"
              >
                {notices.map((notice) => (
                  <div
                    key={notice.id}
                    className="border-b border-zinc-100 pb-12 last:border-0"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Megaphone className="w-4 h-4 text-[#FF3478]" />
                      <span className="text-sm font-medium text-zinc-500">
                        {notice.date}
                      </span>
                    </div>

                    <h3
                      className={`font-black text-xl mb-4 flex items-center gap-2 ${
                        notice.type === "parking"
                          ? "text-orange-600"
                          : "text-red-600"
                      }`}
                    >
                      {notice.type === "parking" ? (
                        <AlertTriangle className="w-5 h-5 shrink-0" />
                      ) : (
                        <ShieldAlert className="w-5 h-5 shrink-0" />
                      )}
                      {notice.title}
                    </h3>

                    <p className="text-base text-zinc-700 leading-relaxed mb-6">
                      {notice.content}
                    </p>

                    {notice.photoUrl && (
                      <div className="mt-4 border border-zinc-200 rounded-3xl overflow-hidden bg-zinc-50 shadow-md">
                        <div className="relative w-full h-[320px] md:h-[480px] overflow-hidden bg-zinc-100">
                          <img
                            src={notice.photoUrl}
                            alt="공지사항 매핑 이미지"
                            className="w-full h-full object-cover block hover:scale-[1.01] transition-transform duration-500"
                          />
                          <div className="absolute top-5 right-5 px-3.5 py-1.5 bg-black/70 backdrop-blur-md rounded-xl text-white font-extrabold text-xs tracking-wide">
                            {notice.type === "parking"
                              ? "🚌 순환 실황"
                              : "🔒 종합 규정"}
                          </div>
                        </div>
                        <div className="p-5 bg-zinc-50 border-t border-zinc-200">
                          <span className="text-xs font-black text-zinc-600 flex items-center gap-2">
                            <Info className="w-4 h-4 text-zinc-400" />{" "}
                            {notice.imageCaption}
                          </span>
                        </div>
                      </div>
                    )}
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
