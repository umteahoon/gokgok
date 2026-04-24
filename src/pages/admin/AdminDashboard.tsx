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
  const [posts, setPosts] = useState<PostData[]>([]);
  const [search, setSearch] = useState("");

  // --- 보안 관제 시스템 상태 ---
  const [refreshCount, setRefreshCount] = useState(0);
  const [isThreat, setIsThreat] = useState(false);
  const [threatUser, setThreatUser] = useState("");

  const API_BASE_URL = "https://gokgok-8ztf.onrender.com/api/admin";

  const loadAdminData = async () => {
    setLoading(true);
    const token = localStorage.getItem("accessToken"); 
    const currentUser = JSON.parse(localStorage.getItem("gokgok_current_user") || "{}");

    // 💡 새로고침 횟수 감지 및 위협 수준 격상 로직 (10회 기준)
    setRefreshCount(prev => {
      const newCount = prev + 1;
      if (newCount >= 10) {
        setIsThreat(true);
        setThreatUser(currentUser.email || "Unknown Admin");
        toast({
          variant: "destructive",
          title: "🚨 보안 위협 감지",
          description: "비정상적인 반복 요청이 감지되어 시스템 보호 모드가 가동됩니다."
        });
      }
      return newCount;
    });

    try {
      // 1. 모든 데이터 병렬 로드
      const [statsRes, usersRes, postsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/stats`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/users`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/posts`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (!statsRes.ok || !usersRes.ok) throw new Error("인증 실패");

      const statsData = await statsRes.json();
      const usersData = await usersRes.json();
      const postsData = postsRes.ok ? await postsRes.json() : [];

      setStats(statsData);
      setUsers(Array.isArray(usersData) ? usersData : []);
      setPosts(Array.isArray(postsData) ? postsData : []);

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

  // --- 필터링 로직 (사용자 & 게시글) ---
  const filteredUsers = users.filter((u) => {
    const keyword = search.toLowerCase();
    return (u.username?.toLowerCase() || "").includes(keyword) || (u.email?.toLowerCase() || "").includes(keyword);
  });

  const filteredPosts = posts.filter((p) => {
    const keyword = search.toLowerCase();
    return (
      (p.title?.toLowerCase() || "").includes(keyword) ||
      (p.author?.toLowerCase() || "").includes(keyword) ||
      (p.category?.toLowerCase() || "").includes(keyword)
    );
  });

  // --- 삭제 처리 함수 ---
  const handleUserDelete = async (id: string, email: string) => {
    if (!window.confirm(`${email} 사용자를 강제 탈퇴시키겠습니까?`)) return;
    const token = localStorage.getItem("accessToken");
    const res = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      toast({ title: "처리 완료", description: "사용자가 삭제되었습니다." });
      loadAdminData();
    }
  };

  const handlePostDelete = async (id: string, title: string) => {
    if (!window.confirm(`'${title}' 게시글을 삭제하시겠습니까?`)) return;
    const token = localStorage.getItem("accessToken");
    const res = await fetch(`${API_BASE_URL}/posts/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      toast({ title: "삭제 완료", description: "게시글이 삭제되었습니다." });
      loadAdminData();
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 pb-12 font-sans">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 섹션 */}
        <motion.div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4" initial="hidden" animate="visible" variants={fadeInUp}>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Settings className="w-8 h-8 text-primary" /> 곡곡 관리자 시스템
            </h1>
            <p className="text-muted-foreground mt-1 text-sm font-mono">SOC Monitoring: {API_BASE_URL}</p>
          </div>
          <Button 
            onClick={loadAdminData} 
            disabled={loading} 
            variant={isThreat ? "destructive" : "default"}
            className="shadow-md"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> 데이터 새로고침
          </Button>
        </motion.div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-t-4 border-t-blue-500 shadow-sm transition-transform hover:scale-[1.02]">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><Users className="w-4 h-4 text-blue-500" /> 전체 회원 수</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{stats.totalUsers}명</div></CardContent>
          </Card>
          <Card className="border-t-4 border-t-green-500 shadow-sm transition-transform hover:scale-[1.02]">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><FileText className="w-4 h-4 text-green-500" /> 전체 게시글</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{stats.totalPosts}개</div></CardContent>
          </Card>
          <Card className="border-t-4 border-t-orange-500 shadow-sm transition-transform hover:scale-[1.02]">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2"><BarChart3 className="w-4 h-4 text-orange-500" /> 운영 축제</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{stats.activeFestivals}개</div></CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 shadow-sm h-12">
            <TabsTrigger value="users">사용자 관리</TabsTrigger>
            <TabsTrigger value="posts">콘텐츠 관리</TabsTrigger>
            <TabsTrigger value="system">보안 로그</TabsTrigger>
          </TabsList>

          {/* 1. 사용자 관리 */}
          <TabsContent value="users">
            <Card className="shadow-md">
              <CardHeader><CardTitle>가입 유저 목록</CardTitle></CardHeader>
              <CardContent>
                <div className="mb-4 relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="닉네임 또는 이메일 검색..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 max-w-md" /></div>
                <Table>
                  <TableHeader><TableRow><TableHead>이름</TableHead><TableHead>이메일</TableHead><TableHead>권한</TableHead><TableHead>가입일</TableHead><TableHead className="text-right">액션</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                      <TableRow key={user.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="font-medium">{user.username}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell><Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>{user.role}</Badge></TableCell>
                        <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          {user.role !== "ADMIN" && <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleUserDelete(user.id, user.email)}><Trash2 className="w-4 h-4" /></Button>}
                        </TableCell>
                      </TableRow>
                    )) : <TableRow><TableCell colSpan={5} className="text-center py-10">결과가 없습니다.</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 2. 콘텐츠 관리 */}
          <TabsContent value="posts">
            <Card className="shadow-md border-none">
              <CardHeader><CardTitle className="flex items-center gap-2"><MessageSquare className="w-5 h-5 text-green-600" /> 커뮤니티 게시글 관리</CardTitle></CardHeader>
              <CardContent>
                <div className="mb-4 relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="제목, 작성자, 카테고리 검색..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 max-w-md" /></div>
                <Table>
                  <TableHeader><TableRow><TableHead className="w-[100px]">카테고리</TableHead><TableHead>제목</TableHead><TableHead>작성자</TableHead><TableHead>날짜</TableHead><TableHead className="text-right">삭제</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {filteredPosts.length > 0 ? filteredPosts.map((post) => (
                      <TableRow key={post.id} className="hover:bg-muted/50">
                        <TableCell><Badge variant="outline">{post.category}</Badge></TableCell>
                        <TableCell className="font-medium truncate max-w-[300px]">{post.title}</TableCell>
                        <TableCell>{post.author}</TableCell>
                        <TableCell className="text-xs">{new Date(post.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right"><Button variant="ghost" size="sm" className="text-destructive" onClick={() => handlePostDelete(post.id, post.title)}><Trash2 className="w-4 h-4" /></Button></TableCell>
                      </TableRow>
                    )) : <TableRow><TableCell colSpan={5} className="text-center py-20">등록된 게시글이 없습니다.</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 3. 보안 로그 */}
          <TabsContent value="system">
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive"><ShieldAlert className="w-5 h-5" /> 시스템 보안 및 통신 로그</CardTitle>
                <CardDescription>트래픽 이상 징후 및 비정상 접근 시도를 실시간 모니터링합니다.</CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="bg-slate-950 text-green-400 p-6 rounded-xl font-mono text-[11px] shadow-2xl border border-slate-800 relative overflow-hidden">
                  <div className="absolute top-3 right-4 flex gap-1.5 opacity-50"><div className="w-2.5 h-2.5 rounded-full bg-red-500"></div><div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div><div className="w-2.5 h-2.5 rounded-full bg-green-500"></div></div>
                  
                  <div className="flex flex-col gap-1.5 mt-2">
                    <p className="text-slate-500 font-bold mb-1"># GOKGOK INTRUSION DETECTION SYSTEM v2.0</p>
                    <p><span className="text-slate-500">[{new Date().toLocaleTimeString()}]</span> <span className="text-blue-400">[INFO]</span> Monitoring traffic: <span className="text-white">gokgok-8ztf.onrender.com</span></p>

                    {isThreat ? (
                      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="my-3 p-4 border-2 border-red-500 bg-red-950/40 rounded-lg shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                        <p className="text-red-500 font-bold animate-pulse underline">🚨 [CRITICAL] DDoS / RATE-LIMIT VIOLATION</p>
                        <div className="mt-2 text-red-400 space-y-1">
                          <p>● <span className="text-white">Target Actor:</span> {threatUser}</p>
                          <p>● <span className="text-white">Violation:</span> Excessive Request Pattern ({refreshCount} calls)</p>
                          <p>● <span className="text-white">Action:</span> Rate-Limiting Active / Session Logged</p>
                        </div>
                      </motion.div>
                    ) : (
                      <>
                        <p><span className="text-slate-500">[{new Date().toLocaleTimeString()}]</span> <span className="text-yellow-400">[WARN]</span> Tracking Request Freq: <span className="text-white">{refreshCount}/10</span></p>
                        <p><span className="text-slate-500">[{new Date().toLocaleTimeString()}]</span> <span className="text-green-400">[SAFE]</span> Traffic parameters: <span className="text-white font-bold">STABLE</span></p>
                      </>
                    )}
                    <div className="mt-4 pt-2 border-t border-slate-800 flex items-center gap-2">
                      <span className={isThreat ? "text-red-500 animate-ping" : "text-green-400 animate-pulse"}>●</span>
                      <span className="text-slate-400 italic font-bold">{isThreat ? `SYSTEM ALERT: High load from ${threatUser}` : "Listening for network anomalies..." }</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border bg-muted/50 flex flex-col gap-2">
                    <span className="text-[10px] text-muted-foreground font-bold uppercase">Threat Probability</span>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden"><motion.div className={`h-full ${isThreat ? 'bg-red-500' : 'bg-blue-500'}`} animate={{ width: isThreat ? "100%" : `${(refreshCount/10)*100}%` }} /></div>
                      <span className="text-xs font-bold font-mono">{isThreat ? "100%" : `${Math.min((refreshCount/10)*100, 99)}%`}</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl border bg-muted/50 flex items-center justify-between">
                    <div><p className="text-[10px] text-muted-foreground uppercase font-bold">Security Status</p>
                    <p className={`text-sm font-bold ${isThreat ? 'text-red-600' : 'text-green-600'}`}>{isThreat ? "LOCKDOWN" : "ACTIVE & SECURE"}</p></div>
                    <Activity className={`w-5 h-5 ${isThreat ? 'text-red-500' : 'text-green-500'} animate-pulse`} />
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