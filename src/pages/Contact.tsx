import { useState } from "react";
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://gokgok-8ztf.onrender.com";

interface InquiryAnswer {
  id: number;
  category: string;
  message: string;
  status: "pending" | "answered" | "completed"; // 백엔드 status와 맞춤
  reply_content?: string;
  created_at: string;
  replied_at?: string; // 백엔드 컬럼명과 맞춤
}

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnswerOpen, setIsAnswerOpen] = useState(false);
  const [isLoadingAnswers, setIsLoadingAnswers] = useState(false);
  const [answerError, setAnswerError] = useState("");
  const [answers, setAnswers] = useState<InquiryAnswer[]>([]);
  const [lookupEmail, setLookupEmail] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
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
    setLookupEmail(formData.email || "");
  };

  /**
   * ✅ 답변 조회 함수 수정
   * 백엔드 경로: GET /api/contact/:email
   */
  const fetchAnswers = async () => {
    if (!lookupEmail.trim()) {
      setAnswerError("이메일을 입력해주세요.");
      setAnswers([]);
      return;
    }

    setIsLoadingAnswers(true);
    setAnswerError("");

    try {
      // 🚩 수정: 쿼리스트링(?email=) 대신 경로(/이메일) 방식으로 호출
      const response = await fetch(
        `${API_BASE_URL}/api/contact/${encodeURIComponent(lookupEmail.trim())}`
      );

      // 서버 응답이 OK가 아닐 경우 (404 등) HTML 에러 페이지가 올 수 있으므로 미리 체크
      if (!response.ok) {
        throw new Error("문의 내역이 없거나 서버에 문제가 발생했습니다.");
      }

      const result = await response.json();

      if (result.success) {
        setAnswers(result.data || []);
        if (result.data.length === 0) {
          setAnswerError("해당 이메일로 접수된 문의 내역이 없습니다.");
        }
      } else {
        setAnswers([]);
        setAnswerError(result.message || "답변 내역을 불러오지 못했습니다.");
      }
    } catch (error) {
      console.error("Answer Fetch Error:", error);
      setAnswers([]);
      setAnswerError("문의 내역을 찾을 수 없거나 서버 통신 오류가 발생했습니다.");
    } finally {
      setIsLoadingAnswers(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      alert("이름, 이메일, 문의내용을 모두 입력해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        alert("문의가 정상적으로 접수되었습니다. 관리자가 확인 후 답변드릴게요.");
        setFormData({
          name: "",
          email: "",
          category: "서비스 문의",
          message: "",
        });
      } else {
        alert(`접수 실패: ${result.message || "서버 오류가 발생했습니다."}`);
      }
    } catch (error) {
      console.error("Contact Submit Error:", error);
      alert("서버와 통신 중 오류가 발생했습니다. 네트워크 상태를 확인해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#111111] transition-colors py-12 px-4 font-sans text-[#111111] dark:text-white">
      <div className="max-w-4xl mx-auto">
        <Sheet open={isAnswerOpen} onOpenChange={setIsAnswerOpen}>
          <SheetContent
            side="right"
            className="w-full sm:max-w-lg bg-white dark:bg-[#1a1a1a] border-l border-gray-100 dark:border-gray-800 overflow-y-auto"
          >
            <SheetHeader className="mb-8">
              <SheetTitle className="text-2xl font-black text-gray-900 dark:text-white">
                답변 확인
              </SheetTitle>
              <SheetDescription className="text-gray-400 font-medium">
                문의하신 이메일을 입력하면 관리자 답변을 확인할 수 있습니다.
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-5">
              <Card className="p-5 rounded-2xl border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#222] shadow-none">
                <div className="space-y-3">
                  <label className="text-[13px] font-extrabold text-gray-900 dark:text-gray-200 ml-1 block">
                    답변 조회용 이메일
                  </label>
                  <div className="group flex items-center bg-white dark:bg-[#181818] rounded-2xl px-4 py-3 border border-gray-100 dark:border-gray-800 focus-within:ring-2 focus-within:ring-gray-200 dark:focus-within:ring-gray-700 transition-all">
                    <Mail className="w-5 h-5 text-gray-400 mr-3 group-focus-within:text-[#FF3478] transition-colors" />
                    <input
                      type="email"
                      value={lookupEmail}
                      onChange={(e) => setLookupEmail(e.target.value)}
                      placeholder="문의 접수에 사용한 이메일을 입력하세요"
                      className="w-full bg-transparent outline-none text-[15px] font-medium text-gray-900 dark:text-white placeholder:text-gray-400"
                    />
                  </div>

                  <Button
                    type="button"
                    onClick={fetchAnswers}
                    disabled={isLoadingAnswers}
                    className="w-full bg-[#111111] dark:bg-white hover:bg-black dark:hover:bg-gray-200 text-white dark:text-[#111111] rounded-full py-6 font-black"
                  >
                    <Search className={`w-4 h-4 mr-2 ${isLoadingAnswers ? "animate-pulse" : ""}`} />
                    {isLoadingAnswers ? "조회 중..." : "답변 조회하기"}
                  </Button>
                </div>
              </Card>

              {answerError && (
                <Card className="p-4 rounded-2xl border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 shadow-none">
                  <p className="text-sm text-red-600 dark:text-red-300 font-bold">
                    {answerError}
                  </p>
                </Card>
              )}

              {answers.length > 0 && answers.map((item) => (
                <Card
                  key={item.id}
                  className="p-6 rounded-2xl border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#222] shadow-none"
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">
                        {item.category}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        문의일: {new Date(item.created_at).toLocaleString("ko-KR")}
                      </p>
                    </div>

                    <div
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${
                        item.status === "completed" || item.status === "answered"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                          : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {item.status === "completed" || item.status === "answered" ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          답변 완료
                        </>
                      ) : (
                        <>
                          <Clock3 className="w-4 h-4" />
                          답변 대기
                        </>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs font-extrabold text-gray-500 dark:text-gray-400 mb-2">
                      문의 내용
                    </p>
                    <div className="rounded-xl bg-white dark:bg-[#181818] px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                      {item.message}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-extrabold text-gray-500 dark:text-gray-400 mb-2">
                      관리자 답변
                    </p>
                    <div className="rounded-xl bg-white dark:bg-[#181818] px-4 py-3 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                      {item.reply_content?.trim()
                        ? item.reply_content
                        : "아직 답변이 등록되지 않았습니다."}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </SheetContent>
        </Sheet>

        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="mb-12 flex flex-col md:flex-row items-center md:items-end justify-between gap-6 px-2"
        >
          <div className="text-center md:text-left">
            <h1 className="text-[36px] md:text-[42px] font-black text-gray-900 dark:text-white mb-2 tracking-tight">
              문의사항
            </h1>
            <p className="text-gray-400 font-bold text-sm md:text-base tracking-wide">
              서비스 이용 중 궁금한 점을 남겨주시면 정성껏 답변해 드립니다.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            className="rounded-full px-6 py-6 h-auto bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-[#222] shadow-sm flex items-center gap-2 transition-all active:scale-95"
            onClick={openAnswerSheet}
          >
            <Inbox className="w-5 h-5 text-[#FF3478]" />
            답변 확인하기
          </Button>
        </motion.div>

        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.1 }}
        >
          <Card className="p-8 md:p-12 rounded-[2.5rem] border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a1a1a] shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[13px] font-extrabold text-gray-900 dark:text-gray-200 ml-1 block">
                    작성자 성함
                  </label>
                  <div className="group flex items-center bg-gray-50 dark:bg-[#222] rounded-2xl px-5 py-4 focus-within:ring-2 focus-within:ring-gray-200 dark:focus-within:ring-gray-700 transition-all shadow-sm">
                    <User className="w-5 h-5 text-gray-400 mr-3 group-focus-within:text-[#FF3478] transition-colors" />
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="이름을 입력해 주세요"
                      className="w-full bg-transparent outline-none text-[15px] font-medium text-gray-900 dark:text-white placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[13px] font-extrabold text-gray-900 dark:text-gray-200 ml-1 block">
                    답변받을 이메일
                  </label>
                  <div className="group flex items-center bg-gray-50 dark:bg-[#222] rounded-2xl px-5 py-4 focus-within:ring-2 focus-within:ring-gray-200 dark:focus-within:ring-gray-700 transition-all shadow-sm">
                    <Mail className="w-5 h-5 text-gray-400 mr-3 group-focus-within:text-[#FF3478] transition-colors" />
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="gokgok@example.com"
                      className="w-full bg-transparent outline-none text-[15px] font-medium text-gray-900 dark:text-white placeholder:text-gray-400"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[13px] font-extrabold text-gray-900 dark:text-gray-200 ml-1 block">
                  문의 유형
                </label>
                <div className="group flex items-center bg-gray-50 dark:bg-[#222] rounded-2xl px-5 py-4 focus-within:ring-2 focus-within:ring-gray-200 dark:focus-within:ring-gray-700 transition-all shadow-sm">
                  <MessageSquare className="w-5 h-5 text-gray-400 mr-3 group-focus-within:text-[#FF3478] transition-colors" />
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full bg-transparent outline-none text-[15px] font-bold text-gray-700 dark:text-gray-200 cursor-pointer appearance-none"
                  >
                    <option value="서비스 문의">서비스 문의</option>
                    <option value="계정 문의">계정 문의</option>
                    <option value="오류 제보">오류 제보</option>
                    <option value="기타">기타</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[13px] font-extrabold text-gray-900 dark:text-gray-200 ml-1 block">
                  문의 내용
                </label>
                <textarea
                  name="message"
                  required
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="불편하신 점이나 제안하고 싶은 내용을 자세히 적어주시면 큰 도움이 됩니다."
                  className="w-full min-h-[220px] px-6 py-5 bg-gray-50 dark:bg-[#222] rounded-[2rem] border-none resize-none outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700 text-[15px] font-medium text-gray-700 dark:text-gray-300 placeholder:text-gray-400 transition-all shadow-sm"
                />
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#111111] dark:bg-white hover:bg-black dark:hover:bg-gray-200 text-white dark:text-[#111111] px-10 py-7 h-auto rounded-full font-black text-base shadow-lg shadow-gray-200 dark:shadow-none transition-all active:scale-95 flex items-center gap-3"
                >
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