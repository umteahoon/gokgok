import { useState } from 'react';
import { Search, MapPin, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  onSearch?: (query: string) => void;
  className?: string;
}

export function SearchBar({ onSearch, className }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [region, setRegion] = useState<string>('all');
  const [month, setMonth] = useState<string>('all');

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
      <div className="bg-card rounded-2xl shadow-lg border border-border p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="축제 이름, 지역, 키워드로 검색하세요"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="h-14 pl-12 pr-4 text-base border-2 focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
            />
          </div>
          <Button
            onClick={handleSearch}
            size="lg"
            className="h-14 px-8 text-base font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
          >
            검색
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <div className="flex-1">
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger className="h-12 rounded-xl border-2">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="지역 선택" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 지역</SelectItem>
                <SelectItem value="seoul">서울특별시</SelectItem>
                <SelectItem value="busan">부산광역시</SelectItem>
                <SelectItem value="daegu">대구광역시</SelectItem>
                <SelectItem value="incheon">인천광역시</SelectItem>
                <SelectItem value="gwangju">광주광역시</SelectItem>
                <SelectItem value="daejeon">대전광역시</SelectItem>
                <SelectItem value="ulsan">울산광역시</SelectItem>
                <SelectItem value="sejong">세종특별자치시</SelectItem>
                <SelectItem value="gyeonggi">경기도</SelectItem>
                <SelectItem value="gangwon">강원도</SelectItem>
                <SelectItem value="chungbuk">충청북도</SelectItem>
                <SelectItem value="chungnam">충청남도</SelectItem>
                <SelectItem value="jeonbuk">전라북도</SelectItem>
                <SelectItem value="jeonnam">전라남도</SelectItem>
                <SelectItem value="gyeongbuk">경상북도</SelectItem>
                <SelectItem value="gyeongnam">경상남도</SelectItem>
                <SelectItem value="jeju">제주특별자치도</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger className="h-12 rounded-xl border-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="기간 선택" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체 기간</SelectItem>
                <SelectItem value="1">1월</SelectItem>
                <SelectItem value="2">2월</SelectItem>
                <SelectItem value="3">3월</SelectItem>
                <SelectItem value="4">4월</SelectItem>
                <SelectItem value="5">5월</SelectItem>
                <SelectItem value="6">6월</SelectItem>
                <SelectItem value="7">7월</SelectItem>
                <SelectItem value="8">8월</SelectItem>
                <SelectItem value="9">9월</SelectItem>
                <SelectItem value="10">10월</SelectItem>
                <SelectItem value="11">11월</SelectItem>
                <SelectItem value="12">12월</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
