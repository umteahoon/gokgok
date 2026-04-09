import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  onSearch?: (query: string) => void;
  className?: string;
}

export function SearchBar({ onSearch, className }: SearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    if (onSearch) {
      onSearch(query);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className={cn('w-full max-w-4xl mx-auto', className)}>
      <div className="relative group w-full">
        
        {/* 돋보기 아이콘 */}
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 z-10" />
        
        <Input
          type="text"
          placeholder="축제 이름, 지역, 키워드로 검색하세요"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyPress}
          
          /* 
             - border border-gray-300: 기본 연회색 테두리
             - focus-visible:border-gray-300: 클릭해도 테두리 색상 유지
             - focus-visible:ring-0 focus-visible:ring-offset-0: shadcn 기본 포커스 링과 여백 완벽 제거
             - shadow-sm: 사진처럼 은은하고 부드러운 그림자
          */
          className="w-full h-14 pl-14 pr-6 text-lg bg-white dark:bg-[#1E1E1E] border border-gray-300 dark:border-gray-600 rounded-full shadow-sm hover:shadow-md transition-shadow focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none focus-visible:border-gray-300 placeholder:text-gray-400"
        />
        
      </div>
    </div>
  );
}