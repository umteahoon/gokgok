// 태훈 - 2026.05.22: Supabase HashRouter 에러 대응 비밀번호 재설정 완료 폼
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fadeInUp } from "@/lib/motion";
import { supabase } from "@/lib/supabase"; 
// 🚩 파일 상단 임포트 구역에 이 한 줄을 추가해 주세요!
import { Input } from "@/components/ui/input";
export default function ResetPw() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [isChanged, setIsChanged] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // 🎯 [핵심 패치] Supabase가 해시(#) 뒤에 던진 에러 쿼리 주소를 강제로 긁어와 분석합니다.
    const hash = window.location.hash;
    
    if (hash.includes("error_code=otp_expired") || hash.includes("access_denied")) {
      setAuthError("이메일 인증 토큰이 만료되었거나 올바르지 않은 접근입니다. 비밀번호 찾기 버튼을 새로 눌러 다시 메일을 발송해 주세요.");
      return;
    }

    // 정상 진입 시 세션에서 유저 이메일을 획득합니다.
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user?.email) {
        setEmail(data.session.user.email);
      } else {
        // 혹시 세션이 안 잡혔더라도 URL에 access_token이 살아있는지 한 번 더 체크
        if (!hash.includes("access_token")) {
          setAuthError("인증 세션이 존재하지 않습니다. 비밀번호 찾기부터 다시 진행해 주세요.");
        }
      }
    };
    checkSession();
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return alert("비밀번호는 최소 6자 이상이어야 합니다.");

    try {
      // 🎯 백엔드 index.ts 의 통합 reset-password API 호출
      const res = await fetch("https://gokgok-8ztf.onrender.com/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email,
          newPassword: password
        })
      });
      const data = await res.json();
      
      if (data.success) {
        setIsChanged(true);
        await supabase.auth.signOut(); // 인증용 임시 세션 로그아웃 청소
      } else {
        alert(data.message || "변경 처리 실패");
      }
    } catch (err) {
      alert("서버와 통신 중 오류가 발생했습니다.");
    }
  };

  // 🚨 에러가 감지되었을 때 띄워줄 세련된 경고창 UI 스코프
  if (authError) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#111111] flex items-center justify-center p-5 font-sans text-[#111111] dark:text-white">
        <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="w-full max-w-[440px] bg-gray-50 dark:bg-[#1a1a1a] rounded-[2.5rem] p-8 md:p-10 shadow-xl border border-gray-100 dark:border-gray-800 text-center">
          <div className="w-12 h-12 bg-red-50 dark:bg-red-950/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="text-red-500 w-6 h-6" />
          </div>
          <h2 className="text-xl font-black mb-3">인증 실패</h2>
          <p className="text-gray-500 dark:text-gray-400 text-xs font-semibold leading-relaxed mb-8 whitespace-pre-line">{authError}</p>
          <Button onClick={() => navigate("/find-pw")} className="w-full h-[56px] rounded-full bg-[#FF3478] text-white font-black text-[15px] shadow-md">
            비밀번호 찾기로 다시 이동
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#111111] flex items-center justify-center p-5 font-sans text-[#111111] dark:text-white">
      <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="w-full max-w-[440px] bg-gray-50 dark:bg-[#1a1a1a] rounded-[2.5rem] p-8 md:p-10 shadow-xl border border-gray-100 dark:border-gray-800 text-left">
        <div className="text-center mb-8 mt-4">
          <h2 className="text-[24px] font-black tracking-tight mb-2">새 비밀번호 설정</h2>
          <p className="text-xs font-medium text-gray-400">인증이 확인되었습니다. 곡곡 계정의 새 비밀번호를 입력해 주세요.</p>
        </div>

        {!isChanged ? (
          <form onSubmit={handleUpdatePassword} className="space-y-5">
            <div className="space-y-2.5">
              <label className="text-[13px] font-extrabold ml-1">이메일 계정</label>
              <Input value={email} disabled className="h-14 rounded-2xl bg-white dark:bg-[#222] font-bold border-gray-100 dark:border-zinc-800" />
            </div>

            <div className="space-y-2.5">
              <label className="text-[13px] font-extrabold ml-1">새 비밀번호</label>
              <div className="group flex items-center bg-white dark:bg-[#222] rounded-2xl px-5 py-4 focus-within:ring-2 focus-within:ring-gray-200 dark:focus-within:ring-gray-700 transition-all shadow-sm border border-gray-100 dark:border-zinc-800">
                <Lock className="w-5 h-5 text-gray-400 mr-3" />
                <input type="password" placeholder="6자 이상의 새 비밀번호" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-transparent outline-none text-[15px] font-medium" required />
              </div>
            </div>
            <Button type="submit" className="w-full h-[56px] mt-4 rounded-full bg-[#111111] dark:bg-white text-white dark:text-[#111111] font-black text-[15px] shadow-md">
              비밀번호 확정 및 변경
            </Button>
          </form>
        ) : (
          <div className="text-center py-6">
            <div className="w-12 h-12 bg-green-50 dark:bg-green-950/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="text-green-500 w-6 h-6" />
            </div>
            <p className="text-gray-900 dark:text-white font-bold text-base mb-2">변경 성공!</p>
            <p className="text-gray-400 text-xs font-semibold mb-8">이제 새로운 암호 규격으로 로그인이 가능합니다.</p>
            <Button onClick={() => navigate("/")} className="w-full h-[56px] rounded-full bg-[#111111] dark:bg-white text-white dark:text-[#111111] font-black text-[15px] shadow-md">
              로그인하러 가기
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}