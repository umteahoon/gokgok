import { useState, useEffect } from "react";
import {
  Mail,
  MessageSquare,
  User,
  Send,
  Inbox,
  Search,
  Clock3,
  CheckCircle2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/motion";
import { useNavigate, Navigate } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { getCurrentUser } from "@/lib/login";
import { useToast } from "@/hooks/use-toast"; // 토스트 알림 사용 권장

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://gokgok-8ztf.onrender.com";

interface InquiryAnswer {
  id: number;
  category: string;
  message: string;
  status: "pending" | "answered" | "completed";
  reply_content?: string;
  created_at: string;
  replied_at?: string;
}

export default function Contact() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnswerOpen, setIsAnswerOpen] = useState(false);
  const [isLoadingAnswers, setIsLoadingAnswers] = useState(false);
  const [answerError, setAnswerError] = useState("");
  const [answers, setAnswers] = useState<InquiryAnswer[]>([]);
  const [lookupEmail, setLookupEmail] = useState("");
  const currentUser = getCurrentUser(); 

  const [formData, setFormData] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    category: "서비스 문의",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openAnswerSheet = () => {
    setIsAnswerOpen(true);
    setAnswerError("");
    setAnswers([]);
    setLookupEmail(currentUser?.email || ""); // 조회 시 로그인된 이메일 자동 세팅
  };

  /**
   * ✅ 본인 답변 조회 함수 (보안 강화)
   */
  const fetchAnswers = async () => {
    // 🚩 보안 1: 입력된 이메일이 로그인한 정보와 일치하는지 확인
    if (lookupEmail.trim() !== currentUser?.email) {
      setAnswerError("본인의 계정 이메일만 조회할 수 있습니다.");
      return;
    }

    setIsLoadingAnswers(true);
    setAnswerError("");

    try {
      const token = localStorage.getItem("accessToken");

      if (!token) {
        setAnswerError("로그인 세션이 만료되었습니다.");
        return;
      }

      const response = await fetch(
        `${API_BASE_URL}/api/contact/search/${encodeURIComponent(lookupEmail.trim())}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            // 🚩 보안 2: 백엔드 verifyUserSelf 미들웨어 인증용 토큰 전송
            "Authorization": `Bearer ${token}` 
          },
        }
      );

      const result = await response.json();

      if (result.success) {
        setAnswers(result.data || []);
        if (result.data.length === 0) {
          setAnswerError("문의 내역이 존재하지 않습니다.");
        }
      } else {
        // 백엔드에서 403(권한없음) 등을 보낼 경우 에러 메시지 출력
        setAnswerError(result.message || "조회 권한이 없습니다.");
      }
    } catch (error) {
      setAnswerError("서버와 통신 중 오류가 발생했습니다.");
    } finally {
      setIsLoadingAnswers(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      alert("모든 필드를 입력해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 🚩 백엔드 submit 경로와 매칭 (/api/contact/submit)
      const response = await fetch(`${API_BASE_URL}/api/contact/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        alert("문의가 정상적으로 접수되었습니다.");
        setFormData({ ...formData, message: "" });
      } else {
        alert(`접수 실패: ${result.message}`);
      }
    } catch (error) {
      alert("네트워크 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 로그인 안 한 경우 튕겨내기
  if (!currentUser) return <Navigate to="/notmypage" replace />;

  return (
    <div className="min-h-screen bg-white dark:bg-[#111111] transition-colors py-12 px-4 font-sans text-[#111111] dark:text-white">
      <div className="max-w-4xl mx-auto">
        <Sheet open={isAnswerOpen} onOpenChange={setIsAnswerOpen}>
          <SheetContent side="right" className="w-full sm:max-w-lg bg-white dark:bg-[#1a1a1a] border-l border-gray-100 dark:border-gray-800 overflow-y-auto">
            <SheetHeader className="mb-8">
              <SheetTitle className="text-2xl font-black text-gray-900 dark:text-white">답변 확인</SheetTitle>
              <SheetDescription className="text-gray-400 font-medium">로그인된 계정({currentUser.email})의 문의 내역을 확인합니다.</SheetDescription>
            </SheetHeader>

            <div className="space-y-5">
              <Card className="p-5 rounded-2xl border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#222] shadow-none">
                <div className="space-y-3">
                  <label className="text-[13px] font-extrabold text-gray-900 dark:text-gray-200 ml-1 block">이메일 확인</label>
                  <div className="group flex items-center bg-white dark:bg-[#181818] rounded-2xl px-4 py-3 border border-gray-100 dark:border-gray-800 focus-within:ring-2 focus-within:ring-[#FF3478]/50 transition-all">
                    <Mail className="w-5 h-5 text-gray-400 mr-3 group-focus-within:text-[#FF3478]" />
                    <input
                      type="email"
                      value={lookupEmail}
                      readOnly // 보안상 본인 이메일 고정 권장
                      className="w-full bg-transparent outline-none text-[15px] font-medium text-gray-500"
                    />
                  </div>
                  <Button onClick={fetchAnswers} disabled={isLoadingAnswers} className="w-full bg-[#111111] dark:bg-white hover:bg-black dark:hover:bg-gray-200 text-white dark:text-[#111111] rounded-full py-6 font-black">
                    {isLoadingAnswers ? "조회 중..." : "본인 내역 조회하기"}
                  </Button>
                </div>
              </Card>

              {answerError && (
                <Card className="p-4 rounded-2xl border-red-200 bg-red-50 dark:bg-red-950/30 shadow-none text-center">
                  <p className="text-sm text-red-600 dark:text-red-300 font-bold">{answerError}</p>
                </Card>
              )}

              {answers.map((item) => (
                <Card key={item.id} className="p-6 rounded-2xl border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#222] shadow-none">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{item.category}</p>
                      <p className="text-xs text-gray-400 mt-1">문의일: {new Date(item.created_at).toLocaleString("ko-KR")}</p>
                    </div>
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${item.status === "completed" || item.status === "answered" ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"}`}>
                      {item.status === "completed" || item.status === "answered" ? "답변 완료" : "답변 대기"}
                    </div>
                  </div>
                  <div className="mb-4">
                    <p className="text-xs font-extrabold text-gray-500 mb-2">문의 내용</p>
                    <div className="rounded-xl bg-white dark:bg-[#181818] px-4 py-3 text-sm">{item.message}</div>
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-gray-500 mb-2">관리자 답변</p>
                    <div className="rounded-xl bg-white dark:bg-[#181818] px-4 py-3 text-sm font-bold text-[#FF3478]">
                      {item.reply_content?.trim() || "아직 답변이 등록되지 않았습니다."}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </SheetContent>
        </Sheet>

        {/* 메인 폼 영역 (기존 디자인 유지) */}
        <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="mb-12 flex flex-col md:flex-row items-center md:items-end justify-between gap-6 px-2">
          <div className="text-center md:text-left">
            <h1 className="text-[36px] md:text-[42px] font-black text-gray-900 dark:text-white mb-2 tracking-tight">문의사항</h1>
            <p className="text-gray-400 font-bold text-sm">서비스 이용 중 궁금한 점을 남겨주시면 정성껏 답변해 드립니다.</p>
          </div>
          <Button type="button" variant="outline" className="rounded-full px-6 py-6 h-auto bg-white dark:bg-[#1a1a1a] font-bold shadow-sm flex items-center gap-2" onClick={openAnswerSheet}>
            <Inbox className="w-5 h-5 text-[#FF3478]" /> 답변 확인하기
          </Button>
        </motion.div>

        <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
          <Card className="p-8 md:p-12 rounded-[2.5rem] border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a1a1a] shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[13px] font-extrabold ml-1 block">작성자 성함</label>
                  <div className="group flex items-center bg-gray-50 dark:bg-[#222] rounded-2xl px-5 py-4">
                    <User className="w-5 h-5 text-gray-400 mr-3" />
                    <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full bg-transparent outline-none font-medium" />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[13px] font-extrabold ml-1 block">답변받을 이메일</label>
                  <div className="group flex items-center bg-gray-50 dark:bg-[#222] rounded-2xl px-5 py-4">
                    <Mail className="w-5 h-5 text-gray-400 mr-3" />
                    <input type="email" name="email" required value={formData.email} readOnly className="w-full bg-transparent outline-none font-medium text-gray-400" />
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[13px] font-extrabold ml-1 block">문의 유형</label>
                <div className="group flex items-center bg-gray-50 dark:bg-[#222] rounded-2xl px-5 py-4">
                  <MessageSquare className="w-5 h-5 text-gray-400 mr-3" />
                  <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-transparent outline-none font-bold cursor-pointer">
                    <option value="서비스 문의">서비스 문의</option>
                    <option value="계정 문의">계정 문의</option>
                    <option value="오류 제보">오류 제보</option>
                    <option value="기타">기타</option>
                  </select>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[13px] font-extrabold ml-1 block">문의 내용</label>
                <textarea name="message" required value={formData.message} onChange={handleChange} placeholder="문의하실 내용을 자세히 적어주세요." className="w-full min-h-[220px] px-6 py-5 bg-gray-50 dark:bg-[#222] rounded-[2rem] border-none outline-none text-[15px] shadow-sm" />
              </div>
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isSubmitting} className="bg-[#111111] dark:bg-white text-white dark:text-[#111111] px-10 py-7 h-auto rounded-full font-black shadow-lg">
                  <Send className={`w-5 h-5 ${isSubmitting ? "animate-pulse" : ""}`} />
                  {isSubmitting ? "전송 중..." : "문의 접수하기"}
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}