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

  // 입력이 발생할 때마다 실시간으로 상태를 업데이트하고 부모에게 전달합니다.
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setQuery(newValue); // 내 입력창 글자 업데이트
    if (onSearch) {
      onSearch(newValue); // 부모 컴포넌트(Search.tsx)로 실시간 검색어 전달
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
          onChange={handleChange} // 새로 만든 실시간 핸들러로 교체
          
          
          className="w-full h-14 pl-14 pr-6 text-lg bg-white dark:bg-[#1E1E1E] border border-gray-300 dark:border-gray-600 rounded-full shadow-sm hover:shadow-md transition-shadow focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none focus-visible:border-gray-300 placeholder:text-gray-400"
        />
        
      </div>
    </div>
  );
}