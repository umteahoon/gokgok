import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Sun, Moon } from 'lucide-react';
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
      <header className="sticky top-0 z-50 w-full border-b border-foreground/15 bg-background/85 backdrop-blur-md py-3 transition-colors duration-300">
        <div className="container mx-auto px-4 relative flex flex-col items-center">
          
          <div className="hidden md:flex items-center gap-3 absolute top-1 right-4">
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

          {/* ======================================================= */}
          {/* 수정된 로고 영역: 버튼 안에 '곡곡', 아래쪽 텍스트 삭제 완료 */}
          {/* ======================================================= */}
          <NavLink to={ROUTE_PATHS?.HOME || '/'} className="flex flex-col items-center justify-center group mb-2 mt-1">
            <div className="flex items-center justify-center px-2 py-1 border-[1.5px] border-foreground text-foreground font-bold text-base rounded-md group-hover:bg-foreground group-hover:text-background transition-colors">
              곡곡
            </div>
          </NavLink>

          <nav className="hidden md:flex items-center justify-center space-x-16">
            {baseNavItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.path}
                className={({ isActive }) =>
                  `py-0.5 text-sm transition-all ${
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

          <div className="md:hidden absolute right-4 top-0 flex items-center gap-2">
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
              
              <div className="pt-2 mt-1 border-t border-foreground/10">
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