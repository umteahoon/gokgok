/**
 * 곡곡 관리자 시스템 대시보드 (통합 관제 시스템 최종본)
 * 작성자: 엄태훈 (2026-04-24)
 * 주요기능: 
 * 1. 실시간 통계 및 유저/게시글 관리
 * 2. 세션 기반 비정상 새로고침 감지 및 서버 로그 통합 (DB 연동)
 * 3. 통합 검색 및 중앙 집중식 보안 관제 로그 출력
 */

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
  MessageSquare
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { fadeInUp } from "@/lib/motion";
import { Input } from "@/components/ui/input";

// 데이터 인터페이스 정의
interface UserData { id: string; email: string; username: string; role: string; created_at: string; }
interface PostData { id: string; title: string; author: string; category: string; created_at: string; }
interface SecurityLog { id: string; user_email: string; violation_type: string; request_count: number; created_at: string; }

export default function AdminDashboard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalUsers: 0, totalPosts: 0, activeFestivals: 0 });
  const [users, setUsers] = useState<UserData[]>([]);
  const [posts, setPosts] = useState<PostData[]>([]);
  const [dbLogs, setDbLogs] = useState<SecurityLog[]>([]); // DB에서 가져온 통합 로그
  const [search, setSearch] = useState("");
  const [searchPosts, setSearchPosts] = useState("");

  // --- [로컬 보안 상태] 본인의 세션 감시용 ---
  const [refreshCount, setRefreshCount] = useState(() => Number(sessionStorage.getItem("gokgok_refresh_count") || 0));
  const [isThreat, setIsThreat] = useState(() => sessionStorage.getItem("gokgok_is_threat") === "true");

  const API_BASE_URL = "https://gokgok-8ztf.onrender.com/api/admin";

  /**
   * 서버로부터 관리자 데이터 및 통합 보안 로그를 로드합니다.
   */
  const loadAdminData = async () => {
    setLoading(true);
    const token = localStorage.getItem("accessToken"); 

    try {
      // 통계, 유저, 게시글, 그리고 DB 보안 로그를 병렬로 호출
      const [statsRes, usersRes, postsRes, logsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/stats`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/users`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/posts`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/security-logs`, { headers: { Authorization: `Bearer ${token}` } }) // 신규 API
      ]);

      if (!statsRes.ok || !usersRes.ok) throw new Error("인증 실패");

      setStats(await statsRes.json());
      setUsers(await usersRes.json());
      setPosts(postsRes.ok ? await postsRes.json() : []);
      setDbLogs(logsRes.ok ? await logsRes.json() : []); // 서버 로그 저장

    } catch (error: any) {
      console.error("데이터 로드 중 오류 발생:", error);
      toast({ variant: "destructive", title: "데이터 로드 오류", description: "인증이 만료되었거나 권한이 없습니다." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
    // 30초마다 보안 로그 자동 갱신 (실시간 관제 느낌)
    const interval = setInterval(loadAdminData, 30000);
    return () => clearInterval(interval);
  }, []);

  // 검색 필터링
  const filteredUsers = users.filter((u) => (u.username?.toLowerCase() || "").includes(search.toLowerCase()) || (u.email?.toLowerCase() || "").includes(search.toLowerCase()));
  const filteredPosts = posts.filter((p) => 
  (p.title?.toLowerCase() || "").includes(searchPosts.toLowerCase()) || 
  (p.author?.toLowerCase() || "").includes(searchPosts.toLowerCase()) ||
  (p.category?.toLowerCase() || "").includes(searchPosts.toLowerCase())

);

  const handleUserDelete = async (id: string, email: string) => {
    if (!window.confirm(`${email} 사용자를 강제 탈퇴시키겠습니까?`)) return;
    const res = await fetch(`${API_BASE_URL}/users/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` } });
    if (res.ok) { toast({ title: "처리 완료", description: "사용자가 삭제되었습니다." }); loadAdminData(); }
  };

  const handlePostDelete = async (id: string, title: string) => {
    if (!window.confirm(`'${title}' 게시글을 삭제하시겠습니까?`)) return;
    const res = await fetch(`${API_BASE_URL}/posts/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` } });
    if (res.ok) { toast({ title: "삭제 완료", description: "게시글이 성공적으로 제거되었습니다." }); loadAdminData(); }
  };

  return (
    <div className="min-h-screen bg-muted/30 pb-12 font-sans">
      <div className="container mx-auto px-4 py-8">
        {/* 상단 헤더 */}
        <motion.div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4" initial="hidden" animate="visible" variants={fadeInUp}>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Settings className="w-8 h-8 text-primary" /> 곡곡 관리자 시스템
            </h1>
            <p className="text-muted-foreground mt-1 text-sm font-mono tracking-tighter">Security Monitoring: {API_BASE_URL}</p>
          </div>
          <Button onClick={loadAdminData} disabled={loading} variant={dbLogs.length > 0 ? "destructive" : "default"} className="shadow-md">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> 데이터 새로고침
          </Button>
        </motion.div>

        {/* 통계 요약 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-t-4 border-t-blue-500 shadow-sm transition-transform hover:scale-[1.01]"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2 text-blue-500"><Users className="w-4 h-4" /> 전체 회원 수</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats.totalUsers}명</div></CardContent></Card>
          <Card className="border-t-4 border-t-green-500 shadow-sm transition-transform hover:scale-[1.01]"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2 text-green-600"><FileText className="w-4 h-4" /> 전체 게시글</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats.totalPosts}개</div></CardContent></Card>
          <Card className="border-t-4 border-t-orange-500 shadow-sm transition-transform hover:scale-[1.01]"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2 text-orange-500"><BarChart3 className="w-4 h-4" /> 운영 축제</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats.activeFestivals}개</div></CardContent></Card>
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 shadow-sm h-12">
            <TabsTrigger value="users">사용자 관리</TabsTrigger>
            <TabsTrigger value="posts">콘텐츠 관리</TabsTrigger>
            <TabsTrigger value="system">보안 로그</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader><CardTitle>가입 유저 목록</CardTitle></CardHeader>
              <CardContent>
                <div className="mb-4 relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="검색..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 max-w-md shadow-inner" /></div>
                <Table>
                  <TableHeader><TableRow><TableHead>이름</TableHead><TableHead>이메일</TableHead><TableHead>권한</TableHead><TableHead>가입일</TableHead><TableHead className="text-right">액션</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="font-medium">{user.username}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell><Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>{user.role}</Badge></TableCell>
                        <TableCell className="text-xs">{new Date(user.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">{user.role !== "ADMIN" && <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleUserDelete(user.id, user.email)}><Trash2 className="w-4 h-4" /></Button>}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="posts">
            <Card className="shadow-md">
              <CardHeader><CardTitle className="flex items-center gap-2 text-green-600"><MessageSquare className="w-5 h-5" /> 커뮤니티 게시글 관리</CardTitle></CardHeader>
              <CardContent>
                <div className="mb-4 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="게시글 검색..."
                    value={searchPosts}
                    onChange={(e) => setSearchPosts(e.target.value)}
                    className="pl-9 max-w-md shadow-inner"
                  />
                </div>
                <Table>
                  <TableHeader><TableRow><TableHead>카테고리</TableHead><TableHead>제목</TableHead><TableHead>작성자</TableHead><TableHead className="text-right">삭제</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {filteredPosts.map((post) => (
                      <TableRow key={post.id} className="hover:bg-muted/50">
                        <TableCell><Badge variant="outline">{post.category}</Badge></TableCell>
                        <TableCell className="font-medium truncate max-w-[300px]">{post.title}</TableCell>
                        <TableCell>{post.author}</TableCell>
                        <TableCell className="text-right"><Button variant="ghost" size="sm" className="text-destructive" onClick={() => handlePostDelete(post.id, post.title)}><Trash2 className="w-4 h-4" /></Button></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-destructive"><ShieldAlert className="w-5 h-5" /> 실시간 침입 탐지 시스템 (IDS)</CardTitle></CardHeader>
              <CardContent className="pt-4">
                <div className="bg-slate-950 text-green-400 p-6 rounded-xl font-mono text-[11px] shadow-2xl border border-slate-800 relative overflow-hidden min-h-[300px]">
                  <div className="absolute top-3 right-4 flex gap-1.5 opacity-50"><div className="w-2.5 h-2.5 rounded-full bg-red-500"></div><div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div><div className="w-2.5 h-2.5 rounded-full bg-green-500"></div></div>
                  
                  <div className="flex flex-col gap-1.5 mt-2">
                    <p className="text-slate-500 font-bold mb-1"># GOKGOK SECURE SHELL v2.0 ACTIVE (Centralized Logging)</p>
                    <p><span className="text-slate-500">[{new Date().toLocaleTimeString()}]</span> <span className="text-blue-400">[INFO]</span> Listening for global network anomalies...</p>

                    {dbLogs.length > 0 ? (
                      dbLogs.map((log) => (
                        <motion.div key={log.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="my-2 p-3 border border-red-500/50 bg-red-950/30 rounded-lg">
                          <p className="text-red-500 font-bold animate-pulse">🚨 [CRITICAL] {log.violation_type}</p>
                          <div className="mt-1 text-red-400 space-y-1 ml-2">
                            <p>● <span className="text-white">Attack Source:</span> {log.user_email}</p>
                            <p>● <span className="text-white">Packet Pattern:</span> HTTP GET ({log.request_count} times)</p>
                            <p>● <span className="text-white">Timestamp:</span> {new Date(log.created_at).toLocaleString()}</p>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <p className="text-green-500 italic mt-4 animate-pulse">● All systems nominal. No threats detected in database.</p>
                    )}
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border bg-muted/50 flex flex-col gap-2 shadow-inner">
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest text-center">Global Threat Indicator</span>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2.5 bg-slate-200 rounded-full overflow-hidden">
                        <motion.div className={`h-full ${dbLogs.length > 0 ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' : 'bg-blue-500'}`} animate={{ width: dbLogs.length > 0 ? "100%" : "0%" }} />
                      </div>
                      <span className="text-[10px] font-mono font-bold">{dbLogs.length > 0 ? "100%" : "0%"}</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl border bg-muted/50 flex items-center justify-between shadow-inner">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">System Status</p>
                      <p className={`text-sm font-bold ${dbLogs.length > 0 ? 'text-red-600' : 'text-green-600'}`}>{dbLogs.length > 0 ? "SYSTEM LOCKDOWN" : "SECURE & STABLE"}</p>
                    </div>
                    <Activity className={`w-5 h-5 ${dbLogs.length > 0 ? 'text-red-500' : 'text-green-500'} animate-pulse`} />
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