import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, AlertCircle, TrendingUp } from "lucide-react";

const Dashboard = () => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-900">대시보드</h2>
        <p className="text-slate-500">곡곡 서비스의 실시간 현황입니다.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="총 회원 수" value="1,248" icon={<Users className="text-blue-600" />} />
        <StatCard title="오늘 등록된 글" value="14" icon={<FileText className="text-green-600" />} />
        <StatCard title="미처리 신고" value="3" icon={<AlertCircle className="text-red-600" />} />
        <StatCard title="주간 방문자" value="+15%" icon={<TrendingUp className="text-purple-600" />} />
      </div>

      <Card className="border-none shadow-sm bg-white p-6">
        <CardHeader className="px-0">
          <CardTitle>공지사항 및 알림</CardTitle>
        </CardHeader>
        <CardContent className="px-0 pt-2 text-sm text-slate-500">
          시스템 점검이 2026년 4월 5일로 예정되어 있습니다.
        </CardContent>
      </Card>
    </div>
  );
};

const StatCard = ({ title, value, icon }: any) => (
  <Card className="border-none shadow-sm">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-slate-500">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

export default Dashboard;