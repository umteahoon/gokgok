/**
 * 곡곡 관리자 시스템 대시보드 (통합 관제 시스템 최종본)
 * 작성자: 엄태훈 (2026-05-15)
 * 수정사항: 백엔드 통합 라우터(/api/contact/admin/...) 경로 완벽 대응
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

// 데이터 인터페이스 정의
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

  // ✅ 백엔드 index.ts 의 구조에 맞춘 베이스 URL 설정
  const API_BASE_URL = "https://gokgok-8ztf.onrender.com/api";

  const loadAdminData = async () => {
    setLoading(true);
    const token = localStorage.getItem("accessToken"); 

    try {
      // ✅ 404 방지를 위한 정밀 경로 호출
      const [statsRes, usersRes, postsRes, logsRes, contactRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/stats`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/admin/users`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/admin/posts`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/admin/security-logs`, { headers: { Authorization: `Bearer ${token}` } }),
        // 🚩 수정: 통합된 contactRouter의 admin 목록 조회 경로
        fetch(`${API_BASE_URL}/contact/admin/all`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (!statsRes.ok || !usersRes.ok) throw new Error("인증이 만료되었습니다.");

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
      console.error("데이터 로드 오류:", error);
      toast({ variant: "destructive", title: "로그인 세션 만료", description: "다시 로그인 해주세요." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
    const interval = setInterval(loadAdminData, 60000); // 1분마다 자동 갱신
    return () => clearInterval(interval);
  }, []);

  /**
   * ✅ 관리자 답변 등록 핸들러
   * 경로: PUT /api/contact/admin/:id/reply
   */
  const handleReply = async (id: string, name: string) => {
    const reply = prompt(`${name}님에게 전달할 답변을 입력하세요.`);
    if (!reply) return;

    try {
      const res = await fetch(`${API_BASE_URL}/contact/admin/${id}/reply`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem("accessToken")}` 
        },
        body: JSON.stringify({ reply_content: reply })
      });
      
      const result = await res.json();
      if (result.success) {
        toast({ title: "답변 완료", description: "사용자에게 답변이 전송되었습니다." });
        loadAdminData(); 
      }
    } catch (err) {
      toast({ variant: "destructive", title: "오류", description: "답변 등록에 실패했습니다." });
    }
  };

  // 검색 필터 로직
  const filteredUsers = users.filter((u) => 
    (u.username?.toLowerCase() || "").includes(search.toLowerCase()) || 
    (u.email?.toLowerCase() || "").includes(search.toLowerCase())
  );
  
  const filteredPosts = posts.filter((p) => 
    (p.title?.toLowerCase() || "").includes(searchPosts.toLowerCase()) || 
    (p.author?.toLowerCase() || "").includes(searchPosts.toLowerCase())
  );

  const handleUserDelete = async (id: string, email: string) => {
    if (!window.confirm(`${email} 사용자를 강제 탈퇴시키겠습니까?`)) return;
    const res = await fetch(`${API_BASE_URL}/admin/users/${id}`, { 
      method: 'DELETE', 
      headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` } 
    });
    if (res.ok) { toast({ title: "삭제 완료" }); loadAdminData(); }
  };

  const handlePostDelete = async (id: string, title: string) => {
    if (!window.confirm(`'${title}' 게시글을 삭제하시겠습니까?`)) return;
    const res = await fetch(`${API_BASE_URL}/admin/posts/${id}`, { 
      method: 'DELETE', 
      headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` } 
    });
    if (res.ok) { toast({ title: "삭제 완료" }); loadAdminData(); }
  };

  return (
    <div className="min-h-screen bg-muted/30 pb-12 font-sans">
      <div className="container mx-auto px-4 py-8">
        {/* 상단 헤더 영역 */}
        <motion.div 
          className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4" 
          initial="hidden" animate="visible" variants={fadeInUp}
        >
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Settings className="w-8 h-8 text-[#FF3478]" /> 곡곡 관리자 시스템
            </h1>
            <p className="text-muted-foreground mt-1 text-sm font-mono tracking-tighter">Security Monitoring Active</p>
          </div>
          <Button onClick={loadAdminData} disabled={loading} variant="default" className="bg-[#111] hover:bg-black text-white shadow-md">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> 데이터 새로고침
          </Button>
        </motion.div>

        {/* 통계 카드 섹션 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-t-4 border-t-blue-500 shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-blue-500 flex items-center gap-2"><Users className="w-4 h-4" /> 전체 회원 수</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{stats.totalUsers}명</div></CardContent>
          </Card>
          <Card className="border-t-4 border-t-green-500 shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-green-600 flex items-center gap-2"><FileText className="w-4 h-4" /> 전체 게시글</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{stats.totalPosts}개</div></CardContent>
          </Card>
          <Card className="border-t-4 border-t-orange-500 shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-orange-500 flex items-center gap-2"><BarChart3 className="w-4 h-4" /> 운영 축제</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{stats.activeFestivals}개</div></CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 shadow-sm h-12 bg-white border dark:bg-zinc-900">
            <TabsTrigger value="users">사용자 관리</TabsTrigger>
            <TabsTrigger value="posts">콘텐츠 관리</TabsTrigger>
            <TabsTrigger value="contact">문의사항</TabsTrigger>
            <TabsTrigger value="system">보안 로그</TabsTrigger>
          </TabsList>

          {/* 1. 사용자 관리 탭 */}
          <TabsContent value="users">
            <Card className="shadow-md">
              <CardHeader><CardTitle>가입 유저 목록</CardTitle></CardHeader>
              <CardContent>
                <div className="mb-4 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="이름 또는 이메일 검색..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 max-w-md" />
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
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.username}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell><Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>{user.role}</Badge></TableCell>
                        <TableCell className="text-xs">{new Date(user.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          {user.role !== "ADMIN" && (
                            <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleUserDelete(user.id, user.email)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 2. 콘텐츠 관리 탭 */}
          <TabsContent value="posts">
            <Card className="shadow-md">
              <CardHeader><CardTitle className="text-green-600">수다방 게시글 관리</CardTitle></CardHeader>
              <CardContent>
                <div className="mb-4 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="제목 또는 작성자 검색..." value={searchPosts} onChange={(e) => setSearchPosts(e.target.value)} className="pl-9 max-w-md" />
                </div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>카테고리</TableHead>
                      <TableHead>제목</TableHead>
                      <TableHead>작성자</TableHead>
                      <TableHead className="text-right">액션</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPosts.map((post) => (
                      <TableRow key={post.id}>
                        <TableCell><Badge variant="outline">{post.category}</Badge></TableCell>
                        <TableCell className="font-medium truncate max-w-[300px]">{post.title}</TableCell>
                        <TableCell>{post.author}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handlePostDelete(post.id, post.title)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 3. 문의사항 관리 탭 (핵심 수정 영역) */}
          <TabsContent value="contact">
            <Card className="shadow-md">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-blue-600"><MessageSquare className="w-5 h-5" /> 문의사항 관리</CardTitle>
                    <CardDescription>사용자 문의를 확인하고 답변을 등록합니다.</CardDescription>
                  </div>
                  <Badge className="px-3 py-1 bg-blue-500">총 {contacts.length}건</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="p-4 border rounded-2xl bg-orange-50 flex items-center gap-4">
                    <div className="p-2 bg-white rounded-lg shadow-sm"><Clock className="w-5 h-5 text-orange-500" /></div>
                    <div><p className="text-xs text-orange-600 font-bold">미답변</p><p className="text-xl font-black">{contacts.filter(c => c.status === 'pending').length}건</p></div>
                  </div>
                  <div className="p-4 border rounded-2xl bg-green-50 flex items-center gap-4">
                    <div className="p-2 bg-white rounded-lg shadow-sm"><CheckCircle2 className="w-5 h-5 text-green-500" /></div>
                    <div><p className="text-xs text-green-600 font-bold">처리완료</p><p className="text-xl font-black">{contacts.filter(c => c.status !== 'pending').length}건</p></div>
                  </div>
                </div>

                <div className="rounded-xl border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead>성함</TableHead>
                        <TableHead>내용</TableHead>
                        <TableHead className="text-right">상태</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contacts.length > 0 ? contacts.map((contact) => (
                        <TableRow key={contact.id} className="hover:bg-muted/30">
                          <TableCell className="font-bold">{contact.name}<br/><span className="text-[10px] text-gray-400 font-normal">{contact.email}</span></TableCell>
                          <TableCell>
                            <p className="text-xs max-w-[400px] truncate">{contact.message}</p>
                            {contact.reply_content && <p className="text-[10px] text-blue-500 mt-1 font-bold">답변: {contact.reply_content}</p>}
                          </TableCell>
                          <TableCell className="text-right">
                            {contact.status === 'pending' ? (
                              <Button size="sm" className="bg-[#FF3478] hover:bg-[#E62E6C]" onClick={() => handleReply(contact.id, contact.name)}>
                                <Send className="w-3 h-3 mr-1" /> 답변
                              </Button>
                            ) : (
                              <Badge className="bg-green-500">완료</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      )) : (
                        <TableRow><TableCell colSpan={3} className="text-center py-10 text-gray-400">문의 내역이 없습니다.</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 4. 보안 로그 탭 */}
          <TabsContent value="system">
            <Card className="border-red-500/20 shadow-lg">
              <CardHeader className="bg-red-50 dark:bg-red-950/20"><CardTitle className="text-red-600 flex items-center gap-2"><ShieldAlert className="w-5 h-5" /> 실시간 보안 로그</CardTitle></CardHeader>
              <CardContent className="pt-6">
                <div className="bg-zinc-950 text-green-400 p-6 rounded-2xl font-mono text-xs shadow-inner min-h-[300px]">
                  <p className="text-zinc-500 mb-4 font-bold border-b border-zinc-800 pb-2"># GOKGOK_FIREWALL_v2.0 ACTIVE</p>
                  {dbLogs.length > 0 ? dbLogs.map((log) => (
                    <motion.div key={log.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="mb-2 p-2 border-l-2 border-red-500 bg-red-500/5">
                      <span className="text-red-500 font-bold">[침입감지]</span> {log.violation_type} | {log.user_email} (요청: {log.request_count}회)
                    </motion.div>
                  )) : (
                    <p className="text-green-500 italic animate-pulse">● 현재 위협이 탐지되지 않았습니다.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}