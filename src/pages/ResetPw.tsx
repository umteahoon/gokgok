// 태훈 - 2026.05.22: Supabase 메일 링크 전용 비밀번호 재설정 완료 폼
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fadeInUp } from "@/lib/motion";
import { supabase } from "@/lib/supabase"; // 🚩 프로젝트 내 supabase 임포트 경로 확인

export default function ResetPw() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [isChanged, setIsChanged] = useState(false);

  useEffect(() => {
    // 메일 링크에 담긴 토큰 해시값을 Supabase가 자동으로 감지해서 세션을 잡아줍니다.
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        alert("인증 토큰이 만료되었거나 올바르지 않은 접근입니다. 다시 비밀번호 찾기를 해주세요.");
        navigate("/find-pw");
      }
    };
    checkSession();
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return alert("비밀번호는 최소 6자 이상이어야 합니다.");

    try {
      // 🎯 Supabase Auth 엔진에 다이렉트로 새 비밀번호 덮어쓰기 명령 선언
      const { error } = await supabase.auth.updateUser({ password: password });
      
      if (error) throw error;
      
      setIsChanged(true);
    } catch (err: any) {
      alert(`변경 실패: ${err.message || "오류 발생"}`);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#111111] flex items-center justify-center p-5 font-sans text-[#111111] dark:text-white">
      <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="w-full max-w-[440px] bg-gray-50 dark:bg-[#1a1a1a] rounded-[2.5rem] p-8 md:p-10 shadow-xl border border-gray-100 dark:border-gray-800 text-left">
        <div className="text-center mb-8 mt-4">
          <h2 className="text-[24px] font-black tracking-tight mb-2">새 비밀번호 설정</h2>
          <p className="text-xs font-medium text-gray-400">보안을 위해 강력한 비밀번호를 새로 지정해 주세요.</p>
        </div>

        {!isChanged ? (
          <form onSubmit={handleUpdatePassword} className="space-y-5">
            <div className="space-y-2.5">
              <label className="text-[13px] font-extrabold ml-1">새 비밀번호</label>
              <div className="group flex items-center bg-white dark:bg-[#222] rounded-2xl px-5 py-4 focus-within:ring-2 focus-within:ring-gray-200 dark:focus-within:ring-gray-700 transition-all shadow-sm border border-gray-100 dark:border-zinc-800">
                <Lock className="w-5 h-5 text-gray-400 mr-3" />
                <input type="password" placeholder="6자 이상의 새 비밀번호" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-transparent outline-none text-[15px] font-medium" required />
              </div>
            </div>
            <Button type="submit" className="w-full h-[56px] mt-4 rounded-full bg-[#111111] dark:bg-white text-white dark:text-[#111111] font-black text-[15px] shadow-md hover:opacity-90 transition-all">
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