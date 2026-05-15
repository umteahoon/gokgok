import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Eye, EyeOff, ArrowRight, Search, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { login, signup, findUserId, resetPassword } from '@/lib/login'; // API 함수 추가 임포트
import { springPresets } from '@/lib/motion';
import { useNavigate } from "react-router-dom";

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AuthDialog({ isOpen, onClose, onSuccess }: AuthDialogProps) {
  const navigate = useNavigate();
  
  // 모드 확장: findId (아이디 찾기), resetPw (비번 재설정)
  const [mode, setMode] = useState<"login" | "signup" | "findId" | "resetPw">("login");

  // 공통 및 로그인/회원가입 상태
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupId, setSignupId] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  
  // 아이디 찾기 및 비번 재설정 전용 상태
  const [findEmail, setFindEmail] = useState('');
  const [resetId, setResetId] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);

  // --- 핸들러 함수들 ---

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    const result = await login(loginId, loginPassword);
    if (result.success) {
      setSuccess(result.message);
      window.dispatchEvent(new Event('auth-change'));
      setTimeout(() => { onSuccess(); onClose(); navigate("/mypage"); }, 500);
    } else { setError(result.message); }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    const result = await signup(signupEmail, signupId, signupPassword, signupName);
    if (result.success) {
      setSuccess("회원가입 완료! 로그인 해주세요.");
      setTimeout(() => { setMode("login"); setLoginId(signupId); }, 2000);
    } else { setError(result.message); }
  };

  const handleFindId = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    const result = await findUserId(findEmail);
    if (result.success) {
      setSuccess(`찾으시는 아이디는 [ ${result.userId} ] 입니다.`);
    } else { setError(result.message); }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    const result = await resetPassword(resetId, resetEmail, resetNewPassword);
    if (result.success) {
      setSuccess("비밀번호가 변경되었습니다!\n새 비밀번호로 로그인하세요.");
      setTimeout(() => setMode("login"), 2000);
    } else { setError(result.message); }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div className="fixed inset-0 bg-black/50 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
        <motion.div className="relative z-10 w-full max-w-md" initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={springPresets.gentle}>
          <Card className="border-2 shadow-xl">
            <Button variant="ghost" size="icon" className="absolute right-4 top-4 z-10" onClick={onClose}><X className="h-4 w-4" /></Button>

            <CardHeader className="text-center pb-4 pt-8">
              <CardTitle className="text-2xl tracking-tight">
                {mode === "login" && "곡곡에 오신 것을 환영합니다"}
                {mode === "signup" && "새로운 시작을 함께해요"}
                {mode === "findId" && "아이디 찾기"}
                {mode === "resetPw" && "비밀번호 재설정"}
              </CardTitle>
              <CardDescription>
                {mode === "login" && "로그인하고 모든 기능을 이용해보세요"}
                {mode === "signup" && "간편한 회원가입으로 시작하세요"}
                {mode === "findId" && "가입하신 이메일을 입력해주세요"}
                {mode === "resetPw" && "정보 확인 후 비밀번호를 변경합니다"}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {/* 메시지 알림 영역 */}
              {(error || success) && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`mb-6 p-3 rounded-lg text-sm whitespace-pre-line text-center ${error ? 'bg-destructive/10 text-destructive border border-destructive/20' : 'bg-green-500/10 text-green-600 border border-green-500/20'}`}>
                  {error || success}
                </motion.div>
              )}

              <AnimatePresence mode="wait">
                {/* 1. 로그인 폼 */}
                {mode === "login" && (
                  <motion.form key="login" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-id">아이디</Label>
                      <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input id="login-id" placeholder="아이디를 입력하세요" className="pl-10" value={loginId} onChange={(e)=>setLoginId(e.target.value)} required /></div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">비밀번호</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input id="login-password" type={showLoginPassword?"text":"password"} placeholder="••••••••" className="pl-10 pr-10" value={loginPassword} onChange={(e)=>setLoginPassword(e.target.value)} required />
                        <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 hover:bg-transparent" onClick={()=>setShowLoginPassword(!showLoginPassword)}>{showLoginPassword?<EyeOff className="h-4 w-4"/>:<Eye className="h-4 w-4"/>}</Button>
                      </div>
                    </div>
                    <Button type="submit" className="w-full h-11" size="lg">로그인하기</Button>
                    <div className="flex flex-col gap-3 pt-2 text-center">
                      <button type="button" onClick={()=>setMode("signup")} className="text-sm text-muted-foreground hover:text-primary transition-colors">아직 회원이 아니신가요? <b>회원가입</b></button>
                      <div className="flex justify-center gap-4 text-xs text-muted-foreground">
                        <button type="button" onClick={()=>setMode("findId")} className="hover:underline">아이디 찾기</button>
                        <span className="text-border">|</span>
                        <button type="button" onClick={()=>setMode("resetPw")} className="hover:underline">비밀번호 재설정</button>
                      </div>
                    </div>
                  </motion.form>
                )}

                {/* 2. 회원가입 폼 */}
                {mode === "signup" && (
                  <motion.form key="signup" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2"><Label>이름</Label><Input placeholder="홍길동" value={signupName} onChange={(e)=>setSignupName(e.target.value)} required /></div>
                    <div className="space-y-2"><Label>이메일</Label><Input type="email" placeholder="example@gokgok.com" value={signupEmail} onChange={(e)=>setSignupEmail(e.target.value)} required /></div>
                    <div className="space-y-2"><Label>아이디</Label><Input placeholder="사용할 아이디" value={signupId} onChange={(e)=>setSignupId(e.target.value)} required /></div>
                    <div className="space-y-2"><Label>비밀번호</Label><Input type="password" placeholder="••••••••" value={signupPassword} onChange={(e)=>setSignupPassword(e.target.value)} required /></div>
                    <Button type="submit" className="w-full h-11" size="lg">가입하기</Button>
                    <button type="button" onClick={()=>setMode("login")} className="w-full text-sm text-muted-foreground hover:text-primary">이미 계정이 있으신가요? 로그인</button>
                  </motion.form>
                )}

                {/* 3. 아이디 찾기 폼 */}
                {mode === "findId" && (
                  <motion.form key="findId" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} onSubmit={handleFindId} className="space-y-4">
                    <div className="space-y-2">
                      <Label>가입 이메일</Label>
                      <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input type="email" placeholder="가입시 사용한 이메일 입력" className="pl-10" value={findEmail} onChange={(e)=>setFindEmail(e.target.value)} required /></div>
                    </div>
                    <Button type="submit" className="w-full h-11" variant="secondary"><Search className="w-4 h-4 mr-2"/>아이디 찾기</Button>
                    <button type="button" onClick={()=>setMode("login")} className="w-full text-sm text-muted-foreground hover:text-primary">로그인으로 돌아가기</button>
                  </motion.form>
                )}

                {/* 4. 비밀번호 재설정 폼 */}
                {mode === "resetPw" && (
                  <motion.form key="resetPw" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} onSubmit={handleResetPassword} className="space-y-4">
                    <div className="space-y-2"><Label>아이디</Label><Input placeholder="가입 아이디" value={resetId} onChange={(e)=>setResetId(e.target.value)} required /></div>
                    <div className="space-y-2"><Label>이메일</Label><Input type="email" placeholder="가입 이메일" value={resetEmail} onChange={(e)=>setResetEmail(e.target.value)} required /></div>
                    <div className="space-y-2">
                      <Label>새 비밀번호</Label>
                      <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input type={showResetPassword?"text":"password"} placeholder="새 비밀번호 입력" className="pl-10 pr-10" value={resetNewPassword} onChange={(e)=>setResetNewPassword(e.target.value)} required />
                      <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3" onClick={()=>setShowResetPassword(!showResetPassword)}>{showResetPassword?<EyeOff className="h-4 w-4"/>:<Eye className="h-4 w-4"/>}</Button></div>
                    </div>
                    <Button type="submit" className="w-full h-11" variant="default"><KeyRound className="w-4 h-4 mr-2"/>비밀번호 변경하기</Button>
                    <button type="button" onClick={()=>setMode("login")} className="w-full text-sm text-muted-foreground hover:text-primary">로그인으로 돌아가기</button>
                  </motion.form>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}