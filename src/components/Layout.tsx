import { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate, Link } from "react-router-dom";
import {
  Menu,
  X,
  Sun,
  Moon,
  Clock,
  Heart,
  Youtube,
  Instagram,
} from "lucide-react";
import { ROUTE_PATHS } from "@/lib/index";
import { Button } from "@/components/ui/button";
import { getCurrentUser, logout } from "@/lib/login";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isLoginNoticeOpen, setIsLoginNoticeOpen] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  const updateUserStatus = () => {
    const user = getCurrentUser();
    setCurrentUser(user);
  };

  const calculateTimeLeft = () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return 0;
    try {
      const payload = JSON.parse(window.atob(token.split(".")[1]));
      const exp = payload.exp * 1000;
      const now = Date.now();
      return Math.floor((exp - now) / 1000);
    } catch (e) {
      return 0;
    }
  };

  const forceLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("gokgok_current_user");
    setCurrentUser(null);
    setTimeLeft(0);
    navigate(ROUTE_PATHS?.HOME || "/");
    toast({
      variant: "destructive",
      title: "⏰ 세션 만료",
      description: "로그인 시간이 만료되어 자동 로그아웃되었습니다.",
    });
  };

  useEffect(() => {
    updateUserStatus();
    const initialTime = calculateTimeLeft();
    setTimeLeft(Math.max(0, initialTime));

    if (localStorage.getItem("accessToken") && initialTime < -5) forceLogout();

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        const currentToken = localStorage.getItem("accessToken");
        if (!currentToken) return 0;
        if (prev <= 1) {
          clearInterval(timer);
          forceLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    window.addEventListener("hashchange", updateUserStatus);
    window.addEventListener("auth-change", updateUserStatus);
    if (document.documentElement.classList.contains("dark"))
      setIsDarkMode(true);

    return () => {
      clearInterval(timer);
      window.removeEventListener("hashchange", updateUserStatus);
      window.removeEventListener("auth-change", updateUserStatus);
    };
  }, [currentUser?.id]);

  const formatTime = (seconds: number) => {
    if (seconds <= 0) return "00:00:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleExtend = async () => {
    const token = localStorage.getItem("accessToken");
    try {
      const res = await fetch(
        "https://gokgok-8ztf.onrender.com/api/auth/refresh",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("accessToken", data.token);
        setTimeLeft(3600);
        toast({
          title: "✅ 세션 연장 성공",
          description: "로그인 시간이 1시간 연장되었습니다.",
        });
      }
    } catch (err) {
      toast({
        variant: "destructive",
        title: "연장 실패",
        description: "다시 로그인해주세요.",
      });
    }
  };

  const baseNavItems = [
    { label: "마당", path: ROUTE_PATHS?.HOME || "/" },
    { label: "축제", path: ROUTE_PATHS?.SEARCH || "/search" },
    { label: "수다", path: ROUTE_PATHS?.COMMUNITY || "/community" },
    { label: "내 정보", path: ROUTE_PATHS?.MYPAGE || "/mypage" },
  ];

  const handleLogout = () => {
    if (window.confirm("로그아웃 하시겠습니까?")) {
      logout();
      updateUserStatus();
      navigate(ROUTE_PATHS?.HOME || "/");
      setMobileMenuOpen(false);
      toast({
        title: "로그아웃 완료",
        description: "정상적으로 로그아웃 되었습니다.",
      });
    }
  };

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const newTheme = !prev;
      if (newTheme) document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
      return newTheme;
    });
  };

  const handleContactClick = () => {
    if (!currentUser) {
      setIsLoginNoticeOpen(true);
    } else {
      navigate("/contact");
    }
  };

  const clearButtonStyle = {
    WebkitTapHighlightColor: "transparent",
    outline: "none",
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#111111] font-sans transition-colors duration-300">
      {/* 1. 상단 글로벌 네비게이션 헤더 */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#111111] transition-colors duration-300">
        <div className="relative w-full max-w-[1400px] mx-auto px-4 md:px-8 flex items-center justify-between h-16">
          <div className="flex-shrink-0 z-10">
            <NavLink
              to={ROUTE_PATHS?.HOME || "/"}
              className="group flex items-center"
            >
              <img
                src="/gokgok_logo.svg"
                alt="곡곡 로고"
                className="h-12 md:h-16 w-auto object-contain transition-opacity hover:opacity-80 dark:invert"
              />
            </NavLink>
          </div>

          {/* 데스크탑 네비게이션 */}
          <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 h-full items-stretch space-x-10 lg:space-x-14">
            {baseNavItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center text-[15px] lg:text-base transition-all whitespace-nowrap ${
                    isActive
                      ? "font-bold text-gray-900 dark:text-white"
                      : "font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`
                }
              >
                {({ isActive }) => (
                  <span className="relative">
                    {item.label}
                    {isActive && (
                      <span className="absolute -bottom-1.5 left-0 right-0 h-[3px] bg-[#FF3478] rounded-full" />
                    )}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* 데스크탑 우측 메뉴 링크 스펙 */}
          <div className="hidden md:flex items-center justify-end gap-6 z-10">
            {currentUser && (
              <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-1.5 text-[12px] font-mono font-bold text-gray-800 dark:text-gray-200">
                  <Clock className="w-3.5 h-3.5 text-[#FF3478]" />
                  <span>{formatTime(timeLeft)}</span>
                </div>
                <div className="h-3 w-[1px] bg-gray-300 dark:bg-gray-600 mx-1" />
                <button
                  onClick={handleExtend}
                  className="text-[11px] font-bold text-gray-500 dark:text-gray-400 hover:text-[#FF3478] transition-colors"
                >
                  연장
                </button>
              </div>
            )}

            <div className="flex items-center gap-3">
              {currentUser ? (
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-xs font-bold text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-full hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 transition-all"
                >
                  로그아웃
                </button>
              ) : (
                <NavLink
                  to={ROUTE_PATHS?.NOTMYPAGE || "/login"}
                  className="px-4 py-2 text-xs font-bold text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-full hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 transition-all"
                >
                  로그인
                </NavLink>
              )}

              <button
                onClick={toggleTheme}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                aria-label="테마 변경"
              >
                {isDarkMode ? (
                  <Sun className="w-[18px] h-[18px]" />
                ) : (
                  <Moon className="w-[18px] h-[18px]" />
                )}
              </button>

              <button
                onClick={handleContactClick}
                className="px-4 py-2 text-xs font-bold text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-full hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95 transition-all"
              >
                문의사항
              </button>
            </div>
          </div>

          {/* 모바일 레이아웃 반응형 햄버거 토글러 인프라 구축 */}
          <div className="flex md:hidden items-center gap-2 z-10">
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
            >
              {isDarkMode ? (
                <Sun className="w-[18px] h-[18px]" />
              ) : (
                <Moon className="w-[18px] h-[18px]" />
              )}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* 모바일 팝업 슬라이드 네비게이션 드롭다운 메인 뷰 */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden w-full bg-white dark:bg-[#111111] border-b border-gray-100 dark:border-gray-800 px-6 py-6 space-y-4 absolute top-16 left-0 z-40 shadow-xl text-left"
          >
            {baseNavItems.map((item) => (
              <Link
                key={item.label}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-[16px] font-black text-gray-800 dark:text-gray-200 hover:text-[#FF3478] py-1"
              >
                {item.label}
              </Link>
            ))}
            <div className="h-[1px] bg-gray-100 dark:bg-zinc-800 my-4" />
            <div className="flex flex-col gap-2.5">
              {currentUser ? (
                <button
                  onClick={handleLogout}
                  className="w-full py-3 text-sm font-bold text-center bg-gray-50 dark:bg-zinc-900 rounded-xl text-gray-700 dark:text-gray-300"
                >
                  로그아웃
                </button>
              ) : (
                <Link
                  to={ROUTE_PATHS?.NOTMYPAGE || "/login"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 text-sm font-bold text-center bg-gray-50 dark:bg-zinc-900 rounded-xl text-gray-700 dark:text-gray-300 block"
                >
                  로그인 / 회원가입
                </Link>
              )}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleContactClick();
                }}
                className="w-full py-3 text-sm font-black text-center bg-[#FF3478]/5 text-[#FF3478] rounded-xl"
              >
                1:1 고객 문의사항
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. 메인 페이지 콘텐츠 영역 */}
      <main className="flex-1 w-full">{children}</main>

      {/* 3. 하단 공통 푸터 배너 섹션 (진한 청록색 테마 및 밑줄/핑크강조 완벽 제거) */}
      <footer className="w-full bg-[#0a2730] text-[#8fa7ac] py-12 border-t border-[#0d3440] transition-colors duration-300">
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 flex flex-col md:flex-row justify-between items-start gap-8 text-left">
          {/* 팀 정보 텍스트 */}
          <div className="space-y-4 flex-1">
            <div className="flex items-center gap-3">
              <span className="font-black text-white text-base tracking-wider uppercase">
                GokGok
              </span>
              <span className="text-[11px] font-medium bg-white/10 text-[#c0d3d6] px-2 py-0.5 rounded-md">
                대한민국 축제 구석구석
              </span>
            </div>
            <p className="text-[12px] font-medium leading-relaxed text-[#8fa7ac] max-w-2xl">
              작성자: 엄태훈, 이주환, 최원재 (GokGok Project Team)
              <br />본 플랫폼은 국내 지역 활성화 및 로컬 축제 정보 제공을 목적에
              둔 프로젝트 팀 빌딩 공간입니다.
            </p>
            <p className="text-[11px] font-bold text-[#5a787e] pt-1">
              &copy; 2026 GokGok. All rights reserved.
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-6 shrink-0">
            {/* 우측 SNS 패널 */}
            <div className="flex items-center gap-3">
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-white transition-all"
              >
                <Youtube className="w-4 h-4" fill="currentColor" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center text-white transition-all"
              >
                <Instagram className="w-4 h-4" />
              </a>
            </div>

            {/* 하단 링크 가로 정렬 영역 (밑줄 및 🚩개인정보처리방침 핑크 강조색 완벽 제거) */}
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-[13px] font-bold text-[#c0d3d6]">
              <Link
                to="/terms"
                style={clearButtonStyle}
                className="hover:text-white transition-colors"
              >
                이용약관
              </Link>
              <Link
                to="/privacy"
                style={clearButtonStyle}
                className="hover:text-white transition-colors"
              >
                개인정보처리방침
              </Link>
              <Link
                to="/contact"
                style={clearButtonStyle}
                className="hover:text-white transition-colors"
              >
                고객문의
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* --- 로그인 유도 커스텀 모달 애니메이션 레이어 (문의사항 가드 일체화) --- */}
      <AnimatePresence>
        {isLoginNoticeOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[500] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={() => setIsLoginNoticeOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-[#1a1a1a] w-full max-w-[320px] rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 p-6 text-center"
            >
              <div className="w-12 h-12 bg-pink-50 dark:bg-pink-950/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="text-[#FF3478] w-6 h-6" fill="currentColor" />
              </div>
              <h3 className="text-[18px] font-black text-gray-900 dark:text-white mb-2">
                로그인이 필요합니다
              </h3>
              <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
                1:1 문의사항 작성 및 확인 기능은
                <br />
                로그인 후 이용하실 수 있습니다.
              </p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    setIsLoginNoticeOpen(false);
                    navigate("/notmypage");
                  }}
                  className="w-full py-3.5 bg-[#111111] dark:bg-white text-white dark:text-black font-bold rounded-full text-sm shadow-sm hover:opacity-90 transition-all"
                >
                  로그인하러 가기
                </button>
                <button
                  onClick={() => setIsLoginNoticeOpen(false)}
                  className="w-full py-2 text-gray-400 dark:text-gray-500 font-medium rounded-full text-xs hover:text-gray-600 transition-colors"
                >
                  취소
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
