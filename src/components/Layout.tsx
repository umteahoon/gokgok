import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
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
  const navigate = useNavigate();

  // 유저 정보 상태를 최신화하는 함수
  const updateUserStatus = () => {
    const user = getCurrentUser();
    setCurrentUser(user);
  };

  useEffect(() => {
    // 1. 초기 로드 시 유저 상태 확인
    updateUserStatus();

    // 2. URL 변경 및 커스텀 이벤트 감지 (로그인/로그아웃 성공 시 발생)
    window.addEventListener('hashchange', updateUserStatus);
    window.addEventListener('auth-change', updateUserStatus);

    return () => {
      window.removeEventListener('hashchange', updateUserStatus);
      window.removeEventListener('auth-change', updateUserStatus);
    };
  }, []);

  const baseNavItems = [
    { label: '홈', path: ROUTE_PATHS.HOME },
    { label: '찾기', path: ROUTE_PATHS.SEARCH },
    { label: '커뮤니티', path: ROUTE_PATHS.COMMUNITY },
    { label: '내 정보', path: ROUTE_PATHS.MYPAGE },
  ];

  // 로그인 여부에 따른 동적 메뉴 구성
  const navItems = currentUser 
    ? baseNavItems 
    : [...baseNavItems, { label: '로그인', path: ROUTE_PATHS.NOTMYPAGE }];

  // 로그아웃 핸들러: 여기서만 확인 창을 관리합니다.
  const handleLogout = () => {
    // 1. 브라우저 확인 창을 띄웁니다.
    if (window.confirm("로그아웃 하시겠습니까?")) {
      // 2. "확인"을 눌렀을 때만 로그아웃 로직 실행
      logout(); 
      updateUserStatus(); // 현재 레이아웃 UI 즉시 업데이트
      
      // 3. 홈으로 이동 (원하는 경우 현재 페이지 유지를 위해 이 줄을 삭제해도 됩니다)
      navigate(ROUTE_PATHS.HOME); 
      
      // 4. 모바일 메뉴가 열려있다면 닫기
      setMobileMenuOpen(false);
      
      // 성공 알림 (선택 사항)
      alert("로그아웃 되었습니다.");
    }
    // "취소"를 누르면 아무 일도 일어나지 않고 현재 페이지에 유지됩니다.
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <NavLink to={ROUTE_PATHS.HOME} className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold text-lg">
                곡
              </div>
              <span className="text-xl font-bold text-foreground">곡곡</span>
              <span className="text-sm text-muted-foreground hidden sm:inline">GokGok</span>
            </NavLink>

            {/* 데스크톱 네비게이션 */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              
              {/* 로그인 상태일 때 로그아웃 버튼 표시 */}
              {currentUser && (
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-md text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  로그아웃
                </button>
              )}
            </nav>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>

          {/* 모바일 메뉴 */}
          {mobileMenuOpen && (
            <nav className="md:hidden py-4 space-y-2 border-t border-border">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `block px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              {currentUser && (
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 rounded-md text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  로그아웃
                </button>
              )}
            </nav>
          )}
        </div>
      </header>

      <main className="flex-1 px-2 ">{children}</main>

      <footer className="border-t border-border bg-muted/30 pt-8 pb-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                  곡
                </div>
                <span className="text-lg font-bold text-foreground">곡곡</span>
              </div>
              <p className="text-sm text-muted-foreground">대한민국 지역 축제를 한눈에</p>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-4">바로가기</h3>
              <ul className="space-y-2">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <NavLink to={item.path} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-foreground mb-4">소셜 미디어</h3>
              <div className="flex space-x-4">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <SiFacebook className="h-5 w-5" />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <SiInstagram className="h-5 w-5" />
                </a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                  <SiYoutube className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">© 2026 곡곡(GokGok). All rights reserved.</p>
            <div className="flex gap-6">
              <NavLink to="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">이용약관</NavLink>
              <NavLink to="/privacy" className="text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">개인정보처리방침</NavLink>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}