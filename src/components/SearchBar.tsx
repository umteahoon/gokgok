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
    <div className={cn('w-full max-w-4xl mx-auto px-4', className)}>
      {/* 1. index.css에 정의한 .search-glass-bar 클래스를 적용합니다. 엄태훈 
        2. 내부 여백을 p-2 정도로 줄여서 더 날렵한 느낌을 줍니다.
      */}
      <div className="search-glass-bar p-2 group">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            {/* 돋보기 아이콘: 호버 시 색상이 진해지도록 transition 추가 */}
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            
            <Input
              type="text"
              placeholder="축제 이름, 지역, 키워드로 검색하세요"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyPress}
              /* - bg-transparent: 입력창 배경을 투명하게 해서 뒤의 유리 효과가 보이게 함
                - border-none: 입력창 자체 테두리를 제거
                - focus-visible:ring-0: 클릭 시 생기는 파란색 테두리 제거 (부모 컨테이너 효과 강조)
              */
              className="h-14 pl-14 pr-6 text-lg bg-transparent border-none focus-visible:ring-0 placeholder:text-muted-foreground/60 rounded-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}