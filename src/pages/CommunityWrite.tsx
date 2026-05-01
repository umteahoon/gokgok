// CommunityWrite.tsx (Render 백엔드 전체 주소 반영 버전)
import { useState, useRef } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { fadeInUp } from "@/lib/motion";
import { getCurrentUser } from "@/lib/login";

// 💡 백엔드 서버의 실제 주소를 상수로 관리합니다.
const API_BASE_URL = "https://gokgok-8ztf.onrender.com";

export default function CommunityWrite() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser(); 

  const [formData, setFormData] = useState({
    festivalTitle: "", // 화면 입력용
    category: "전통문화", 
    content: "",
  });

  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const processFiles = (files: File[]) => {
    const newImageFiles = files.filter(file => file.type.startsWith("image/"));
    if (imageFiles.length + newImageFiles.length > 10) {
      alert("사진은 최대 10장까지 업로드할 수 있습니다.");
      return;
    }
    const newUrls = newImageFiles.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newUrls]);
    setImageFiles(prev => [...prev, ...newImageFiles]);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(Array.from(e.target.files || []));
    if (fileInputRef.current) fileInputRef.current.value = ""; 
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImagePreviews(prev => prev.filter((_, idx) => idx !== indexToRemove));
    setImageFiles(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const token = localStorage.getItem('accessToken');
    const sendData = new FormData();
    
    /**
     * 💡 DB 스키마 컬럼명에 맞춰 데이터 추가
     */
    sendData.append("author", currentUser?.name || "익명");
    sendData.append("author_email", currentUser?.email || ""); 
    sendData.append("title", formData.festivalTitle);         
    sendData.append("content", formData.content);
    sendData.append("category", formData.category);
    sendData.append("status", "active"); 

    imageFiles.forEach((file) => {
      sendData.append("images", file); 
    });

    try {
      // 💡 주소를 API_BASE_URL을 포함한 전체 경로로 수정했습니다.
      const response = await fetch(`${API_BASE_URL}/api/community`, {
        method: "POST",
        headers: {
          // FormData 사용 시 브라우저가 boundary를 자동 설정하므로 Content-Type은 적지 않습니다.
          ...(token && { "Authorization": `Bearer ${token}` })
        },
        body: sendData
      });

      // 서버가 에러 HTML을 보낼 경우를 대비해 텍스트를 먼저 확인하거나 응답 상태를 체크합니다.
      if (!response.ok) {
        const errorText = await response.text();
        console.error("서버 에러 상세:", errorText);
        throw new Error("서버 응답이 올바르지 않습니다.");
      }

      const data = await response.json();

      if (data.success) {
        alert("게시글이 성공적으로 등록되었습니다.");
        navigate("/community"); 
      } else {
        alert(`실패: ${data.message || '서버 내부 오류가 발생했습니다.'}`);
      }
    } catch (error) {
      console.error("작성 에러:", error);
      alert("서버 통신 중 오류가 발생했습니다. 백엔드 서버 주소를 다시 확인해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentUser) return <Navigate to="/notmypage" replace />;

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">새 게시글 작성</h1>
          <p className="text-muted-foreground">백엔드 서버({API_BASE_URL})로 안전하게 전송합니다.</p>
        </div>

        <Card className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium">축제 이름</label>
                <input name="festivalTitle" type="text" required value={formData.festivalTitle} onChange={handleChange} placeholder="축제명을 입력하세요" className="w-full px-4 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-primary outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">카테고리</label>
                <select name="category" value={formData.category} onChange={handleChange} className="w-full px-4 py-2 bg-background border border-input rounded-md outline-none">
                  <option value="전통문화">전통문화</option>
                  <option value="불꽃축제">불꽃축제</option>
                  <option value="겨울축제">겨울축제</option>
                  <option value="체험">체험</option>
                  <option value="기타">기타</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">내용</label>
              <textarea name="content" required value={formData.content} onChange={handleChange} placeholder="생생한 후기를 작성해주세요." className="w-full px-4 py-3 h-48 bg-background border border-input rounded-md resize-none outline-none" />
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium text-foreground">사진 첨부 ({imagePreviews.length}/10)</span>
              <input type="file" multiple accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
              <div className="flex gap-4 overflow-x-auto p-4 border-2 border-dashed rounded-lg bg-muted/20">
                <div onClick={handleImageClick} className="w-24 h-24 shrink-0 border-2 border-dashed flex flex-col items-center justify-center cursor-pointer bg-background hover:bg-muted/50 transition-colors">
                  <ImagePlus className="w-6 h-6 mb-1 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground">추가</span>
                </div>
                {imagePreviews.map((url, idx) => (
                  <div key={idx} className="relative w-24 h-24 shrink-0">
                    <img src={url} alt="preview" className="w-full h-full object-cover rounded-lg border border-border" />
                    <button type="button" onClick={() => handleRemoveImage(idx)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>취소</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "전송 중..." : "등록하기"}
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}