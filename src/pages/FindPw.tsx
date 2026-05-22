// 태훈 - 2026.05.22: 비밀번호 변경 페이지 (백엔드 reset-password 라우터 연동 완료)
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, Key, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fadeInUp } from "@/lib/motion";

export default function FindPw() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleResetPw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId.trim() || !email.trim() || !newPassword.trim()) return alert("모든 필드를 입력해주세요.");
    if (newPassword.length < 6) return alert("새 비밀번호는 최소 6자 이상이어야 합니다.");

    try {
      // 🎯 백엔드의 실제 주소인 /reset-password 로 정밀 타격
      const res = await fetch("https://gokgok-8ztf.onrender.com/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id: userId.trim(), 
          email: email.trim(), 
          newPassword: newPassword.trim() 
        })
      });
      const data = await res.json();
      
      if (data.success) {
        setIsSuccess(true);
      } else {
        alert(data.message || "정보가 일치하지 않습니다.");
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
          <h2 className="text-[24px] font-black tracking-tight mb-2">비밀번호 재설정</h2>
          <p className="text-xs font-medium text-gray-400">아이디와 이메일을 대조한 후 새 비밀번호로 변경합니다.</p>
        </div>

        {!isSuccess ? (
          <form onSubmit={handleResetPw} className="space-y-5">
            <div className="space-y-2.5">
              <label className="text-[13px] font-extrabold ml-1">아이디</label>
              <div className="group flex items-center bg-white dark:bg-[#222] rounded-2xl px-5 py-4 focus-within:ring-2 focus-within:ring-gray-200 dark:focus-within:ring-gray-700 transition-all shadow-sm border border-gray-100 dark:border-zinc-800">
                <Key className="w-5 h-5 text-gray-400 mr-3" />
                <input type="text" placeholder="가입 아이디 입력" value={userId} onChange={e => setUserId(e.target.value)} className="w-full bg-transparent outline-none text-[15px] font-medium placeholder:text-gray-400" required />
              </div>
            </div>

            <div className="space-y-2.5">
              <label className="text-[13px] font-extrabold ml-1">이메일</label>
              <div className="group flex items-center bg-white dark:bg-[#222] rounded-2xl px-5 py-4 focus-within:ring-2 focus-within:ring-gray-200 dark:focus-within:ring-gray-700 transition-all shadow-sm border border-gray-100 dark:border-zinc-800">
                <Mail className="w-5 h-5 text-gray-400 mr-3" />
                <input type="email" placeholder="example@gokgok.com" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-transparent outline-none text-[15px] font-medium placeholder:text-gray-400" required />
              </div>
            </div>

            <div className="space-y-2.5">
              <label className="text-[13px] font-extrabold ml-1">새로운 비밀번호 설정</label>
              <div className="group flex items-center bg-white dark:bg-[#222] rounded-2xl px-5 py-4 focus-within:ring-2 focus-within:ring-gray-200 dark:focus-within:ring-gray-700 transition-all shadow-sm border border-gray-100 dark:border-zinc-800">
                <Lock className="w-5 h-5 text-gray-400 mr-3" />
                <input type="password" placeholder="6자 이상의 새 비밀번호" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full bg-transparent outline-none text-[15px] font-medium placeholder:text-gray-400" required />
              </div>
            </div>

            <Button type="submit" className="w-full h-[56px] mt-4 rounded-full bg-[#111111] dark:bg-white text-white dark:text-[#111111] font-black text-[15px] shadow-md hover:opacity-90 transition-all">
              비밀번호 변경하기
            </Button>
          </form>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500 mb-6 font-bold text-sm">🎉 비밀번호가 안전하게 변경되었습니다!<br />새로 설정한 비밀번호로 로그인해 주세요.</p>
            <Button onClick={() => navigate("/")} className="w-full h-[56px] rounded-full bg-[#111111] dark:bg-white text-white dark:text-[#111111] font-black text-[15px] shadow-md">
              로그인하러 가기
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}