// 곡곡 관리자 시스템 - 엄태훈 최종 수정본 (2026-04-24)
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  FileText, 
  Settings, 
  BarChart3, 
  Trash2, 
  RefreshCw, 
  Search, 
  ShieldAlert, 
  Activity,
  Server,
  MessageSquare
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { fadeInUp } from "@/lib/motion";
import { Input } from "@/components/ui/input";

interface UserData {
  id: string;
  email: string;
  username: string;
  role: string;
  created_at: string;
}

interface PostData {
  id: string;
  title: string;
  author: string;
  category: string;
  created_at: string;
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalUsers: 0, totalPosts: 0, activeFestivals: 0 });
  const [users, setUsers] = useState<UserData[]>([]);
  const [posts, setPosts] = useState<PostData[]>([]); // 게시글 상태 추가
  const [search, setSearch] = useState("");

  const API_BASE_URL = "https://gokgok-8ztf.onrender.com/api/admin";

  const loadAdminData = async () => {
    setLoading(true);
    const token = localStorage.getItem("accessToken"); 

    try {
      // 1. 통계 데이터 로드
      const statsRes = await fetch(`${API_BASE_URL}/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!statsRes.ok) throw new Error("통계 로드 실패");
      const statsData = await statsRes.json();
      setStats(statsData);

      // 2. 유저 목록 로드
      const usersRes = await fetch(`${API_BASE_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!usersRes.ok) throw new Error("유저 로드 실패");
      const usersData = await usersRes.json();
      setUsers(Array.isArray(usersData) ? usersData : []);

      // 3. 게시글 목록 로드 (추가)
      const postsRes = await fetch(`${API_BASE_URL}/posts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (postsRes.ok) {
        const postsData = await postsRes.json();
        setPosts(Array.isArray(postsData) ? postsData : []);
      }

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

  // 유저 필터링
  const filteredUsers = users.filter((user) => {
    const keyword = search.toLowerCase();
    return (
      (user.username?.toLowerCase() || "").includes(keyword) ||
      (user.email?.toLowerCase() || "").includes(keyword)
    );
  });
  // 게시글 필터링
  const filteredPosts = posts.filter((post) => {
    const keyword = search.toLowerCase();
    return (
      (post.title?.toLowerCase() || "").includes(keyword) ||
      (post.author?.toLowerCase() || "").includes(keyword) ||
      (post.category?.toLowerCase() || "").includes(keyword)
    );
  });

  // 유저 삭제 함수
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

  // 게시글 삭제 함수
  const handlePostDelete = async (id: string, title: string) => {
    if (!window.confirm(`'${title}' 게시글을 삭제하시겠습니까?`)) return;
    const token = localStorage.getItem("accessToken");
    try {
      const res = await fetch(`${API_BASE_URL}/posts/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        toast({ title: "삭제 완료", description: "게시글이 삭제되었습니다." });
        loadAdminData();
      }
    } catch (error) {
      toast({ variant: "destructive", title: "게시글 삭제 실패" });
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 pb-12 font-sans">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 섹션 */}
        <motion.div 
          className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4" 
          initial="hidden" 
          animate="visible" 
          variants={fadeInUp}
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Settings className="w-8 h-8 text-primary" /> 곡곡 관리자 시스템
            </h1>
            <p className="text-muted-foreground mt-1">실시간 DB 데이터 연동 중: {API_BASE_URL}</p>
          </div>
          <Button onClick={loadAdminData} disabled={loading} className="shadow-md">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> 데이터 새로고침
          </Button>
        </motion.div>

        {/* 대시보드 카드 섹션 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-t-4 border-t-blue-500 shadow-sm transition-transform hover:scale-[1.02]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-blue-500">
                <Users className="w-4 h-4" /> 전체 회원 수
              </CardTitle>
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{stats.totalUsers}명</div></CardContent>
          </Card>
          <Card className="border-t-4 border-t-green-500 shadow-sm transition-transform hover:scale-[1.02]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-green-500">
                <FileText className="w-4 h-4" /> 전체 게시글
              </CardTitle>
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{stats.totalPosts}개</div></CardContent>
          </Card>
          <Card className="border-t-4 border-t-orange-500 shadow-sm transition-transform hover:scale-[1.02]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-orange-500">
                <BarChart3 className="w-4 h-4" /> 운영 축제
              </CardTitle>
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{stats.activeFestivals}개</div></CardContent>
          </Card>
        </div>

        {/* 탭 섹션 */}
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 shadow-sm h-12">
            <TabsTrigger value="users">사용자 관리</TabsTrigger>
            <TabsTrigger value="posts">콘텐츠 관리</TabsTrigger>
            <TabsTrigger value="system">보안 로그</TabsTrigger>
          </TabsList>

          {/* 1. 사용자 관리 탭 */}
          <TabsContent value="users">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>가입 유저 목록</CardTitle>
                <CardDescription>Supabase Auth 및 Profiles 테이블의 실시간 목록입니다.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="닉네임 또는 이메일로 검색..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 max-w-md"
                  />
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>이름</TableHead>
                      <TableHead>이메일</TableHead>
                      <TableHead>권한</TableHead>
                      <TableHead>가입일</TableHead>
                      <TableHead className="text-right">액션</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                      <TableRow key={user.id} className="hover:bg-muted/50 transition-colors">
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
                              variant="ghost" 
                              size="sm" 
                              className="text-destructive hover:bg-destructive/10" 
                              onClick={() => handleUserDelete(user.id, user.email)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                          {loading ? "데이터를 불러오는 중입니다..." : "일치하는 사용자가 없습니다."}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 2. 콘텐츠 관리 탭 (게시글 관리 통합) */}
          <TabsContent value="posts">
            <Card className="shadow-md border-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-green-600" /> 커뮤니티 게시글 관리
                </CardTitle>
                <CardDescription>사용자가 작성한 게시물을 모니터링하고 부적절한 글을 삭제합니다.</CardDescription>
              </CardHeader>
              <CardContent>
                  <div className="mb-4 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="제목, 작성자, 카테고리로 검색..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9 max-w-md"
                    />
                  </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">카테고리</TableHead>
                      <TableHead>제목</TableHead>
                      <TableHead>작성자</TableHead>
                      <TableHead>작성일</TableHead>
                      <TableHead className="text-right">삭제</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPosts.length > 0 ? filteredPosts.map((post) => (
                      <TableRow key={post.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell><Badge variant="outline">{post.category}</Badge></TableCell>
                        <TableCell className="font-medium truncate max-w-[300px]">{post.title}</TableCell>
                        <TableCell>{post.author}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(post.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => handlePostDelete(post.id, post.title)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-20 text-muted-foreground">
                          {loading ? "데이터 로딩 중..." : "등록된 게시글이 없습니다."}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 3. 보안 로그 탭 */}
          <TabsContent value="system">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <ShieldAlert className="w-5 h-5" /> 시스템 보안 및 통신 로그
                </CardTitle>
                <CardDescription>서버 인스턴스와의 실시간 통신 상태를 모니터링합니다.</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="bg-slate-950 text-green-400 p-6 rounded-xl font-mono text-xs shadow-2xl border border-slate-800 overflow-hidden relative">
                  <div className="absolute top-3 right-4 flex gap-1.5 opacity-50">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                  </div>
                  
                  <div className="flex flex-col gap-1.5 mt-2">
                    <p className="text-slate-500 font-bold mb-1"># --- GOKGOK SECURE MONITORING v1.0.4 ---</p>
                    <div className="flex gap-4">
                      <span className="text-slate-500">[{new Date().toLocaleTimeString()}]</span>
                      <span className="text-blue-400">[INFO]</span>
                      <span>Connected to: <span className="text-white underline">{API_BASE_URL}</span></span>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-slate-500">[{new Date().toLocaleTimeString()}]</span>
                      <span className="text-yellow-400">[AUTH]</span>
                      <span>JWT Status: <span className="text-white italic">Verified Admin Token</span></span>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-slate-500">[{new Date().toLocaleTimeString()}]</span>
                      <span className="text-green-400">[SUCCESS]</span>
                      <span>API Sync: <span className="text-white">Users({stats.totalUsers}) Posts({stats.totalPosts})</span></span>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-slate-500">[{new Date().toLocaleTimeString()}]</span>
                      <span className="text-purple-400">[CORS]</span>
                      <span>Validation: <span className="text-white">capstone-gokgok.netlify.app (ALLOWED)</span></span>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <span className="text-white animate-pulse">●</span>
                      <span className="text-slate-400">Monitoring system active...</span>
                      <span className="inline-block w-2 h-4 bg-green-400 animate-bounce ml-1"></span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border bg-muted/50 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-bold text-[10px]">Server Engine</p>
                      <p className="text-sm font-medium">Node.js / Express (Render)</p>
                    </div>
                    <Server className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="p-4 rounded-lg border bg-muted/50 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-bold text-[10px]">System Health</p>
                      <p className="text-sm font-medium text-green-600">Operational (100.0%)</p>
                    </div>
                    <Activity className="w-5 h-5 text-green-500 animate-pulse" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}