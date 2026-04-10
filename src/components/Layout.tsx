import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Sun, Moon, MapPin } from 'lucide-react'; // MapPin 아이콘 추가!
import { SiFacebook, SiInstagram, SiYoutube } from 'react-icons/si';
import { ROUTE_PATHS } from '@/lib/index';
import { Button } from '@/components/ui/button';
import { getCurrentUser, logout } from "@/lib/login";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();

  const updateUserStatus = () => {
    const user = getCurrentUser();
    setCurrentUser(user);
  };

  useEffect(() => {
    updateUserStatus();
    window.addEventListener('hashchange', updateUserStatus);
    window.addEventListener('auth-change', updateUserStatus);
    
    if (document.documentElement.classList.contains('dark')) {
      setIsDarkMode(true);
    }

    return () => {
      window.removeEventListener('hashchange', updateUserStatus);
      window.removeEventListener('auth-change', updateUserStatus);
    };
  }, []);

  const baseNavItems = [
    { label: '홈', path: ROUTE_PATHS?.HOME || '/' },
    { label: '찾기', path: ROUTE_PATHS?.SEARCH || '/search' },
    { label: '커뮤니티', path: ROUTE_PATHS?.COMMUNITY || '/community' },
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
    // 🔥 1. bg-background를 bg-transparent로 변경하여 뒤쪽 사진이 보이게 함!
    <div className="min-h-screen flex flex-col bg-transparent font-sans transition-colors duration-300">
      
      {/* 🔥 2. 헤더에 반투명 유리 효과(backdrop-blur-xl) 적용 */}
      <header className="sticky top-0 z-50 w-full border-b border-foreground/10 bg-background/20 backdrop-blur-xl py-3 transition-colors duration-300">
        <div className="container mx-auto px-4 lg:px-8 flex items-center justify-between">
          
          {/* 🔥 3. 왼쪽 상단 로고 (지도 핀 아이콘 + 곡곡 GokGok) */}
          <NavLink to={ROUTE_PATHS?.HOME || '/'} className="flex items-center gap-2 group hover:opacity-80 transition-opacity z-50">
            <MapPin className="w-6 h-6 text-foreground" />
            <div className="flex items-baseline gap-1.5">
              <span className="font-bold text-2xl tracking-tighter" style={{ fontFamily: 'GmarketSansBold' }}>곡곡</span>
              <span className="text-sm font-semibold tracking-widest opacity-60 hidden sm:inline-block">GokGok</span>
            </div>
          </NavLink>

          {/* 중앙 네비게이션 (데스크탑) */}
          <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center space-x-12">
            {baseNavItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.path}
                className={({ isActive }) =>
                  `py-1 text-sm transition-all ${
                    isActive
                      ? 'font-bold text-foreground border-b-2 border-foreground'
                      : 'font-medium text-foreground/60 hover:text-foreground hover:border-b-2 hover:border-foreground/50 border-b-2 border-transparent'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* 우측 상단 버튼들 */}
          <div className="hidden md:flex items-center gap-4 z-50">
            <button
              onClick={toggleTheme}
              className="p-2 text-foreground/80 hover:bg-foreground/10 rounded-full transition-colors"
              aria-label="테마 변경"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {currentUser ? (
              <button
                onClick={handleLogout}
                className="px-5 py-2 text-xs font-bold text-background bg-foreground rounded-full hover:bg-foreground/80 transition-all"
              >
                로그아웃
              </button>
            ) : (
              <NavLink
                to={ROUTE_PATHS?.NOTMYPAGE || '/login'}
                className="px-5 py-2 text-xs font-bold text-background bg-foreground rounded-full hover:bg-foreground/80 transition-all"
              >
                로그인
              </NavLink>
            )}
          </div>

          {/* 모바일 메뉴 버튼 */}
          <div className="md:hidden flex items-center gap-2 z-50">
            <button
              onClick={toggleTheme}
              className="p-1.5 text-foreground/80 hover:bg-foreground/10 rounded-full transition-colors"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <Button
              variant="ghost"
              size="icon"
              className="text-foreground hover:bg-foreground/10 rounded-full"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>

          {/* 모바일 드롭다운 메뉴 (유리 효과 적용) */}
          {mobileMenuOpen && (
            <nav className="md:hidden absolute top-full left-0 w-full bg-background/80 backdrop-blur-xl border-t border-border/50 py-4 px-4 space-y-2 shadow-2xl z-50 transition-colors duration-300">
              {baseNavItems.map((item) => (
                <NavLink
                  key={item.label}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `block px-4 py-3 rounded-xl text-sm transition-colors text-center ${
                      isActive
                        ? 'font-bold text-background bg-foreground'
                        : 'font-medium text-foreground hover:bg-foreground/10'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              
              <div className="pt-4 mt-2 border-t border-foreground/10">
                {currentUser ? (
                  <button
                    onClick={handleLogout}
                    className="block w-full text-center px-4 py-3 text-sm font-bold text-foreground bg-foreground/5 rounded-xl hover:bg-foreground/10"
                  >
                    로그아웃
                  </button>
                ) : (
                  <NavLink
                    to={ROUTE_PATHS?.NOTMYPAGE || '/login'}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block w-full text-center px-4 py-3 text-sm font-bold text-foreground bg-foreground/5 rounded-xl hover:bg-foreground/10"
                  >
                    로그인
                  </NavLink>
                )}
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* 메인 컨텐츠 영역 */}
      <main className="flex-1 px-2">{children}</main>

      {/* 🔥 4. 푸터(바닥글)에도 반투명 유리 효과 적용 */}
      <footer className="border-t border-foreground/10 bg-background/20 backdrop-blur-xl pt-10 pb-8 mt-12 transition-colors duration-300">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center md:items-start">
              <div className="flex items-center space-x-2 mb-4">
                <MapPin className="w-5 h-5 text-foreground" />
                <span className="text-xl font-bold text-foreground tracking-tighter" style={{ fontFamily: 'GmarketSansBold' }}>곡곡</span>
              </div>
              <p className="text-sm font-medium text-foreground/60">대한민국 지역 축제를 한눈에</p>
            </div>

            <div className="flex flex-col items-center md:items-start">
              <h3 className="font-bold text-foreground mb-4">바로가기</h3>
              <ul className="space-y-2 text-center md:text-left">
                {baseNavItems.map((item) => (
                  <li key={item.label}>
                    <NavLink to={item.path} className="text-sm font-medium text-foreground/60 hover:text-foreground transition-colors">
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col items-center md:items-start">
              <h3 className="font-bold text-foreground mb-4">소셜 미디어</h3>
              <div className="flex space-x-4">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-foreground/60 hover:text-foreground transition-colors">
                  <SiFacebook className="h-5 w-5" />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-foreground/60 hover:text-foreground transition-colors">
                  <SiInstagram className="h-5 w-5" />
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-foreground/60 hover:text-foreground transition-colors">
                  <SiYoutube className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-foreground/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm font-medium text-foreground/50">© 2026 곡곡(GokGok). All rights reserved.</p>
            <div className="flex gap-6">
              <NavLink to="/terms" className="text-sm font-medium text-foreground/60 hover:text-foreground transition-colors">이용약관</NavLink>
              <NavLink to="/privacy" className="text-sm font-bold text-foreground hover:text-foreground transition-colors">개인정보처리방침</NavLink>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}