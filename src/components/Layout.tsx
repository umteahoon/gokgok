import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, Sun, Moon } from "lucide-react";
import { ROUTE_PATHS } from "@/lib/index";
import { getCurrentUser, logout } from "@/lib/login";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // ✅ 메인 페이지 여부
  const isHome = location.pathname === (ROUTE_PATHS?.HOME || "/");

  // ✅ 스크롤 상태
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);

    if (document.documentElement.classList.contains("dark")) {
      setIsDarkMode(true);
    }

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const updateUserStatus = () => {
    const user = getCurrentUser();
    setCurrentUser(user);
  };

  useEffect(() => {
    updateUserStatus();
    window.addEventListener("auth-change", updateUserStatus);

    return () => {
      window.removeEventListener("auth-change", updateUserStatus);
    };
  }, []);

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
      navigate("/");
      setMobileMenuOpen(false);
    }
  };

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      return next;
    });
  };

  // ✅ 헤더 스타일
  const headerClass = isScrolled
    ? "bg-white dark:bg-black shadow-sm border-b border-neutral-200 dark:border-white/10 py-4"
    : "bg-transparent py-8";

  // ✅ 오른쪽/로고 색상
  const textColor =
    isHome && !isScrolled ? "text-white" : "text-black dark:text-white";

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300">
      {/* 🔥 HEADER */}
      <header
        className={`fixed top-0 z-50 w-full transition-all duration-500 ${headerClass}`}
      >
        <div className="container mx-auto px-8 md:px-12 flex items-center justify-between relative">
          {/* 로고 */}
          <NavLink to="/">
            <span className={`text-2xl font-black transition ${textColor}`}>
              GOKGOK
            </span>
          </NavLink>

          {/* 🔥 메뉴 */}
          <nav className="hidden md:flex gap-10 absolute left-1/2 -translate-x-1/2">
            {baseNavItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.path}
                className={({ isActive }) => {
                  const base =
                    "text-[10px] font-bold tracking-[0.3em] uppercase transition";

                  const defaultColor =
                    isHome && !isScrolled
                      ? "text-white/70 hover:text-white"
                      : "text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white";

                  if (isActive) {
                    return `${base} ${
                      isHome && !isScrolled
                        ? "text-white border-b border-white"
                        : "text-black dark:text-white border-b border-black dark:border-white"
                    }`;
                  }

                  return `${base} ${defaultColor}`;
                }}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* 🔥 오른쪽 */}
          <div className={`hidden md:flex gap-6 ${textColor}`}>
            <button onClick={toggleTheme}>
              {isDarkMode ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>

            {currentUser ? (
              <button
                onClick={handleLogout}
                className="text-[10px] uppercase tracking-widest border-b pb-0.5"
              >
                Logout
              </button>
            ) : (
              <NavLink
                to="/login"
                className="text-[10px] uppercase tracking-widest border-b pb-0.5"
              >
                Login
              </NavLink>
            )}
          </div>

          {/* 🔥 모바일 */}
          <button
            className={`md:hidden ${textColor}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {/* 본문 */}
      <main className="flex-1">{children}</main>

      {/* 푸터 */}
      <footer className="bg-black text-white py-20">
        <div className="container mx-auto px-8">
          <p className="text-sm opacity-60">© 2026 GOKGOK Archive</p>
        </div>
      </footer>
    </div>
  );
}
