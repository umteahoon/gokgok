import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Sun, Moon, Clock } from 'lucide-react'; // Clock 아이콘 추가
import { SiFacebook, SiInstagram, SiYoutube } from 'react-icons/si';
import { ROUTE_PATHS } from '@/lib/index';
import { Button } from '@/components/ui/button';
import { getCurrentUser, logout } from "@/lib/login";
import { useToast } from "@/hooks/use-toast"; // Toast 훅 추가

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0); // 남은 시간 상태 추가
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
      return Math.max(0, Math.floor((exp - now) / 1000));
    } catch (e) {
      return 0;
    }
  };

  useEffect(() => {
    updateUserStatus();
    setTimeLeft(calculateTimeLeft());

    // 1초마다 타이머 갱신
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1 && localStorage.getItem("accessToken")) {
          handleLogout(); // 시간 만료 시 자동 로그아웃
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
  }, []);

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
        setTimeLeft(3600); // 1시간으로 리셋
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
      alert("로그아웃 되었습니다.");
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
      <header className="sticky top-0 z-50 w-full border-b border-foreground/15 bg-background/85 backdrop-blur-md py-4 transition-colors duration-300">
        {/* 정중앙 배치를 위해 relative 속성을 추가했습니다. */}
        <div className="container mx-auto px-4 flex items-center justify-between relative">
          
          {/* ======================================================= */}
          {/* 1. 좌측 영역: 로고 (테두리 없음) */}
          {/* ======================================================= */}
          <NavLink to={ROUTE_PATHS?.HOME || '/'} className="group z-10">
            <span className="text-xl font-bold text-foreground transition-colors" style={{ fontFamily: 'GmarketSansBold' }}>
              곡곡
            </span>
          </NavLink>

          {/* ======================================================= */}
          {/* 2. 중앙 영역: 네비게이션 메뉴 (화면 정가운데 배치) */}
          {/* ======================================================= */}
          <nav className="hidden md:flex items-center space-x-12 absolute left-1/2 -translate-x-1/2">
            {baseNavItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.path}
                className={({ isActive }) =>
                  `py-1 text-sm transition-all ${
                    isActive
                      ? 'font-bold text-foreground border-b-[2px] border-foreground'
                      : 'font-medium text-muted-foreground hover:text-accent hover:border-b-[2px] hover:border-accent border-b-[2px] border-transparent'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* ======================================================= */}
          {/* 3. 우측 영역: 세션 타이머, 테마 및 로그아웃 버튼 */}
          {/* ======================================================= */}
          <div className="hidden md:flex items-center gap-4 z-10">
            {/* ⏰ 실시간 세션 타이머 UI */}
            {currentUser && (
              <div className="flex items-center gap-2 bg-foreground/5 px-3 py-1.5 rounded-full border border-foreground/10 mr-2">
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

            <button
              onClick={toggleTheme}
              className="p-1.5 text-foreground hover:bg-foreground/10 rounded-full transition-colors"
              aria-label="테마 변경"
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {currentUser ? (
              <button
                onClick={handleLogout}
                className="px-4 py-1.5 text-xs font-bold text-foreground border border-foreground/30 rounded-md hover:bg-foreground hover:text-background transition-all"
              >
                로그아웃
              </button>
            ) : (
              <NavLink
                to={ROUTE_PATHS?.NOTMYPAGE || '/login'}
                className="px-4 py-1.5 text-xs font-bold text-foreground border border-foreground/30 rounded-md hover:bg-foreground hover:text-background transition-all"
              >
                로그인
              </NavLink>
            )}
          </div>

          {/* 모바일 환경 대응 */}
          <div className="md:hidden flex items-center gap-2">
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

          {mobileMenuOpen && (
            <nav className="md:hidden absolute top-full left-0 w-full bg-background border-t border-border/50 py-3 px-4 space-y-1 shadow-lg z-50 transition-colors duration-300">
              {baseNavItems.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `block px-4 py-2.5 rounded-md text-sm transition-colors text-center ${
                      isActive
                        ? 'font-bold text-foreground bg-foreground/5'
                        : 'font-medium text-muted-foreground hover:text-accent hover:bg-foreground/5'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              
              <div className="pt-2 mt-1 border-t border-foreground/10 space-y-2">
                {currentUser && (
                  <button
                    onClick={handleExtend}
                    className="block w-full text-center px-4 py-2 text-xs font-bold text-primary"
                  >
                    세션 연장하기
                  </button>
                )}
                {currentUser ? (
                  <button
                    onClick={handleLogout}
                    className="block w-full text-center px-4 py-2.5 text-sm font-bold text-foreground hover:text-accent"
                  >
                    로그아웃
                  </button>
                ) : (
                  <NavLink
                    to={ROUTE_PATHS?.NOTMYPAGE || '/login'}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-center px-4 py-2.5 text-sm font-bold text-foreground hover:text-accent"
                  >
                    로그인
                  </NavLink>
                )}
              </div>
            </nav>
          )}
        </div>
      </header>

      <main className="flex-1 px-2">{children}</main>

      <footer className="border-t border-foreground/15 bg-background pt-10 pb-8 mt-12 transition-colors duration-300">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center md:items-start">
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-lg font-bold text-foreground">곡곡</span>
              </div>
              <p className="text-sm font-medium text-muted-foreground">대한민국 지역 축제를 한눈에</p>
            </div>

            <div className="flex flex-col items-center md:items-start">
              <h3 className="font-bold text-foreground mb-4">바로가기</h3>
              <ul className="space-y-2 text-center md:text-left">
                {baseNavItems.map((item) => (
                  <li key={item.label}>
                    <NavLink to={item.path} className="text-sm font-medium text-muted-foreground hover:text-accent transition-colors">
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col items-center md:items-start">
              <h3 className="font-bold text-foreground mb-4">소셜 미디어</h3>
              <div className="flex space-x-4">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-accent transition-colors">
                  <SiFacebook className="h-5 w-5" />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-accent transition-colors">
                  <SiInstagram className="h-5 w-5" />
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-accent transition-colors">
                  <SiYoutube className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-foreground/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm font-medium text-muted-foreground">© 2026 곡곡(GokGok). All rights reserved.</p>
            <div className="flex gap-6">
              <NavLink to="/terms" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">이용약관</NavLink>
              <NavLink to="/privacy" className="text-sm font-bold text-foreground hover:text-accent transition-colors">개인정보처리방침</NavLink>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}