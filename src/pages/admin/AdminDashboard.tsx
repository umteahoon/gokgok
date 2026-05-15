/**
 * 곡곡 관리자 시스템 대시보드 (통합 관제 시스템 최종본)
 * 작성자: 엄태훈 (2026-05-15 업데이트)
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
  MessageSquare,
  Clock,
  CheckCircle2,
  Send 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { fadeInUp } from "@/lib/motion";
import { Input } from "@/components/ui/input";

// 데이터 인터페이스
interface UserData { id: string; email: string; username: string; role: string; created_at: string; }
interface PostData { id: string; title: string; author: string; category: string; created_at: string; }
interface SecurityLog { id: string; user_email: string; violation_type: string; request_count: number; created_at: string; }
interface ContactData { id: string; name: string; email: string; category: string; message: string; status: string; reply_content?: string; created_at: string; }

export default function AdminDashboard() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalUsers: 0, totalPosts: 0, activeFestivals: 0 });
  const [users, setUsers] = useState<UserData[]>([]);
  const [posts, setPosts] = useState<PostData[]>([]);
  const [contacts, setContacts] = useState<ContactData[]>([]);
  const [dbLogs, setDbLogs] = useState<SecurityLog[]>([]);
  const [search, setSearch] = useState("");
  const [searchPosts, setSearchPosts] = useState("");

  const API_BASE_URL = "https://gokgok-8ztf.onrender.com/api/admin";

  const loadAdminData = async () => {
    setLoading(true);
    const token = localStorage.getItem("accessToken"); 

    try {
      // ✅ 문의사항 목록 조회를 /contacts/all 로 명확히 호출하여 500 에러 방지
      const [statsRes, usersRes, postsRes, logsRes, contactRes] = await Promise.all([
        fetch(`${API_BASE_URL}/stats`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/users`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/posts`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/security-logs`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/contacts/all`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      setStats(await statsRes.json());
      setUsers(await usersRes.json());
      setPosts(postsRes.ok ? await postsRes.json() : []);
      setDbLogs(logsRes.ok ? await logsRes.json() : []);
      
      if (contactRes.ok) {
        const contactData = await contactRes.json();
        setContacts(contactData.success ? contactData.data : []);
      } else {
        setContacts([]);
      }

    } catch (error: any) {
      console.error("데이터 로드 중 오류 발생:", error);
      toast({ variant: "destructive", title: "데이터 로드 오류", description: "인증이 만료되었거나 권한이 없습니다." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
    const interval = setInterval(loadAdminData, 30000);
    return () => clearInterval(interval);
  }, []);

  /**
   * ✅ 관리자 답변 처리 핸들러 수정
   * 경로: PUT /api/admin/contacts/:id/reply
   */
  const handleReply = async (id: string, name: string) => {
    const reply = prompt(`${name}님에게 보낼 답변 내용을 입력하세요.`);
    if (!reply) return;

    try {
      const res = await fetch(`${API_BASE_URL}/contacts/${id}/reply`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("accessToken")}` 
        },
        body: JSON.stringify({ reply_content: reply })
      });
      
      const result = await res.json();
      if (result.success) {
        toast({ title: "답변 전송 완료", description: "사용자에게 답변이 전달되었습니다." });
        loadAdminData(); 
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      toast({ variant: "destructive", title: "오류 발생", description: "답변 처리 중 문제가 발생했습니다." });
    }
  };

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
            <p className="text-muted-foreground mt-1 text-sm font-mono tracking-tighter">Security Monitoring Active</p>
          </div>
          <Button onClick={loadAdminData} disabled={loading} variant={dbLogs.length > 0 ? "destructive" : "default"} className="shadow-md">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> 데이터 새로고침
          </Button>
        </motion.div>

        {/* 통계 요약 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-t-4 border-t-blue-500 shadow-sm"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2 text-blue-500"><Users className="w-4 h-4" /> 전체 회원 수</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats.totalUsers}명</div></CardContent></Card>
          <Card className="border-t-4 border-t-green-500 shadow-sm"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2 text-green-600"><FileText className="w-4 h-4" /> 전체 게시글</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats.totalPosts}개</div></CardContent></Card>
          <Card className="border-t-4 border-t-orange-500 shadow-sm"><CardHeader className="pb-2"><CardTitle className="text-sm font-medium flex items-center gap-2 text-orange-500"><BarChart3 className="w-4 h-4" /> 운영 축제</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats.activeFestivals}개</div></CardContent></Card>
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 shadow-sm h-12">
            <TabsTrigger value="users">사용자 관리</TabsTrigger>
            <TabsTrigger value="posts">콘텐츠 관리</TabsTrigger>
            <TabsTrigger value="contact">문의사항</TabsTrigger>
            <TabsTrigger value="system">보안 로그</TabsTrigger>
          </TabsList>

          {/* 사용자 관리 탭 */}
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

          {/* 콘텐츠 관리 탭 */}
          <TabsContent value="posts">
            <Card className="shadow-md">
              <CardHeader><CardTitle className="flex items-center gap-2 text-green-600"><MessageSquare className="w-5 h-5" /> 커뮤니티 게시글 관리</CardTitle></CardHeader>
              <CardContent>
                <div className="mb-4 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="게시글 검색..." value={searchPosts} onChange={(e) => setSearchPosts(e.target.value)} className="pl-9 max-w-md shadow-inner" />
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

          {/* 💡 문의사항 관리 탭 (답변하기 기능 추가) */}
          <TabsContent value="contact">
            <Card className="shadow-md">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-blue-600"><MessageSquare className="w-5 h-5" /> 문의사항 관리</CardTitle>
                    <CardDescription>사용자 문의를 확인하고 직접 답변을 보낼 수 있습니다.</CardDescription>
                  </div>
                  <Badge variant="secondary" className="px-3 py-1">총 {contacts.length}건 접수</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <Card className="p-4 border shadow-sm flex items-center gap-4">
                    <div className="p-2 bg-orange-100 rounded-lg"><Clock className="w-5 h-5 text-orange-600" /></div>
                    <div><p className="text-xs text-muted-foreground uppercase font-bold">미답변 문의</p><p className="text-xl font-bold">{contacts.filter(c => c.status === 'pending').length}건</p></div>
                  </Card>
                  <Card className="p-4 border shadow-sm flex items-center gap-4">
                    <div className="p-2 bg-green-100 rounded-lg"><CheckCircle2 className="w-5 h-5 text-green-600" /></div>
                    <div><p className="text-xs text-muted-foreground uppercase font-bold">처리 완료</p><p className="text-xl font-bold">{contacts.filter(c => c.status !== 'pending').length}건</p></div>
                  </Card>
                </div>

                <div className="rounded-lg border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="w-[100px]">접수일</TableHead>
                        <TableHead className="w-[120px]">성함</TableHead>
                        <TableHead className="w-[150px]">유형</TableHead>
                        <TableHead>문의 내용</TableHead>
                        <TableHead className="text-right">관리</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contacts.length > 0 ? (
                        contacts.map((contact) => (
                          <TableRow key={contact.id} className="hover:bg-muted/20">
                            <TableCell className="text-[10px] text-muted-foreground">{new Date(contact.created_at).toLocaleDateString()}</TableCell>
                            <TableCell className="font-medium text-xs">{contact.name}</TableCell>
                            <TableCell><Badge variant="secondary" className="text-[10px]">{contact.category}</Badge></TableCell>
                            <TableCell className="text-xs">
                              <p className="max-w-[300px] truncate" title={contact.message}>{contact.message}</p>
                              {contact.reply_content && (
                                <p className="text-[10px] text-blue-600 mt-1 font-semibold">Re: {contact.reply_content}</p>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {contact.status === 'pending' ? (
                                <Button size="sm" variant="outline" className="h-8 gap-1" onClick={() => handleReply(contact.id, contact.name)}>
                                  <Send className="w-3 h-3" /> 답변하기
                                </Button>
                              ) : (
                                <Badge className="bg-green-600 pointer-events-none">처리완료</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow><TableCell colSpan={5} className="h-32 text-center text-muted-foreground">접수된 문의사항이 없습니다.</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 보안 로그 탭 */}
          <TabsContent value="system">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2 text-destructive"><ShieldAlert className="w-5 h-5" /> 실시간 침입 탐지 시스템 (IDS)</CardTitle></CardHeader>
              <CardContent className="pt-4">
                <div className="bg-slate-950 text-green-400 p-6 rounded-xl font-mono text-[11px] shadow-2xl border border-slate-800 relative overflow-hidden min-h-[300px]">
                  <div className="absolute top-3 right-4 flex gap-1.5 opacity-50"><div className="w-2.5 h-2.5 rounded-full bg-red-500"></div><div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div><div className="w-2.5 h-2.5 rounded-full bg-green-500"></div></div>
                  <div className="flex flex-col gap-1.5 mt-2">
                    <p className="text-slate-500 font-bold mb-1"># GOKGOK SECURE SHELL v2.0 ACTIVE</p>
                    {dbLogs.length > 0 ? (
                      dbLogs.map((log) => (
                        <motion.div key={log.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="my-2 p-3 border border-red-500/50 bg-red-950/30 rounded-lg">
                          <p className="text-red-500 font-bold animate-pulse">🚨 [CRITICAL] {log.violation_type}</p>
                          <p className="text-[10px] text-red-400 ml-2">● Source: {log.user_email} | Pattern: HTTP GET ({log.request_count} times)</p>
                        </motion.div>
                      ))
                    ) : (
                      <p className="text-green-500 italic mt-4 animate-pulse">● All systems nominal. No threats detected in database.</p>
                    )}
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