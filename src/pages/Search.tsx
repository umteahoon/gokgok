// 주환 - 2026.05.15: AuthDialog (모던 화이트 테마 둥근 UI 적용 및 랜더링 오류 완벽 수정)
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { login, signup } from '@/lib/login';
import { springPresets } from '@/lib/motion';
import { useNavigate } from "react-router-dom";

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AuthDialog({ isOpen, onClose, onSuccess }: AuthDialogProps) {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");

  const [loginEmail, setLoginEmail] = useState('');
  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupId, setSignupId] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const result = await login(loginId, loginPassword);

    if (result.success) {
      setSuccess(result.message);
      window.dispatchEvent(new Event('auth-change'));

      setTimeout(() => {
        onSuccess();
        onClose();
        navigate("/mypage");
      }, 500);
    } else {
      setError(result.message);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (signupPassword.length < 6) {
      setError("비밀번호는 최소 6자 이상이어야 합니다."); 
      return;
    }

    const result = await signup(signupEmail, signupId, signupPassword, signupName);

    if (result.success) {
      setSuccess("회원가입이 완료되었습니다!\n잠시 후 로그인창으로 이동합니다.");

      setTimeout(() => {
        setSuccess("");
        setMode("login");
        setLoginEmail(signupEmail);
        setLoginPassword("");
      }, 3000);
    } else {
      const rawError = result.message || "";
      if (rawError.includes("profiles_email_key") || rawError.includes("duplicate key value")) {
        setError("이미 회원가입이 된 이메일입니다.");
      } else {
        setError(rawError);
      }
    }
  };

  // ✅ 오류 방지: if (!isOpen) return null; 을 제거하고 AnimatePresence 내부에서 렌더링 제어
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans text-[#111111] dark:text-white">
          
          {/* 배경 블러 오버레이 */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* 모달 컨테이너 (둥근 하얀색 박스) */}
          <motion.div
            className="relative z-10 w-full max-w-[440px]"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={springPresets?.gentle || { type: "spring", damping: 20, stiffness: 100 }}
          >
            {/* ✅ Shadcn Card를 활용한 커스텀 둥근 디자인 */}
            <Card className="w-full bg-white dark:bg-[#1a1a1a] rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden relative">
              
              {/* 닫기 버튼 */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-6 top-6 w-8 h-8 rounded-full bg-gray-50 dark:bg-[#222] text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors z-20"
                onClick={onClose}
              >
                <X className="w-4 h-4" />
              </Button>

              <CardHeader className="text-center pt-10 pb-6">
                <CardTitle className="text-[24px] md:text-[26px] font-black tracking-tight text-gray-900 dark:text-white">
                  {mode === "login" ? "곡곡에 오신 것을 환영합니다" : "새로운 시작을 함께해요"}
                </CardTitle>
                <CardDescription className="text-[13px] font-medium text-gray-400 mt-2">
                  {mode === "login" ? "로그인하고 모든 기능을 이용해보세요" : "간편한 회원가입으로 더 많은 혜택을 누리세요"}
                </CardDescription>
              </CardHeader>

              <CardContent className="px-8 pb-10">
                {/* 에러 및 성공 메시지 */}
                {(error || success) && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mb-6 p-4 rounded-2xl text-[13px] font-bold whitespace-pre-line text-center shadow-sm ${
                      error
                        ? 'bg-red-50 dark:bg-red-500/10 text-red-500 border border-red-100 dark:border-red-500/20'
                        : 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 border border-blue-100 dark:border-blue-500/20'
                    }`}
                  >
                    {error || success}
                  </motion.div>
                )}

                <AnimatePresence mode="wait">
                  {mode === "login" ? (
                    <motion.form
                      key="login-form"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      onSubmit={handleLogin}
                      className="space-y-5"
                    >
                      <div className="space-y-2.5">
                        <Label htmlFor="login-id" className="text-[13px] font-extrabold text-gray-900 dark:text-gray-200 ml-1">아이디</Label>
                        {/* ✅ 회색 둥근 박스 입력창 디자인 */}
                        <div className="group flex items-center bg-gray-50 dark:bg-[#222] rounded-2xl px-5 h-[56px] focus-within:ring-2 focus-within:ring-gray-200 dark:focus-within:ring-gray-700 transition-all shadow-sm">
                          <Mail className="w-5 h-5 text-gray-400 mr-3 group-focus-within:text-[#111111] dark:group-focus-within:text-white transition-colors shrink-0" />
                          <Input
                            id="login-id"
                            type="text"
                            placeholder="GokGok!!"
                            className="border-none bg-transparent shadow-none focus-visible:ring-0 px-0 h-full w-full text-[15px] font-medium text-gray-900 dark:text-white placeholder:text-gray-400"
                            value={loginId}
                            onChange={(e) => setLoginId(e.target.value)}
                            minLength={6}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        <Label htmlFor="login-password" className="text-[13px] font-extrabold text-gray-900 dark:text-gray-200 ml-1">비밀번호</Label>
                        <div className="group flex items-center bg-gray-50 dark:bg-[#222] rounded-2xl px-5 h-[56px] focus-within:ring-2 focus-within:ring-gray-200 dark:focus-within:ring-gray-700 transition-all shadow-sm">
                          <Lock className="w-5 h-5 text-gray-400 mr-3 group-focus-within:text-[#111111] dark:group-focus-within:text-white transition-colors shrink-0" />
                          <Input
                            id="login-password"
                            type={showLoginPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="border-none bg-transparent shadow-none focus-visible:ring-0 px-0 h-full w-full text-[15px] font-medium text-gray-900 dark:text-white placeholder:text-gray-400"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            required
                          />
                          <button
                            type="button"
                            className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors pl-2"
                            onClick={() => setShowLoginPassword((prev) => !prev)}
                          >
                            {showLoginPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <Button type="submit" className="w-full h-[56px] mt-4 rounded-full bg-[#111111] dark:bg-white text-white dark:text-[#111111] font-black text-[15px] shadow-lg shadow-gray-200 dark:shadow-none hover:bg-black dark:hover:bg-gray-200 transition-all active:scale-95">
                        로그인하기
                      </Button>

                      <div className="pt-4 text-center">
                        <button
                          type="button"
                          onClick={() => setMode("signup")}
                          className="text-[13px] font-medium text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors inline-flex items-center gap-1.5"
                        >
                          아직 회원이 아니신가요? <span className="font-extrabold underline underline-offset-4">회원가입</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.form>
                  ) : (
                    <motion.form
                      key="signup-form"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      onSubmit={handleSignup}
                      className="space-y-4"
                    >
                      <div className="space-y-2.5">
                        <Label htmlFor="signup-name" className="text-[13px] font-extrabold text-gray-900 dark:text-gray-200 ml-1">이름</Label>
                        <div className="group flex items-center bg-gray-50 dark:bg-[#222] rounded-2xl px-5 h-[50px] focus-within:ring-2 focus-within:ring-gray-200 dark:focus-within:ring-gray-700 transition-all shadow-sm">
                          <User className="w-4 h-4 text-gray-400 mr-3 group-focus-within:text-[#111111] dark:group-focus-within:text-white transition-colors shrink-0" />
                          <Input
                            id="signup-name"
                            type="text"
                            placeholder="홍길동"
                            className="border-none bg-transparent shadow-none focus-visible:ring-0 px-0 h-full w-full text-[14px] font-medium text-gray-900 dark:text-white placeholder:text-gray-400"
                            value={signupName}
                            onChange={(e) => setSignupName(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        <Label htmlFor="signup-email" className="text-[13px] font-extrabold text-gray-900 dark:text-gray-200 ml-1">이메일</Label>
                        <div className="group flex items-center bg-gray-50 dark:bg-[#222] rounded-2xl px-5 h-[50px] focus-within:ring-2 focus-within:ring-gray-200 dark:focus-within:ring-gray-700 transition-all shadow-sm">
                          <Mail className="w-4 h-4 text-gray-400 mr-3 group-focus-within:text-[#111111] dark:group-focus-within:text-white transition-colors shrink-0" />
                          <Input
                            id="signup-email"
                            type="email"
                            placeholder="example@gokgok.com"
                            className="border-none bg-transparent shadow-none focus-visible:ring-0 px-0 h-full w-full text-[14px] font-medium text-gray-900 dark:text-white placeholder:text-gray-400"
                            value={signupEmail}
                            onChange={(e) => setSignupEmail(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        <Label htmlFor="signup-id" className="text-[13px] font-extrabold text-gray-900 dark:text-gray-200 ml-1">아이디</Label>
                        <div className="group flex items-center bg-gray-50 dark:bg-[#222] rounded-2xl px-5 h-[50px] focus-within:ring-2 focus-within:ring-gray-200 dark:focus-within:ring-gray-700 transition-all shadow-sm">
                          <User className="w-4 h-4 text-gray-400 mr-3 group-focus-within:text-[#111111] dark:group-focus-within:text-white transition-colors shrink-0" />
                          <Input
                            id="signup-id"
                            type="text"
                            placeholder="GokGok1234"
                            className="border-none bg-transparent shadow-none focus-visible:ring-0 px-0 h-full w-full text-[14px] font-medium text-gray-900 dark:text-white placeholder:text-gray-400"
                            value={signupId}
                            onChange={(e) => setSignupId(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2.5">
                        <Label htmlFor="signup-password" className="text-[13px] font-extrabold text-gray-900 dark:text-gray-200 ml-1">비밀번호</Label>
                        <div className="group flex items-center bg-gray-50 dark:bg-[#222] rounded-2xl px-5 h-[50px] focus-within:ring-2 focus-within:ring-gray-200 dark:focus-within:ring-gray-700 transition-all shadow-sm">
                          <Lock className="w-4 h-4 text-gray-400 mr-3 group-focus-within:text-[#111111] dark:group-focus-within:text-white transition-colors shrink-0" />
                          <Input
                            id="signup-password"
                            type={showSignupPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="border-none bg-transparent shadow-none focus-visible:ring-0 px-0 h-full w-full text-[14px] font-medium text-gray-900 dark:text-white placeholder:text-gray-400"
                            value={signupPassword}
                            onChange={(e) => setSignupPassword(e.target.value)}
                            required
                          />
                          <button
                            type="button"
                            className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors pl-2"
                            onClick={() => setShowSignupPassword((prev) => !prev)}
                          >
                            {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                        <p className="text-[11px] text-gray-400 font-medium px-2">
                          * 비밀번호는 최소 6자 이상이어야 합니다.
                        </p>
                      </div>

                      <Button type="submit" className="w-full h-[56px] mt-4 rounded-full bg-[#111111] dark:bg-white text-white dark:text-[#111111] font-black text-[15px] shadow-lg shadow-gray-200 dark:shadow-none hover:bg-black dark:hover:bg-gray-200 transition-all active:scale-95">
                        회원가입
                      </Button>

                      <div className="pt-4 text-center">
                        <button
                          type="button"
                          onClick={() => setMode("login")}
                          className="text-[13px] font-medium text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors inline-flex items-center gap-1.5"
                        >
                          이미 계정이 있으신가요? <span className="font-extrabold underline underline-offset-4">로그인</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.form>
                  )}
                </AnimatePresence>

                {/* 이용약관 텍스트 */}
                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800 text-center text-[11px] font-medium text-gray-400">
                  <p>
                    계속 진행하면{' '}
                    <button type="button" className="text-gray-600 dark:text-gray-300 font-extrabold hover:underline">이용약관</button> 및{' '}
                    <button type="button" className="text-gray-600 dark:text-gray-300 font-extrabold hover:underline">개인정보처리방침</button>에<br/>
                    동의하는 것으로 간주됩니다.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}