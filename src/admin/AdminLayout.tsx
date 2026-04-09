import { Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Users, Home, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AdminLayout = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* 사이드바 */}
      <aside className="w-64 bg-slate-900 text-slate-300 p-6 flex flex-col">
        <div className="flex items-center gap-2 mb-10 px-2 text-white">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold">곡</div>
          <span className="text-xl font-bold tracking-tight">Admin Panel</span>
        </div>

        <nav className="flex-1 space-y-1">
          <AdminNavItem icon={<LayoutDashboard size={18} />} label="대시보드" onClick={() => navigate('/admin')} />
          <AdminNavItem icon={<FileText size={18} />} label="콘텐츠 관리" onClick={() => navigate('/admin/content')} />
          <AdminNavItem icon={<Users size={18} />} label="사용자 관리" onClick={() => {}} />
        </nav>

        <div className="pt-6 border-t border-slate-800 space-y-1">
          <AdminNavItem icon={<Home size={18} />} label="메인으로" onClick={() => navigate('/')} />
          <AdminNavItem icon={<LogOut size={18} />} label="로그아웃" onClick={() => {}} color="text-red-400" />
        </div>
      </aside>

      {/* 메인 콘텐츠 영역 */}
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
};

const AdminNavItem = ({ icon, label, onClick, color = "" }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium ${color}`}
  >
    {icon}
    {label}
  </button>
);

export default AdminLayout;