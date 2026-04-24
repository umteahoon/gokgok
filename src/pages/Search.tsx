import { useState } from "react";
import { Search, ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { mockFestivals, topFestivals } from "@/lib/index";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [scrollX, setScrollX] = useState(0);
  const [liked, setLiked] = useState<string[]>([]);
  const navigate = useNavigate();

  const scroll = (dir: "left" | "right") => {
    const amount = 300;
    setScrollX((prev) => (dir === "left" ? prev - amount : prev + amount));
  };

  const toggleLike = (id: string) => {
    setLiked((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const filteredFestivals = mockFestivals.filter(
    (item) =>
      item.title.includes(query) ||
      item.location.includes(query) ||
      item.category.includes(query),
  );

  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* 🔥 상단 슬라이드 */}
      <section className="px-8 md:px-16 pt-32 pb-10 relative">
        <div className="relative">
          {/* 버튼 */}
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-card border border-border rounded-xl p-2"
          >
            <ChevronLeft />
          </button>

          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-card border border-border rounded-xl p-2"
          >
            <ChevronRight />
          </button>

          {/* 🔥 검색창 */}
          <section className="px-8 md:px-16 pb-10">
            <div className="max-w-xl ml-auto">
              <div className="flex items-center gap-3 bg-card border border-border rounded-full px-5 py-3 shadow-sm">
                <Search className="w-4 h-4 opacity-40" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="축제 이름, 지역, 키워드로 검색하세요"
                  className="bg-transparent outline-none w-full text-sm"
                />
              </div>
            </div>
          </section>

          {/* 🔥 슬라이드 */}
          <div className="overflow-hidden">
            <div
              className="flex gap-6 transition-transform duration-500"
              style={{ transform: `translateX(-${scrollX}px)` }}
            >
              {topFestivals.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/search/${item.id}`)}
                  className="min-w-[220px] cursor-pointer"
                >
                  <div className="rounded-2xl overflow-hidden relative">
                    <img
                      src={item.image}
                      className="w-full h-[260px] object-cover"
                    />

                    {/* ❤️ 하트 (배경 제거) */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(item.id);
                      }}
                      className="absolute top-3 right-3"
                    >
                      <Heart
                        className={`w-6 h-6 drop-shadow-md ${
                          liked.includes(item.id)
                            ? "fill-red-500 text-red-500"
                            : "text-white"
                        }`}
                      />
                    </button>

                    {/* 랭킹 */}
                    {item.rank && (
                      <span className="absolute bottom-2 left-2 text-[80px] font-black text-black/80 leading-none">
                        {item.rank}
                      </span>
                    )}
                  </div>

                  <p className="mt-3 text-sm font-medium line-clamp-2">
                    {item.title}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 🔥 탭 */}
      <section className="px-8 md:px-16 border-t border-border py-6 flex justify-between items-center">
        <div className="flex gap-6 text-sm">
          <button className="border-b border-foreground pb-1">LIST VIEW</button>
          <button className="opacity-40 hover:opacity-100">
            MAP DISCOVERY
          </button>
        </div>

        <p className="text-xs opacity-40">
          Found {filteredFestivals.length} results
        </p>
      </section>

      {/* 🔥 카드 리스트 */}
      <section className="px-8 md:px-16 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {filteredFestivals.map((item) => (
          <div
            key={item.id}
            onClick={() => navigate(`/search/${item.id}`)}
            className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition cursor-pointer"
          >
            {/* 이미지 */}
            <div className="relative">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-[220px] object-cover"
              />

              {/* ❤️ 하트 (배경 제거) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLike(item.id);
                }}
                className="absolute top-3 right-3"
              >
                <Heart
                  className={`w-6 h-6 drop-shadow-md ${
                    liked.includes(item.id)
                      ? "fill-red-500 text-red-500"
                      : "text-gray-300"
                  }`}
                />
              </button>

              {/* 상태 */}
              <span className="absolute top-3 left-3 text-xs px-3 py-1 rounded-full bg-yellow-400 text-black font-semibold">
                {item.status === "upcoming"
                  ? "예정"
                  : item.status === "ongoing"
                    ? "진행중"
                    : "종료"}
              </span>
            </div>

            {/* 내용 */}
            <div className="p-4">
              <p className="text-xs opacity-40 mb-1">{item.category}</p>
              <h3 className="font-semibold">{item.title}</h3>
              <p className="text-xs opacity-50">{item.location}</p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
