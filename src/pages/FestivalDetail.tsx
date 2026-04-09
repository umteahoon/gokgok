// (이동교 : 페이지 추가 => 특정 축제의 상세 정보를 보여주는 독립 페이지)
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { mockFestivals, topFestivals } from "@/lib/index";

export default function FestivalDetail() {
  const { id } = useParams(); // URL에서 /festivals/1 이면 id에 "1"이 들어옵니다.
  const navigate = useNavigate();

  // 모든 축제 데이터 합치기
  const allFestivals = [...topFestivals, ...mockFestivals];
  
  // 현재 id와 일치하는 축제 정보 찾기
  const festival = allFestivals.find((f) => f.id === id);

  // 축제 정보가 없을 경우의 처리
  if (!festival) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>축제 정보를 찾을 수 없습니다.</p>
        <button onClick={() => navigate(-1)}>뒤로가기</button>
      </div>
    );
  }

  // 화면에 보여줄 내용
  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#121212] py-10 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* 뒤로 가기 버튼 */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-8 text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" /> 목록으로
        </button>

        {/* 메인 이미지 */}
        <img 
          src={festival.image} 
          alt={festival.title} 
          className="w-full h-[400px] object-cover rounded-3xl mb-8 shadow-lg" 
        />

        {/* 정보 영역 */}
        <div className="bg-white dark:bg-[#1A1A1A] p-8 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800">
          <span className="text-sm font-bold text-[#8B4513] mb-2 block">{festival.category}</span>
          <h1 className="text-4xl font-bold mb-4">{festival.title}</h1>
          <p className="text-lg text-gray-600 mb-2">📍 {festival.location}</p>
          <p className="text-lg text-gray-600 mb-8">🗓️ {festival.date}</p>
          
          <div className="border-t pt-6">
            <h3 className="text-xl font-bold mb-4">상세 정보</h3>
            <p className="text-gray-700 leading-relaxed">
              {festival.description || "상세 설명이 준비 중입니다."}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}