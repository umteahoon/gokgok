// 주환 - 2026.03.20: 커뮤니티 글쓰기 페이지
import { useState, useRef } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { fadeInUp } from "@/lib/motion";
import { getCurrentUser } from "@/lib/login";

// 💡 여기에 진짜 댓글 타입을 추가
interface CommentData {
  id: string;
  author: string;
  text: string;
  date: string;
  likes?: number;
}

export default function CommunityWrite() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser(); 

  const [formData, setFormData] = useState({
    festivalTitle: "",
    category: "전통문화", 
    content: "",
  });

  // 💡 단일 string 대신 배열(string[])로 상태 관리
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []); // 💡 FileList를 배열로 변환
    
    if (imagePreviews.length + files.length > 30) {
      alert("사진은 최대 30장까지 업로드할 수 있습니다.");
      return;
    }

    // 선택된 모든 파일의 임시 URL 생성
    const newUrls = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newUrls]);
    
    if (fileInputRef.current) fileInputRef.current.value = ""; // input 초기화
  };

  const handleRemoveImage = (e: React.MouseEvent, indexToRemove: number) => {
    e.stopPropagation(); 
    setImagePreviews(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const today = new Date();
    const formattedDate = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;
    const DEFAULT_IMAGE = "https://placehold.co/800x400/eeeeee/999999?text=No+Photo";

    const newPost = {
      id: Date.now().toString(),
      author: currentUser?.name || "나(GokGok)", 
      Title: formData.festivalTitle,
      content: formData.content,
      // 💡 사진이 하나라도 있으면 배열 전체를 저장하고, 없으면 기본 이미지 저장
      images: imagePreviews.length > 0 ? imagePreviews : [DEFAULT_IMAGE], 
      likes: 0,
      comments: 0,
      date: formattedDate,
      category: formData.category,
      commentsList: [] as CommentData[]
    };

    const savedPosts = localStorage.getItem("community_posts");
    const currentPosts = savedPosts ? JSON.parse(savedPosts) : [];

    const updatedPosts = [newPost, ...currentPosts];
    localStorage.setItem("community_posts", JSON.stringify(updatedPosts));

    alert("게시글이 성공적으로 등록되었습니다.");
    navigate("/community"); 
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

            {/* 💡 다중 이미지 첨부 영역 (가로 스크롤 레이아웃) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">사진 첨부</span>
                <span className="text-xs text-muted-foreground">{imagePreviews.length} / 30장</span>
              </div>
              
              {/* multiple 속성 추가로 드래그나 Shift 키로 여러 장 선택 가능 */}
              <input type="file" multiple accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />

              <div className="flex gap-4 overflow-x-auto py-2">
                {imagePreviews.length < 30 && (
                  <div onClick={handleImageClick} className="w-24 h-24 shrink-0 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center text-muted-foreground hover:bg-muted/50 cursor-pointer transition-colors">
                    <ImagePlus className="w-6 h-6 mb-1" />
                    <span className="text-xs">추가</span>
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