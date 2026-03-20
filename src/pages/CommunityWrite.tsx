// 주환 - 2026.03.20: 커뮤니티 글쓰기 페이지
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { fadeInUp } from "@/lib/motion";

export default function CommunityWrite() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    festivalTitle: "",
    category: "전통문화", // 기본값 설정
    content: "",
  });

  // 폼 입력 최적화 핸들러
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: API 호출 또는 전역 상태(Zustand/Redux)에 데이터 저장 로직 구현
    console.log("제출된 데이터:", formData);
    alert("게시글이 성공적으로 등록되었습니다.");
    navigate("/community"); // 작성 완료 후 목록으로 복귀
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <motion.div
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="max-w-3xl mx-auto"
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">새 게시글 작성</h1>
          <p className="text-muted-foreground">축제에서의 즐거웠던 경험을 나누어주세요.</p>
        </div>

        <Card className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* 제목 및 카테고리 영역 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-2">
                <label htmlFor="festivalTitle" className="text-sm font-medium text-foreground">
                  축제 이름
                </label>
                <input
                  id="festivalTitle"
                  name="festivalTitle"
                  type="text"
                  required
                  value={formData.festivalTitle}
                  onChange={handleChange}
                  placeholder="예: 진주 남강 유등축제"
                  className="w-full px-4 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="category" className="text-sm font-medium text-foreground">
                  카테고리
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="전통문화">전통문화</option>
                  <option value="겨울축제">겨울축제</option>
                  <option value="불꽃축제">불꽃축제</option>
                  <option value="체험">체험</option>
                  <option value="기타">기타</option>
                </select>
              </div>
            </div>

            {/* 내용 입력 영역 */}
            <div className="space-y-2">
              <label htmlFor="content" className="text-sm font-medium text-foreground">
                내용
              </label>
              <textarea
                id="content"
                name="content"
                required
                value={formData.content}
                onChange={handleChange}
                placeholder="축제에 대한 생생한 후기를 남겨주세요!"
                className="w-full px-4 py-3 h-48 bg-background border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* 이미지 첨부 (UI 플레이스홀더) */}
            <div className="space-y-2">
              <span className="text-sm font-medium text-foreground">사진 첨부</span>
              <div className="border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 transition-colors cursor-pointer">
                <ImagePlus className="w-8 h-8 mb-2" />
                <span className="text-sm">클릭하여 이미지를 업로드하세요</span>
              </div>
            </div>

            {/* 버튼 영역 */}
            <div className="flex justify-end gap-4 pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>
                취소
              </Button>
              <Button type="submit">
                등록하기
              </Button>
            </div>
            
          </form>
        </Card>
      </motion.div>
    </div>
  );
}