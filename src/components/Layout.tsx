import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Sun, Moon, Clock } from 'lucide-react';
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
    toast({ variant: "destructive", title: "⏰ 세션 만료", description: "로그인 시간이 만료되어 자동 로그아웃되었습니다." });
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
        if (prev <= 1) { clearInterval(timer); forceLogout(); return 0; }
        return prev - 1;
      });
    }, 1000);

    window.addEventListener('hashchange', updateUserStatus);
    window.addEventListener('auth-change', updateUserStatus);
    if (document.documentElement.classList.contains('dark')) setIsDarkMode(true);

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
        method: "POST", headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
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

  const baseNavItems = [
    { label: '마당', path: ROUTE_PATHS?.HOME || '/' },
    { label: '축제', path: ROUTE_PATHS?.SEARCH || '/search' },
    { label: '수다', path: ROUTE_PATHS?.COMMUNITY || '/community' },
    { label: '내 정보', path: ROUTE_PATHS?.MYPAGE || '/mypage' }
  ];

  const handleLogout = () => {
    if (window.confirm("로그아웃 하시겠습니까?")) {
      logout(); updateUserStatus(); navigate(ROUTE_PATHS?.HOME || '/'); setMobileMenuOpen(false);
      toast({ title: "로그아웃 완료", description: "정상적으로 로그아웃 되었습니다." });
    }
  };

  const toggleTheme = () => {
    setIsDarkMode((prev) => {
      const newTheme = !prev;
      if (newTheme) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
      return newTheme;
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#111111] font-sans transition-colors duration-300">
      <header className="sticky top-0 z-50 w-full border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-[#111111] transition-colors duration-300">
        <div className="relative w-full max-w-[1400px] mx-auto px-4 md:px-8 flex items-center justify-between h-16">
          
          <div className="flex-shrink-0 z-10">
            <NavLink to={ROUTE_PATHS?.HOME || '/'} className="group flex items-center">
              <img src="/gokgok_logo.svg" alt="곡곡 로고" className="h-12 md:h-16 w-auto object-contain transition-opacity hover:opacity-80 dark:invert" />
            </NavLink>
          </div>

          <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 h-full items-stretch space-x-10 lg:space-x-14">
            {baseNavItems.map((item) => (
              <NavLink 
                key={item.label} 
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center text-[15px] lg:text-base transition-all whitespace-nowrap ${
                    isActive 
                      ? 'font-bold text-gray-900 dark:text-white' 
                      : 'font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <span className="relative">
                    {item.label}
                    {/* ✅ 강조선: 텍스트 바로 밑(-bottom-1)에 위치하도록 수정 */}
                    {isActive && (
                      <span className="absolute -bottom-1.5 left-0 right-0 h-[3px] bg-[#FF3478] rounded-full" />
                    )}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="hidden md:flex items-center justify-end gap-6 z-10">
            {currentUser && (
              <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-1.5 text-[12px] font-mono font-bold text-gray-800 dark:text-gray-200">
                  <Clock className="w-3.5 h-3.5 text-[#FF3478]" />
                  <span>{formatTime(timeLeft)}</span>
                </div>
                <div className="h-3 w-[1px] bg-gray-300 dark:bg-gray-600 mx-1" />
                <button onClick={handleExtend} className="text-[11px] font-bold text-gray-500 dark:text-gray-400 hover:text-[#FF3478] transition-colors">연장</button>
              </div>
            )}

            <div className="flex items-center gap-3">
              {currentUser ? (
                <button onClick={handleLogout} className="px-4 py-2 text-xs font-bold text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all">
                  로그아웃
                </button>
              ) : (
                <NavLink to={ROUTE_PATHS?.NOTMYPAGE || '/login'} className="px-4 py-2 text-xs font-bold text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all">
                  로그인
                </NavLink>
              )}

              <button onClick={toggleTheme} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors" aria-label="테마 변경">
                {isDarkMode ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
              </button>
              
              <button onClick={() => navigate('/contact')} className="px-4 py-2 text-xs font-bold text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-full hover:bg-gray-900 hover:text-white dark:hover:bg-white dark:hover:text-black transition-all">
                문의사항
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 w-full">{children}</main>
    </div>
  );
}