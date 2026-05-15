// 주환 - 2026.05.15: Contact 페이지 (화이트 테마, 다크모드 최적화 및 프리미엄 UI 적용)
import { useState } from "react";
import { Mail, MessageSquare, User, Send, Inbox, X } from "lucide-react";
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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://gokgok-8ztf.onrender.com";

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAnswerOpen, setIsAnswerOpen] = useState(false);
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
    // ✅ 전체 배경을 bg-white로 통일하고 다크모드 대응을 추가했습니다.
    <div className="min-h-screen bg-white dark:bg-[#111111] transition-colors py-12 px-4 font-sans text-[#111111] dark:text-white">
      <div className="max-w-4xl mx-auto">
        
        {/* 답변 확인 사이드 시트 스타일 개선 */}
        <Sheet open={isAnswerOpen} onOpenChange={setIsAnswerOpen}>
          <SheetContent side="right" className="w-full sm:max-w-lg bg-white dark:bg-[#1a1a1a] border-l border-gray-100 dark:border-gray-800 overflow-y-auto">
            <SheetHeader className="mb-8">
              <SheetTitle className="text-2xl font-black text-gray-900 dark:text-white">답변 확인</SheetTitle>
              <SheetDescription className="text-gray-400 font-medium">
                문의하신 내용에 대한 관리자 답변을 확인할 수 있습니다.
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-4">
              <Card className="p-6 rounded-2xl border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#222] shadow-none">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">시스템 안내</p>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  아직 연결된 답변 데이터가 없습니다. 문의 접수 후 1~3일 이내에 답변이 등록됩니다.
                </p>
              </Card>
            </div>
          </SheetContent>
        </Sheet>

        {/* 헤더 섹션: 수다방과 일관성 있는 스타일 */}
        <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="mb-12 flex flex-col md:flex-row items-center md:items-end justify-between gap-6 px-2">
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
            onClick={() => setIsAnswerOpen(true)}
          >
            <Inbox className="w-5 h-5 text-[#FF3478]" />
            답변 확인하기
          </Button>
        </motion.div>

        {/* ✅ 문의 폼 카드: 둥근 모서리, 은은한 경계선 적용 */}
        <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
          <Card className="p-8 md:p-12 rounded-[2.5rem] border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a1a1a] shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* 이름 입력 */}
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

                {/* 이메일 입력 */}
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

              {/* 문의 유형 선택 */}
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
                </div >
              </div>

              {/* 문의 내용 입력 */}
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

              {/* 제출 버튼 */}
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