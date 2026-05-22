// 태훈 - 2026.05.22: 비밀번호 찾기 페이지 최종본
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, Key, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fadeInUp } from "@/lib/motion";

export default function FindPw() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  const handleFindPw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId.trim() || !email.trim()) return alert("아이디와 이메일을 입력해주세요.");

    try {
      const res = await fetch("https://gokgok-8ztf.onrender.com/api/auth/find-pw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userId.trim(), email: email.trim() })
      });
      const data = await res.json();
      
      if (data.success) {
        setTempPassword(data.tempPassword);
      } else {
        alert(data.message || "정보가 일치하지 않습니다.");
      }
    } catch {
      alert("서버 통신 실패");
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
          <p className="text-xs font-medium text-gray-400">가입하신 아이디와 이메일 주소를 대조해 검증합니다.</p>
        </div>

        {!tempPassword ? (
          <form onSubmit={handleFindPw} className="space-y-5">
            <div className="space-y-2.5">
              <label className="text-[13px] font-extrabold ml-1">아이디</label>
              <div className="group flex items-center bg-white dark:bg-[#222] rounded-2xl px-5 py-4 focus-within:ring-2 focus-within:ring-gray-200 dark:focus-within:ring-gray-700 transition-all shadow-sm border border-gray-100 dark:border-zinc-800">
                <Key className="w-5 h-5 text-gray-400 mr-3" />
                <input type="text" placeholder="가입한 아이디 입력" value={userId} onChange={e => setUserId(e.target.value)} className="w-full bg-transparent outline-none text-[15px] font-medium placeholder:text-gray-400" required />
              </div>
            </div>

            <div className="space-y-2.5">
              <label className="text-[13px] font-extrabold ml-1">이메일</label>
              <div className="group flex items-center bg-white dark:bg-[#222] rounded-2xl px-5 py-4 focus-within:ring-2 focus-within:ring-gray-200 dark:focus-within:ring-gray-700 transition-all shadow-sm border border-gray-100 dark:border-zinc-800">
                <Mail className="w-5 h-5 text-gray-400 mr-3" />
                <input type="email" placeholder="example@gokgok.com" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-transparent outline-none text-[15px] font-medium placeholder:text-gray-400" required />
              </div>
            </div>

            <Button type="submit" className="w-full h-[56px] mt-4 rounded-full bg-[#111111] dark:bg-white text-white dark:text-[#111111] font-black text-[15px] shadow-md hover:opacity-90 transition-all">
              임시 비밀번호 발급
            </Button>
          </form>
        ) : (
          <div className="text-center py-6">
            <div className="w-12 h-12 bg-green-50 dark:bg-green-950/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="text-green-500 w-6 h-6" />
            </div>
            <p className="text-gray-400 text-xs font-semibold mb-4 leading-relaxed">회원 정보 매칭 성공! 발급된 보안 임시 비밀번호입니다.<br />로그인 후 회원 정보 관리 탭에서 변경해 주세요.</p>
            <div className="bg-white dark:bg-[#222] border border-dashed border-gray-200 dark:border-zinc-700 p-4 rounded-2xl mb-8 tracking-widest text-lg font-black text-[#FF3478]">
              {tempPassword}
            </div>
            <Button onClick={() => navigate("/")} className="w-full h-[56px] rounded-full bg-[#111111] dark:bg-white text-white dark:text-[#111111] font-black text-[15px] shadow-md">
              로그인하러 가기
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}