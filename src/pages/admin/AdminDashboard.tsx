// 관리자 페이지 엄태훈
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, FileText, Settings, ShieldAlert, BarChart3, Trash2, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { fadeInUp } from "@/lib/motion";

// 관리자 데이터 타입 정의
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
  const [search, setSearch] = useState(""); // 검색 4/24

  // Render 백엔드 주소 설정
  const API_BASE_URL = "https://gokgok-8ztf.onrender.com/api/admin";

  // 데이터 불러오기 함수
  const loadAdminData = async () => {
    setLoading(true);
    const token = localStorage.getItem("token"); // 로그인 시 저장된 토큰

    try {
      // 1. 통계 데이터 가져오기
      const statsRes = await fetch(`${API_BASE_URL}/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!statsRes.ok) throw new Error("통계 데이터를 가져오는데 실패했습니다.");
      const statsData = await statsRes.json();
      setStats(statsData);

      // 2. 유저 목록 가져오기
      const usersRes = await fetch(`${API_BASE_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!usersRes.ok) throw new Error("사용자 목록을 가져오는데 실패했습니다.");
      const usersData = await usersRes.json();
      
      // [수정 포인트] 데이터가 배열인지 확인 후 저장 (o.map 에러 방지)
      if (Array.isArray(usersData)) {
        setUsers(usersData);
      } else {
        setUsers([]);
      }

    } catch (error: any) {
      console.error("데이터 로드 실패:", error);
      toast({
        variant: "destructive",
        title: "데이터 로드 오류",
        description: error.message || "서버로부터 데이터를 가져오지 못했습니다."
      });
      // 에러 발생 시 초기화하여 .map 에러 방지
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const filteredUsers = users.filter(user =>
  user.username.toLowerCase().includes(search.toLowerCase())
  ); // 검색 4/24 

  // 유저 강제 탈퇴 처리
  const handleUserDelete = async (id: string, email: string) => {
    if (!window.confirm(`${email} 사용자를 강제 탈퇴시키겠습니까?`)) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        setUsers(users.filter(user => user.id !== id));
        toast({ title: "처리 완료", description: "사용자가 성공적으로 삭제되었습니다." });
        loadAdminData(); // 통계 갱신
      } else {
        throw new Error("삭제 권한이 없거나 서버 오류입니다.");
      }
    } catch (error: any) {
      toast({ 
        variant: "destructive", 
        title: "삭제 실패", 
        description: error.message 
      });
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 pb-12">
      <div className="container mx-auto px-4 py-8">
        {/* 상단 헤더 */}
        <motion.div 
          className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4"
          initial="hidden" animate="visible" variants={fadeInUp}
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Settings className="w-8 h-8 text-primary" />
              곡곡 관리자 시스템
            </h1>
            <p className="text-muted-foreground mt-1">실시간 DB 데이터 연동 중: {API_BASE_URL}</p>
          </div>
          <Button onClick={loadAdminData} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            데이터 새로고침
          </Button>
        </motion.div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">전체 회원 수</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}명</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">전체 게시글</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPosts}개</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">운영 축제</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeFestivals}개</div>
            </CardContent>
          </Card>
        </div>

        {/* 관리 탭 */}
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="users">사용자 관리</TabsTrigger>
            <TabsTrigger value="posts">콘텐츠 관리</TabsTrigger>
            <TabsTrigger value="system">보안 로그</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>가입 유저 목록</CardTitle>
                <CardDescription>Supabase Auth 및 Profiles 테이블의 실시간 목록입니다.</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="닉네임으로 검색..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                  />
                </div> // 검색 4/24
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>이름(ID)</TableHead>
                      <TableHead>이메일</TableHead>
                      <TableHead>권한</TableHead>
                      <TableHead>가입일</TableHead>
                      <TableHead className="text-right">액션</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* [보안 및 안정성 강화] users가 배열일 때만 렌더링 */}
                    {Array.isArray(users) && users.length > 0 ? (
                      users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.username}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            {user.role !== "ADMIN" && (
                              <Button 
                                variant="ghost" size="sm" className="text-destructive"
                                onClick={() => handleUserDelete(user.id, user.email)}
                              >
                                <Trash2 className="w-4 h-4 mr-1" /> 탈퇴
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-10 text-muted-foreground"> 
                          {loading ? "데이터를 불러오는 중입니다..." : "표시할 사용자 데이터가 없습니다."}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="posts">
            <Card>
              <CardHeader><CardTitle>준비 중</CardTitle></CardHeader>
              <CardContent className="py-20 text-center text-muted-foreground">
                게시물 관리 API를 연결해 주세요.
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system">
            <Card>
              <CardContent className="pt-6">
                <div className="bg-black text-green-400 p-4 rounded-md font-mono text-xs">
                  <p>[SYSTEM] Connected to {API_BASE_URL}</p>
                  <p>[AUTH] Admin Session Verified</p>
                  <p>[INFO] Data sync completed at {new Date().toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}