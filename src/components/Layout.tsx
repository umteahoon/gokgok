import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Sun, Moon, Clock } from 'lucide-react';
import { SiFacebook, SiInstagram, SiYoutube } from 'react-icons/si';
import { ROUTE_PATHS } from '@/lib/index';
import { Button } from '@/components/ui/button';
import { getCurrentUser, logout } from "@/lib/login";
import { useToast } from "@/hooks/use-toast";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  const updateUserStatus = () => {
    const user = getCurrentUser();
    setCurrentUser(user);
  };

  // --- 🔥 [세션 타이머 로직 시작] ---
  const calculateTimeLeft = () => {
    const token = localStorage.getItem("accessToken");
    if (!token) return 0;
    try {
      const payload = JSON.parse(window.atob(token.split('.')[1]));
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
    navigate(ROUTE_PATHS?.HOME || '/');
    toast({
      variant: "destructive",
      title: "⏰ 세션 만료",
      description: "로그인 시간이 만료되어 자동 로그아웃되었습니다."
    });
  };

  useEffect(() => {
    updateUserStatus();

    const initialTime = calculateTimeLeft();
    setTimeLeft(Math.max(0, initialTime));

    if (localStorage.getItem("accessToken") && initialTime < -5) {
      forceLogout();
    }

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

    window.addEventListener('hashchange', updateUserStatus);
    window.addEventListener('auth-change', updateUserStatus);

    if (document.documentElement.classList.contains('dark')) {
      setIsDarkMode(true);
    }

    return () => {
      clearInterval(timer);
      window.removeEventListener('hashchange', updateUserStatus);
      window.removeEventListener('auth-change', updateUserStatus);
    };
  }, [currentUser?.id]);

  const formatTime = (seconds: number) => {
    if (seconds <= 0) return "00:00:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleExtend = async () => {
    const token = localStorage.getItem("accessToken");
    try {
      const res = await fetch("https://gokgok-8ztf.onrender.com/api/auth/refresh", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("accessToken", data.token);
        setTimeLeft(3600);
        toast({ title: "✅ 세션 연장 성공", description: "로그인 시간이 1시간 연장되었습니다." });
      }
    } catch (err) {
      toast({ variant: "destructive", title: "연장 실패", description: "다시 로그인해주세요." });
    }
  };
  // --- 🔥 [세션 타이머 로직 끝] ---

  const baseNavItems = [
    { label: '마당', path: ROUTE_PATHS?.HOME || '/' },
    { label: '축제', path: ROUTE_PATHS?.SEARCH || '/search' },
    { label: '수다', path: ROUTE_PATHS?.COMMUNITY || '/community' },
    { label: '내 정보', path: ROUTE_PATHS?.MYPAGE || '/mypage' },
  ];

  const handleLogout = () => {
    if (window.confirm("로그아웃 하시겠습니까?")) {
      logout();
      updateUserStatus();
      navigate(ROUTE_PATHS?.HOME || '/');
      setMobileMenuOpen(false);
      toast({ title: "로그아웃 완료", description: "정상적으로 로그아웃 되었습니다." });
    }
  };

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const newTheme = !prev;
      if (newTheme) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return newTheme;
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans transition-colors duration-300">
      <header className="sticky top-0 z-50 w-full border-b border-foreground/10 bg-background/80 backdrop-blur-md py-4 transition-colors duration-300">
        <div className="relative w-full max-w-[1400px] mx-auto pl-4 pr-2 md:pl-8 md:pr-2 flex items-center justify-between h-8">

          {/* 1. 왼쪽: 로고 영역 */}
          <div className="flex-shrink-0 z-10">
            <NavLink to={ROUTE_PATHS?.HOME || '/'} className="group">
              <span
                className="text-2xl md:text-3xl font-bold text-foreground transition-colors"
                style={{ fontFamily: 'GmarketSansBold' }}
              >
                곡곡
              </span>
            </NavLink>
          </div>

          {/* 2. 가운데: 네비게이션 메뉴 */}
          <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center space-x-10 lg:space-x-14">
            {baseNavItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.path}
                className={({ isActive }) =>
                  `py-1 text-[15px] lg:text-base transition-all whitespace-nowrap relative ${
                    isActive
                      ? 'font-bold text-foreground'
                      : 'font-medium text-muted-foreground hover:text-foreground'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {item.label}
                    {isActive && (
                      <span className="absolute -bottom-[21px] left-0 right-0 h-[2.5px] bg-[#E3051B] dark:bg-primary" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* 3. 오른쪽: 유저 메뉴 및 타이머 영역 */}
          <div className="hidden md:flex items-center justify-end gap-8 z-10">
            {/* 왼쪽 그룹: 타이머 + 로그인/로그아웃 */}
            <div className="flex items-center gap-2">
              {currentUser && (
                <div className="flex items-center gap-2 bg-foreground/5 px-3 py-1.5 rounded-full border border-foreground/10 shrink-0">
                  <div className="flex items-center gap-1.5 text-[12px] font-mono font-bold text-foreground/80">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    <span>{formatTime(timeLeft)}</span>
                  </div>
                  <div className="h-3 w-[1px] bg-foreground/20 mx-1" />
                  <button
                    onClick={handleExtend}
                    className="text-[11px] font-bold text-muted-foreground hover:text-primary transition-colors"
                  >
                    연장
                  </button>
                </div>
              )}

              {currentUser ? (
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-xs font-bold text-foreground border border-foreground/20 rounded-full hover:bg-foreground hover:text-background transition-all shrink-0"
                >
                  로그아웃
                </button>
              ) : (
                <NavLink
                  to={ROUTE_PATHS?.NOTMYPAGE || '/login'}
                  className="px-4 py-2 text-xs font-bold text-foreground border border-foreground/20 rounded-full hover:bg-foreground hover:text-background transition-all shrink-0"
                >
                  로그인
                </NavLink>
              )}
            </div>

            {/* 오른쪽 그룹: 다크모드 + 문의사항 */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-foreground/5 rounded-full transition-colors shrink-0"
                aria-label="테마 변경"
              >
                {isDarkMode ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
              </button>

              <NavLink
                to="/contact"
                className="px-4 py-2 text-xs font-bold text-foreground border border-foreground/20 rounded-full hover:bg-foreground hover:text-background transition-all shrink-0"
              >
                문의사항
              </NavLink>
            </div>
          </div>

          {/* 모바일 화면용 메뉴 */}
          <div className="md:hidden flex items-center gap-2 z-10">
            {currentUser && (
              <span className="text-[10px] font-mono font-bold bg-foreground/5 px-2 py-1 rounded-full border border-foreground/10">
                {formatTime(timeLeft)}
              </span>
            )}
            <button
              onClick={toggleTheme}
              className="p-1.5 text-foreground hover:bg-foreground/10 rounded-full transition-colors"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <Button
              variant="ghost"
              size="icon"
              className="text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full px-2">{children}</main>
    </div>
  );
}