// 태훈 - 2026.05.22: 아이디 찾기 페이지 (백엔드 규격 싱크 완료)
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fadeInUp } from "@/lib/motion";

export default function FindId() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [foundId, setFoundId] = useState<string | null>(null);

  const handleFindId = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return alert("이메일을 입력해주세요.");
    
    try {
      const res = await fetch("https://gokgok-8ztf.onrender.com/api/auth/find-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }) // 🎯 백엔드 규격 일치
      });
      const data = await res.json();
      
      if (data.success) {
        setFoundId(data.userId); 
      } else {
        alert(data.message || "해당 이메일로 가입된 아이디가 없습니다.");
      }
    } catch {
      alert("서ver 통신 실패");
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#111111] flex items-center justify-center p-5 font-sans text-[#111111] dark:text-white transition-colors">
      <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="w-full max-w-[440px] bg-gray-50 dark:bg-[#1a1a1a] rounded-[2.5rem] p-8 md:p-10 shadow-xl border border-gray-100 dark:border-gray-800 text-left relative">
        <button onClick={() => navigate(-1)} className="absolute left-8 top-8 text-gray-400 hover:text-[#111111] dark:hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center mb-8 mt-4">
          <h2 className="text-[24px] font-black tracking-tight mb-2">아이디 찾기</h2>
          <p className="text-xs font-medium text-gray-400">가입 시 등록했던 이메일 주소를 입력해 주세요.</p>
        </div>

        {!foundId ? (
          <form onSubmit={handleFindId} className="space-y-5">
            <div className="space-y-2.5">
              <label className="text-[13px] font-extrabold ml-1">이메일 주소</label>
              <div className="group flex items-center bg-white dark:bg-[#222] rounded-2xl px-5 py-4 focus-within:ring-2 focus-within:ring-gray-200 dark:focus-within:ring-gray-700 transition-all shadow-sm border border-gray-100 dark:border-zinc-800">
                <Mail className="w-5 h-5 text-gray-400 mr-3" />
                <input type="email" placeholder="example@gokgok.com" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-transparent outline-none text-[15px] font-medium placeholder:text-gray-400" required />
              </div>
            </div>
            <Button type="submit" className="w-full h-[56px] mt-4 rounded-full bg-[#111111] dark:bg-white text-white dark:text-[#111111] font-black text-[15px] shadow-md hover:opacity-90 transition-all">
              아이디 검색
            </Button>
          </form>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-400 text-sm font-semibold mb-3">확인된 회원 아이디입니다.</p>
            <div className="bg-white dark:bg-[#222] border border-gray-100 dark:border-zinc-800 p-5 rounded-2xl mb-8">
              <span className="text-xl font-black text-[#FF3478] tracking-tight">{foundId}</span>
            </div>
            <Button onClick={() => navigate("/")} className="w-full h-[56px] rounded-full bg-[#111111] dark:bg-white text-white dark:text-[#111111] font-black text-[15px] shadow-md">
              로그인 창으로 가기
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}