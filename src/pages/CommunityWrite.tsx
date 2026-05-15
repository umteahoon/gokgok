// 주환 - 2026.05.06: CommunityWrite (화이트 테마 및 다크모드 대응, UI 일체화)
import { useState, useRef } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { fadeInUp } from "@/lib/motion";
import { getCurrentUser } from "@/lib/login";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://gokgok-8ztf.onrender.com";

export default function CommunityWrite() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser(); 

  const [formData, setFormData] = useState({
    festivalTitle: "", 
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
    const validImageFiles = files.filter(file => 
      file.type === "image/jpeg" || file.type === "image/png"
    );

    if (validImageFiles.length !== files.length) {
      alert("JPG 및 PNG 이미지 파일만 업로드할 수 있습니다.");
    }

    if (imageFiles.length + validImageFiles.length > 10) {
      alert("사진은 최대 10장까지 업로드할 수 있습니다.");
      return;
    }

    const newUrls = validImageFiles.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newUrls]);
    setImageFiles(prev => [...prev, ...validImageFiles]);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(Array.from(e.target.files || []));
    if (fileInputRef.current) fileInputRef.current.value = ""; 
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImagePreviews(prev => prev.filter((_, idx) => idx !== indexToRemove));
    setImageFiles(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    const sendData = new FormData();
    
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
      const response = await fetch(`${API_BASE_URL}/api/community`, {
        method: "POST",
        headers: {
          ...(token && { "Authorization": `Bearer ${token}` })
        },
        body: sendData
      });

      if (!response.ok) {
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
      alert("서버 통신 중 오류가 발생했습니다. 네트워크 상태를 확인해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentUser) return <Navigate to="/notmypage" replace />;

  return (
    // ✅ 바깥쪽 배경을 bg-white로 변경 및 다크모드 대응
    <div className="min-h-screen bg-white dark:bg-[#111111] transition-colors py-12 px-4 font-sans">
      <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-[32px] font-black text-gray-900 dark:text-white mb-2 tracking-tight">새 게시글 작성</h1>
          <p className="text-gray-400 font-medium">나만의 특별한 축제 후기를 공유해주세요.</p>
        </div>

        {/* ✅ Card 컴포넌트 스타일 수정 (하얀색 바탕, 둥근 모서리, 은은한 그림자) */}
        <Card className="p-6 md:p-8 rounded-[2rem] border-gray-100 dark:border-gray-800 bg-white dark:bg-[#1a1a1a] shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-3">
                <label className="text-[13px] font-extrabold text-gray-900 dark:text-gray-200 block">축제 이름</label>
                <input 
                  name="festivalTitle" 
                  type="text" 
                  required 
                  value={formData.festivalTitle} 
                  onChange={handleChange} 
                  placeholder="축제명을 입력하세요" 
                  // ✅ 회색 둥근 배경 스타일의 입력창
                  className="w-full px-5 py-4 bg-[#F5F5F5] dark:bg-[#222222] text-[#111111] dark:text-white border-none rounded-xl focus:ring-2 focus:ring-[#111111]/20 dark:focus:ring-white/20 outline-none font-medium placeholder:text-gray-400 transition-all" 
                />
              </div>
              <div className="space-y-3">
                <label className="text-[13px] font-extrabold text-gray-900 dark:text-gray-200 block">카테고리</label>
                <select 
                  name="category" 
                  value={formData.category} 
                  onChange={handleChange} 
                  className="w-full px-5 py-4 bg-[#F5F5F5] dark:bg-[#222222] text-[#111111] dark:text-white border-none rounded-xl focus:ring-2 focus:ring-[#111111]/20 dark:focus:ring-white/20 outline-none font-medium transition-all"
                >
                  <option value="전통문화">전통문화</option>
                  <option value="불꽃축제">불꽃축제</option>
                  <option value="겨울축제">겨울축제</option>
                  <option value="체험">체험</option>
                  <option value="기타">기타</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[13px] font-extrabold text-gray-900 dark:text-gray-200 block">내용</label>
              <textarea 
                name="content" 
                required 
                value={formData.content} 
                onChange={handleChange} 
                placeholder="생생한 후기를 작성해주세요." 
                className="w-full px-5 py-4 h-48 bg-[#F5F5F5] dark:bg-[#222222] text-[#111111] dark:text-white border-none rounded-xl resize-none outline-none focus:ring-2 focus:ring-[#111111]/20 dark:focus:ring-white/20 font-medium placeholder:text-gray-400 transition-all" 
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-end justify-between">
                <span className="text-[13px] font-extrabold text-gray-900 dark:text-gray-200">사진 첨부 ({imagePreviews.length}/10)</span>
                <p className="text-[11px] font-bold text-gray-400">※ JPG, PNG 파일만 업로드 가능합니다.</p>
              </div>
              
              <input 
                type="file" 
                multiple 
                accept="image/jpeg, image/png" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                className="hidden" 
              />
              
              <div 
                className="flex gap-4 overflow-x-auto p-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-[#111]"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <div onClick={handleImageClick} className="w-24 h-24 shrink-0 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center cursor-pointer bg-white dark:bg-[#222] hover:bg-gray-50 dark:hover:bg-[#333] transition-colors">
                  <ImagePlus className="w-6 h-6 mb-1 text-gray-400" />
                  <span className="text-[11px] font-bold text-gray-400">사진 추가</span>
                </div>
                {imagePreviews.map((url, idx) => (
                  <div key={idx} className="relative w-24 h-24 shrink-0">
                    <img src={url} alt="preview" className="w-full h-full object-cover rounded-xl shadow-sm" />
                    <button type="button" onClick={() => handleRemoveImage(idx)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-md hover:bg-red-600 transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
              <Button type="button" variant="outline" className="font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white border-transparent rounded-full px-6" onClick={() => navigate(-1)}>
                취소
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-[#111111] dark:bg-white hover:bg-black dark:hover:bg-gray-200 text-white dark:text-black font-bold px-8 rounded-full shadow-md transition-all">
                {isSubmitting ? "전송 중..." : "등록하기"}
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}