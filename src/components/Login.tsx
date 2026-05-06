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
      // 💡 [수정 포인트] 에러 메시지에 중복 제약 조건 키워드가 포함되어 있는지 체크
      const rawError = result.message || "";
      if (rawError.includes("profiles_email_key") || rawError.includes("duplicate key value")) {
        setError("이미 회원가입이 된 이메일입니다.");
      } else {
        setError(rawError);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
        <motion.div
          className="relative z-10 w-full max-w-md"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={springPresets.gentle}
        >
          <Card className="border-2 shadow-xl">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4 z-10"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>

            <CardHeader className="text-center pb-4 pt-8">
              <CardTitle className="text-2xl tracking-tight">
                {mode === "login" ? "곡곡에 오신 것을 환영합니다" : "새로운 시작을 함께해요"}
              </CardTitle>
              <CardDescription>
                {mode === "login" ? "로그인하고 모든 기능을 이용해보세요" : "간편한 회원가입으로 더 많은 혜택을 누리세요"}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {/* 메시지 영역 */}
              {(error || success) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`mb-6 p-3 rounded-lg text-sm whitespace-pre-line text-center ${
                    error
                      ? 'bg-destructive/10 text-destructive border border-destructive/20'
                      : 'bg-green-500/10 text-green-600 border border-green-500/20'
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
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="login-id">아이디</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="login-id"
                          type="id"
                          placeholder="GokGok!!"
                          className="pl-10"
                          value={loginId}
                          onChange={(e) => setLoginId(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-password">비밀번호</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="login-password"
                          type={showLoginPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-10 pr-10"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowLoginPassword((prev) => !prev)}
                        >
                          {showLoginPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                        </Button>
                      </div>
                    </div>

                    <Button type="submit" className="w-full h-11" size="lg">
                      로그인하기
                    </Button>

                    <div className="pt-4 text-center">
                      <button
                        type="button"
                        onClick={() => setMode("signup")}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
                      >
                        아직 회원이 아니신가요? <span className="font-semibold underline underline-offset-4">회원가입</span>
                        <ArrowRight className="w-3 h-3" />
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
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">이름</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-name"
                          type="text"
                          placeholder="홍길동"
                          className="pl-10"
                          value={signupName}
                          onChange={(e) => setSignupName(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email">이메일</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="example@gokgok.com"
                          className="pl-10"
                          value={signupEmail}
                          onChange={(e) => setSignupEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-email">아이디</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-id"
                          type="id"
                          placeholder="GokGok1234"
                          className="pl-10"
                          value={signupId}
                          onChange={(e) => setSignupId(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password">비밀번호</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="signup-password"
                          type={showSignupPassword ? "text" : "password"}
                          placeholder="••••••••"
                          className="pl-10 pr-10"
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowSignupPassword((prev) => !prev)}
                        >
                          {showSignupPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                        </Button>
                      </div>
                      <p className="text-[11px] text-muted-foreground px-1">
                        비밀번호는 최소 6자 이상이어야 합니다.
                      </p>
                    </div>

                    <Button type="submit" className="w-full h-11" size="lg">
                      회원가입
                    </Button>

                    <div className="pt-4 text-center">
                      <button
                        type="button"
                        onClick={() => setMode("login")}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
                      >
                        이미 계정이 있으신가요? <span className="font-semibold underline underline-offset-4">로그인</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              {/* 이용약관 영역 */}
              <div className="mt-8 pt-6 border-t border-border text-center text-[12px] text-muted-foreground">
                <p>
                  계속 진행하면{' '}
                  <button type="button" className="text-primary font-medium hover:underline">이용약관</button> 및{' '}
                  <button type="button" className="text-primary font-medium hover:underline">개인정보처리방침</button>에
                  동의하는 것으로 간주됩니다.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}