import { useState } from "react";
import { Mail, MessageSquare, User, Send } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// 💡 환경 변수에서 백엔드 주소를 가져옵니다. 
// (.env에 VITE_API_BASE_URL=https://gokgok-8ztf.onrender.com 설정 필요)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://gokgok-8ztf.onrender.com";

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
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

    // 유효성 검사
    if (!formData.name || !formData.email || !formData.message) {
      alert("이름, 이메일, 문의내용을 모두 입력해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 💡 백엔드 API 호출 (데이터베이스 저장)
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
        // 폼 초기화
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
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            문의사항
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            서비스 이용 중 불편한 점이나 궁금한 점을 남겨주세요.
          </p>
        </div>

        <Card className="p-6 md:p-8 shadow-sm border border-border">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  이름
                </label>
                <div className="flex items-center border border-input rounded-md px-3 py-2 bg-background focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                  <User className="w-4 h-4 text-muted-foreground mr-2" />
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="이름을 입력하세요"
                    className="w-full bg-transparent outline-none text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  이메일
                </label>
                <div className="flex items-center border border-input rounded-md px-3 py-2 bg-background focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                  <Mail className="w-4 h-4 text-muted-foreground mr-2" />
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="이메일을 입력하세요"
                    className="w-full bg-transparent outline-none text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                문의 유형
              </label>
              <div className="flex items-center border border-input rounded-md px-3 py-2 bg-background focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                <MessageSquare className="w-4 h-4 text-muted-foreground mr-2" />
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full bg-transparent outline-none text-sm cursor-pointer"
                >
                  <option value="서비스 문의">서비스 문의</option>
                  <option value="계정 문의">계정 문의</option>
                  <option value="오류 제보">오류 제보</option>
                  <option value="기타">기타</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                문의 내용
              </label>
              <textarea
                name="message"
                required
                value={formData.message}
                onChange={handleChange}
                placeholder="문의하실 내용을 자세히 적어주세요."
                className="w-full min-h-[180px] px-4 py-3 bg-background border border-input rounded-md resize-none outline-none focus:ring-2 focus:ring-primary/20 text-sm transition-all"
              />
            </div>

            <div className="flex justify-end">
              <Button 
                type="submit" 
                className="px-6 py-2 gap-2"
                disabled={isSubmitting}
              >
                <Send className={`w-4 h-4 ${isSubmitting ? 'animate-pulse' : ''}`} />
                {isSubmitting ? "전송 중..." : "문의 보내기"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}