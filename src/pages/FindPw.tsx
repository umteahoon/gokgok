// 태훈 - 2026.05.22: 비밀번호 찾기 (Supabase 이메일 인증 발송 버전)
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fadeInUp } from "@/lib/motion";

export default function FindPw() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isSent, setIsSent] = useState(false);

  const handleSendResetLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return alert("이메일을 입력해주세요.");

    try {
      // 🎯 백엔드의 Supabase Auth 링크 발송 API 호출
      const res = await fetch("https://gokgok-8ztf.onrender.com/api/auth/send-reset-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() })
      });
      const data = await res.json();
      
      if (data.success) {
        setIsSent(true);
      } else {
        alert(data.message || "인증 메일 발송에 실패했습니다.");
      }
    } catch {
      alert("서버 통신 오류");
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#111111] flex items-center justify-center p-5 font-sans text-[#111111] dark:text-white transition-colors">
      <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="w-full max-w-[440px] bg-gray-50 dark:bg-[#1a1a1a] rounded-[2.5rem] p-8 md:p-10 shadow-xl border border-gray-100 dark:border-gray-800 text-left relative">
        <button onClick={() => navigate(-1)} className="absolute left-8 top-8 text-gray-400 hover:text-[#111111] dark:hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center mb-8 mt-4">
          <h2 className="text-[24px] font-black tracking-tight mb-2">비밀번호 찾기</h2>
          <p className="text-xs font-medium text-gray-400">가입하신 이메일 주소로 본인 인증 링크를 전송합니다.</p>
        </div>

        {!isSent ? (
          <form onSubmit={handleSendResetLink} className="space-y-5">
            <div className="space-y-2.5">
              <label className="text-[13px] font-extrabold ml-1">이메일 계정</label>
              <div className="group flex items-center bg-white dark:bg-[#222] rounded-2xl px-5 py-4 focus-within:ring-2 focus-within:ring-gray-200 dark:focus-within:ring-gray-700 transition-all shadow-sm border border-gray-100 dark:border-zinc-800">
                <Mail className="w-5 h-5 text-gray-400 mr-3" />
                <input type="email" placeholder="example@gokgok.com" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-transparent outline-none text-[15px] font-medium placeholder:text-gray-400" required />
              </div>
            </div>

            <Button type="submit" className="w-full h-[56px] mt-4 rounded-full bg-[#111111] dark:bg-white text-white dark:text-[#111111] font-black text-[15px] shadow-md hover:opacity-90 transition-all">
              인증 메일 보내기
            </Button>
          </form>
        ) : (
          <div className="text-center py-6">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-950/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="text-[#FF3478] w-6 h-6" />
            </div>
            <p className="text-gray-900 dark:text-white font-bold text-base mb-2">인증 메일 발송 완료!</p>
            <p className="text-gray-400 text-xs font-semibold mb-8 leading-relaxed">
              <span className="text-[#FF3478] font-bold">{email}</span> 메일함을 확인해 주세요.<br />
              비밀번호 재설정 링크가 안전하게 도착했습니다.
            </p>
            <Button onClick={() => navigate("/")} className="w-full h-[56px] rounded-full bg-[#111111] dark:bg-white text-white dark:text-[#111111] font-black text-[15px] shadow-md">
              메인으로 이동
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}