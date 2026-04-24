// 관리자 페이지 엄태훈 - 최종 수정본
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, FileText, Settings, BarChart3, Trash2, RefreshCw, Search} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { fadeInUp } from "@/lib/motion";

interface UserData {
  id: string;
  email: string;
  username: string;
  role: string;
  created_at: string;
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalUsers: 0, totalPosts: 0, activeFestivals: 0 });
  const [users, setUsers] = useState<UserData[]>([]);
  const [search, setSearch] = useState("") // 4/24 검색기능

  const API_BASE_URL = "https://gokgok-8ztf.onrender.com/api/admin";

  const loadAdminData = async () => {
    setLoading(true);
    // [중요 수정] Application 탭에 있는 이름인 'accessToken'으로 가져옵니다.
    const token = localStorage.getItem("accessToken"); 

    try {
      // 1. 통계 데이터 로드
      const statsRes = await fetch(`${API_BASE_URL}/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!statsRes.ok) throw new Error("통계 로드 실패 (401)");
      const statsData = await statsRes.json();
      setStats(statsData);

      // 2. 유저 목록 로드
      const usersRes = await fetch(`${API_BASE_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!usersRes.ok) throw new Error("유저 목록 로드 실패 (401)");
      const usersData = await usersRes.json();
      
      setUsers(Array.isArray(usersData) ? usersData : []);

    } catch (error: any) {
      console.error("데이터 로드 실패:", error);
      toast({
        variant: "destructive",
        title: "데이터 로드 오류",
        description: "인증 세션이 만료되었거나 권한이 없습니다."
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);
  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(search.toLowerCase()) // 4/24 검색기능
  );

  // 유저 삭제 함수 (생략되지 않도록 유지)
  const handleUserDelete = async (id: string, email: string) => {
    if (!window.confirm(`${email} 사용자를 강제 탈퇴시키겠습니까?`)) return;
    const token = localStorage.getItem("accessToken");
    try {
      const res = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast({ title: "처리 완료", description: "사용자가 삭제되었습니다." });
        loadAdminData();
      }
    } catch (error) {
      toast({ variant: "destructive", title: "삭제 실패" });
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 pb-12">
      <div className="container mx-auto px-4 py-8">
        <motion.div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4" initial="hidden" animate="visible" variants={fadeInUp}>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Settings className="w-8 h-8 text-primary" /> 곡곡 관리자 시스템
            </h1>
            <p className="text-muted-foreground mt-1">실시간 DB 데이터 연동 중</p>
          </div>
          <Button onClick={loadAdminData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> 데이터 새로고침
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">전체 회원 수</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{stats.totalUsers}명</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">전체 게시글</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{stats.totalPosts}개</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">운영 축제</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{stats.activeFestivals}개</div></CardContent></Card>
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="users">사용자 관리</TabsTrigger>
            <TabsTrigger value="posts">콘텐츠 관리</TabsTrigger>
            <TabsTrigger value="system">보안 로그</TabsTrigger>
          </TabsList>
          <TabsContent value="users">
            <Card>
              <CardHeader><CardTitle>가입 유저 목록</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader><TableRow>
                    <TableHead>이름</TableHead><TableHead>이메일</TableHead><TableHead>권한</TableHead><TableHead>가입일</TableHead><TableHead className="text-right">액션</TableHead>
                  </TableRow></TableHeader>
                  <TableBody>
                    {users.length > 0 ? users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.username}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell><Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>{user.role}</Badge></TableCell>
                        <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          {user.role !== "ADMIN" && (
                            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleUserDelete(user.id, user.email)}><Trash2 className="w-4 h-4" /></Button>
                          )}
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow><TableCell colSpan={5} className="text-center py-10">데이터가 없습니다.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}