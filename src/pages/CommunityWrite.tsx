// CommunityWrite.tsx (Render 서버 통신용)
import { useState, useRef } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { fadeInUp } from "@/lib/motion";
import { getCurrentUser } from "@/lib/login";

export default function CommunityWrite() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser(); 

  const [formData, setFormData] = useState({
    festivalTitle: "",
    category: "전통문화", 
    content: "",
  });

  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const processFiles = (files: File[]) => {
    const imageFiles = files.filter(file => file.type.startsWith("image/"));

    if (imagePreviews.length + imageFiles.length > 30) {
      alert("사진은 최대 30장까지 업로드할 수 있습니다.");
      return;
    }

    const newUrls = imageFiles.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newUrls]);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(Array.from(e.target.files || []));
    if (fileInputRef.current) fileInputRef.current.value = ""; 
  };

  const handleRemoveImage = (e: React.MouseEvent, indexToRemove: number) => {
    e.stopPropagation(); 
    setImagePreviews(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true); 
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false); 
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
      e.dataTransfer.clearData();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const DEFAULT_IMAGE = "https://placehold.co/800x400/eeeeee/999999?text=No+Photo";
    const finalImages = imagePreviews.length > 0 ? imagePreviews : [DEFAULT_IMAGE];

    const token = localStorage.getItem('token');
    const authHeaders: any = {
      "Content-Type": "application/json",
    };
    if (token) {
      authHeaders["Authorization"] = `Bearer ${token}`; 
    }

    try {
      // 💡 주소를 다시 Render 서버로 변경했습니다. 
      // (주의: Render 서버 업데이트 전까지는 이메일이 저장되지 않아 삭제/수정이 불가합니다)
      const response = await fetch("https://gokgok-8ztf.onrender.com/api/community", {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          author: currentUser?.name || "나(GokGok)",
          author_email: currentUser?.email,
          title: formData.festivalTitle,
          content: formData.content,
          category: formData.category,
          images: finalImages
        })
      });

      const data = await response.json();

      if (data.success) {
        alert("게시글이 성공적으로 등록되었습니다.");
        navigate("/community"); 
      } else {
        alert(`글 등록에 실패했습니다: ${data.message || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error("게시글 작성 에러:", error);
      alert("서버와 통신할 수 없습니다. 백엔드 서버가 켜져 있는지 확인해 주세요.");
    }
  };

  if (!currentUser) return <Navigate to="/notmypage" replace />;

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">새 게시글 작성</h1>
          <p className="text-muted-foreground">축제에서의 즐거웠던 경험을 나누어주세요.</p>
        </div>

        <Card className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-2">
                <label htmlFor="festivalTitle" className="text-sm font-medium text-foreground">축제 이름</label>
                <input id="festivalTitle" name="festivalTitle" type="text" required value={formData.festivalTitle} onChange={handleChange} placeholder="예: 진주 남강 유등축제" className="w-full px-4 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div className="space-y-2">
                <label htmlFor="category" className="text-sm font-medium text-foreground">카테고리</label>
                <select id="category" name="category" value={formData.category} onChange={handleChange} className="w-full px-4 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="전통문화">전통문화</option><option value="겨울축제">겨울축제</option><option value="불꽃축제">불꽃축제</option><option value="체험">체험</option><option value="기타">기타</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="content" className="text-sm font-medium text-foreground">내용</label>
              <textarea id="content" name="content" required value={formData.content} onChange={handleChange} placeholder="축제에 대한 생생한 후기를 남겨주세요!" className="w-full px-4 py-3 h-48 bg-background border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">사진 첨부</span>
                <span className="text-xs text-muted-foreground">{imagePreviews.length} / 30장</span>
              </div>
              
              <input type="file" multiple accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />

              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`flex gap-4 overflow-x-auto p-4 border-2 border-dashed rounded-lg transition-colors min-h-[140px] ${
                  isDragging ? "border-primary bg-primary/10" : "border-border/50 bg-muted/20"
                }`}
              >
                {imagePreviews.length < 30 && (
                  <div onClick={handleImageClick} className="w-24 h-24 shrink-0 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 cursor-pointer transition-colors bg-background">
                    <ImagePlus className="w-6 h-6 mb-1" />
                    <span className="text-[10px] text-center px-1">추가</span>
                  </div>
                )}
                
                {imagePreviews.map((url, idx) => (
                  <div key={idx} className="relative w-24 h-24 shrink-0 group">
                    <img src={url} alt={`preview-${idx}`} className="w-full h-full object-cover rounded-lg border border-border" />
                    <button type="button" onClick={(e) => handleRemoveImage(e, idx)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-3 h-3" />
                    </button>
                    {idx === 0 && <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">대표</span>}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t border-border">
              <Button type="button" variant="outline" className="px-4 py-2" onClick={() => navigate(-1)}>취소</Button>
              <Button type="submit">등록하기</Button>
            </div>
            
          </form>
        </Card>
      </motion.div>
    </div>
  );
}