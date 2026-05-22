/**
 * 🚀 곡곡(GokGok) 팀 프로젝트 공용 라우트 고유 키 및 로컬 헬퍼 스펙
 * 기여: 주환(글쓰기), 태훈(notmypage, 약관, 개인정보), 원재(문의하기)
 */

export const ROUTE_PATHS = {
  HOME: '/',
  SEARCH: '/search',
  COMMUNITY: '/community',
  COMMUNITY_WRITE: '/community/write', // 글쓰기 페이지 추가 - 주환
  MYPAGE: '/mypage',
  NOTMYPAGE: '/notmypage', // notmypage 추가 엄태훈
  TERMS: '/terms', //  이용약관 추가 엄태훈
  PRIVACY: '/privacy', // 개인정보 처리 방침 추가 엄태훈
  CONTACT: "/contact", // 문의하기 페이지 추가 최원재
} as const;

export interface Festival {
  id: string | number; // id 호환성을 위해 string | number 처리
  title: string;
  location: string;
  date: string;
  image: string;
  category: string;
  rank?: number;
  description?: string;
  status?: 'ongoing' | 'upcoming' | 'ended';
}

// 🎴 1. 일반 축제 목데이터 리스트
export const mockFestivals: Festival[] = [
  {
    id: '1',
    title: '진주 남강 유등축제',
    location: '경상남도 진주시',
    date: '2026.10.01 - 2026.10.10',
    image: 'https://images.unsplash.com/photo-1715578271997-dfa19e38705f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MTk0NTh8MHwxfHNlYXJjaHwxfHxrb3JlYW4lMjB0cmFkaXRpb25hbCUyMGZlc3RpdmFsfGVufDB8MHx8fDE3NzM5NzI4MTl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: '전통문화',
    status: 'upcoming',
  },
  {
    id: '2',
    title: '보령 머드축제',
    location: '충청남도 보령시',
    date: '2026.07.15 - 2026.07.24',
    image: 'https://images.unsplash.com/photo-1751445535640-9acbf06eac44?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MTk0NTh8MHwxfHNlYXJjaHwyfHxrb3JlYW4lMjB0cmFkaXRpb25hbCUyMGZlc3RpdmFsfGVufDB8MHx8fDE3NzM5NzI4MTl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: '체험',
    status: 'upcoming',
  },
  {
    id: '3',
    title: '화천 산천어축제',
    location: '강원도 화천군',
    date: '2026.01.10 - 2026.01.31',
    image: 'https://images.unsplash.com/photo-1758644648482-d2d31e875f11?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MTk0NTh8MHwxfHNlYXJjaHwzfHxrb3JlYW4lMjB0cmFkaXRpb25hbCUyMGZlc3RpdmFsfGVufDB8MHx8fDE3NzM5NzI4MTl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: '겨울축제',
    status: 'ended',
  },
  {
    id: '4',
    title: '전주 한옥마을 축제',
    location: '전라북도 전주시',
    date: '2026.05.01 - 2026.05.05',
    image: 'https://images.unsplash.com/photo-1759838914432-ae1f48477bf1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MTk0NTh8MHwxfHNlYXJjaHw0fHxrb3JlYW4lMjB0cmFkaXRpb25hbCUyMGZlc3RpdmFsfGVufDB8MHx8fDE3NzM5NzI4MTl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: '전통문화',
    status: 'upcoming',
  },
  {
    id: '5',
    title: '부산 불꽃축제',
    location: '부산광역시 광안리',
    date: '2026.10.20',
    image: 'https://images.unsplash.com/photo-1652584534877-9757ba002177?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MTk0NTh8MHwxfHNlYXJjaHw1fHxrb3JlYW4lMjB0cmFkaXRpb25hbCUyMGZlc3RpdmFsfGVufDB8MHx8fDE3NzM5NzI4MTl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: '불꽃축제',
    status: 'upcoming',
  },
  {
    id: '6',
    title: '안동 국제탈춤페스티벌',
    location: '경상북도 안동시',
    date: '2026.09.25 - 2026.10.04',
    image: 'https://images.unsplash.com/photo-1601900245655-7719650f5b7a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MTk0NTh8MHwxfHNlYXJjaHw2fHxrb3JlYW4lMjB0cmFkaXRpb25hbCUyMGZlc3RpdmFsfGVufDB8MHx8fDE3NzM5NzI4MTl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: '전통문화',
    status: 'upcoming',
  },
];

// 🏆 2. 메인 화면 상단 베스트 축제 리스트 (중복 완벽 제거본)
export const topFestivals: Festival[] = [
  {
    id: 'top-1',
    title: '진해 군항제',
    location: '경상남도 창원시',
    date: '2026.03.25 - 2026.04.05',
    image: 'https://images.unsplash.com/photo-1715578271997-dfa19e38705f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MTk0NTh8MHwxfHNlYXJjaHwxfHxrb3JlYW4lMjB0cmFkaXRpb25hbCUyMGZlc3RpdmFsfGVufDB8MHx8fDE3NzM5NzI4MTl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: '자연생태',
    rank: 1,
    status: 'upcoming',
  },
  {
    id: 'top-2',
    title: '무주 반딧불축제',
    location: '전라북도 무주군',
    date: '2026.08.31 - 2026.09.08',
    image: 'https://images.unsplash.com/photo-1751445535640-9acbf06eac44?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MTk0NTh8MHwxfHNlYXJjaHwyfHxrb3JlYW4lMjB0cmFkaXRpb25hbCUyMGZlc3RpdmFsfGVufDB8MHx8fDE3NzM5NzI4MTl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: '자연생태',
    rank: 2,
    status: 'upcoming',
  },
  {
    id: 'top-3',
    title: '금산 인삼축제',
    location: '충청남도 금산군',
    date: '2026.10.03 - 2026.10.13',
    image: 'https://images.unsplash.com/photo-1758644648482-d2d31e875f11?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MTk0NTh8MHwxfHNlYXJjaHwzfHxrb3JlYW4lMjB0cmFkaXRpb25hbCUyMGZlc3RpdmFsfGVufDB8MHx8fDE3NzM5NzI4MTl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: '체험',
    rank: 3,
    status: 'upcoming',
  },
  {
    id: 'top-4',
    title: '순천만 갈대축제',
    location: '전라남도 순천시',
    date: '2026.11.01 - 2026.11.03',
    image: 'https://images.unsplash.com/photo-1759838914432-ae1f48477bf1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MTk0NTh8MHwxfHNlYXJjaHw0fHxrb3JlYW4lMjB0cmFkaXRpb25hbCUyMGZlc3RpdmFsfGVufDB8MHx8fDE3NzM5NzI4MTl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: '자연생태',
    rank: 4,
    status: 'upcoming',
  },
  {
    id: 'top-5',
    title: '서귀포 칠십리축제',
    location: '제주특별자치도 서귀포시',
    date: '2026.10.18 - 2026.10.20',
    image: 'https://images.unsplash.com/photo-1652584534877-9757ba002177?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MTk0NTh8MHwxfHNlYXJjaHw1fHxrb3JlYW4lMjB0cmFkaXRpb25hbCUyMGZlc3RpdmFsfGVufDB8MHx8fDE3NzM5NzI4MTl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: '전통문화',
    rank: 5,
    status: 'upcoming',
  },
  { 
    id: 'top-6',
    title: '평창 송어축제',
    location: '강원도 평창군',
    date: '2026.12.20 - 2027.01.24',
    image: 'https://images.unsplash.com/photo-1601900245655-7719650f5b7a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MTk0NTh8MHwxfHNlYXJjaHw2fHxrb3JlYW4lMjB0cmFkaXRpb25hbCUyMGZlc3RpdmFsfGVufDB8MHx8fDE3NzM5NzI4MTl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: '겨울축제',
    rank: 6,
    status: 'upcoming',
  }, 
  {
    id: '7',
    title: '제주 들불축제',
    location: '제주특별자치도',
    date: '2026.03.01 - 2026.03.03',
    image: 'https://images.unsplash.com/photo-1544499494-f06d80f4427d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MTk0NTh8MHwxfHNlYXJjaHw3fHxrb3JlYW4lMjB0cmFkaXRpb25hbCUyMGZlc3RpdmFsfGVufDB8MHx8fDE3NzM5NzI4MTl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: '전통문화',
    rank: 7,
    status: 'ended',
  },
  {
    id: '8',
    title: '강릉 단오제',
    location: '강원도 강릉시',
    date: '2026.06.10 - 2026.06.16',
    image: 'https://images.unsplash.com/photo-1729533036930-df3e5077ca87?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MTk0NTh8MHwxfHNlYXJjaHw4fHxrb3JlYW4lMjB0cmFkaXRpb25hbCUyMGZlc3RpdmFsfGVufDB8MHx8fDE3NzM5NzI4MTl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: '전통문화',
    rank: 8,
    status: 'upcoming',
  },
  {
    id: '9',
    title: '함평 나비축제',
    location: '전라남도 함평군',
    date: '2026.04.20 - 2026.05.05',
    image: 'https://images.unsplash.com/photo-1652584522446-b2d96de634a0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MTk0NTh8MHwxfHNlYXJjaHw5fHxrb3JlYW4lMjB0cmFkaXRpb25hbCUyMGZlc3RpdmFsfGVufDB8MHx8fDE3NzM5NzI4MTl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    category: '자연생태',
    rank: 9,
    status: 'upcoming',
  },
  {
    id: '10',
    title: '여수 밤바다 불꽃축제',
    location: '전라남도 여수시',
    date: '2026.08.15',
    image: 'https://images.unsplash.com/photo-1590501754285-3f90ff9449a7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4MTk0NTh8MHwxfHNlYXJjaHwxMHx8a29yZWFuJTIwdHJhZGl0aW9uYWwlMjBmZXN0aXZhbHxlbnwwfDB8fHwxNzczOTcyODE5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: '불꽃축제',
    rank: 10,
    status: 'upcoming',
  },
];

// 🔥 3. 인기 급상승 섹션에 연동되는 최신 등록 축제 데이터셋
export const recentFestivals: Festival[] = [
  {
    id: '11',
    title: '서울 빛초롱축제',
    location: '서울특별시 청계천',
    date: '2026.11.01 - 2026.11.30',
    image: 'https://images.unsplash.com/photo-1601900245655-7719650f5b7a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4Mzc5NTV8MHwxfHNlYXJjaHwxfHxrb3JlYSUyMGxvY2FsJTIwZmVzdGl2YWwlMjBjZWxlYnJhdGlvbnxlbnwwfDB8fHwxNzczOTcyODE5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: '빛축제',
    status: 'upcoming',
  },
  {
    id: '12',
    title: '대구 치맥페스티벌',
    location: '대구광역시 두류공원',
    date: '2026.07.10 - 2026.07.14',
    image: 'https://images.unsplash.com/photo-1506905760138-9e8f7f36bdd0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4Mzc5NTV8MHwxfHNlYXJjaHwyfHxrb3JlYSUyMGxvY2FsJTIwZmVzdGl2YWwlMjBjZWxlYnJhdGlvbnxlbnwwfDB8fHwxNzczOTcyODE5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: '음식축제',
    status: 'upcoming',
  },
  {
    id: '13',
    title: '춘천 마임축제',
    location: '강원도 춘천시',
    date: '2026.05.20 - 2026.05.26',
    image: 'https://images.unsplash.com/photo-1707361806325-74dfd810e41d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4Mzc5NTV8MHwxfHNlYXJjaHwzfHxrb3JlYSUyMGxvY2FsJTIwZmVzdGl2YWwlMjBjZWxlYnJhdGlvbnxlbnwwfDB8fHwxNzczOTcyODE5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: '공연예술',
    status: 'upcoming',
  },
  {
    id: '14',
    title: '통영 한산대첩축제',
    location: '경상남도 통영시',
    date: '2026.08.12 - 2026.08.15',
    image: 'https://images.unsplash.com/photo-1604212467162-2b0f6f58612a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4Mzc5NTV8MHwxfHNlYXJjaHw0fHxrb3JlYSUyMGxvY2FsJTIwZmVzdGl2YWwlMjBjZWxlYnJhdGlvbnxlbnwwfDB8fHwxNzczOTcyODE5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: '역사문화',
    status: 'upcoming',
  },
  {
    id: '15',
    title: '인천 펜타포트 락페스티벌',
    location: '인천광역시 송도',
    date: '2026.08.08 - 2026.08.10',
    image: 'https://images.unsplash.com/photo-1591550881006-0f2ad4dd52a0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4Mzc5NTV8MHwxfHNlYXJjaHw1fHxrb3JlYSUyMGxvY2FsJTIwZmVzdGl2YWwlMjBjZWxlYnJhdGlvbnxlbnwwfDB8fHwxNzczOTcyODE5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: '음악축제',
    status: 'upcoming',
  },
  {
    id: '16',
    title: '경주 벚꽃축제',
    location: '경상북도 경주시',
    date: '2026.04.01 - 2026.04.10',
    image: 'https://images.unsplash.com/photo-1610696326567-16772b575f13?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4Mzc5NTV8MHwxfHNlYXJjaHw2fHxrb3JlYSUyMGxvY2FsJTIwZmVzdGl2YWwlMjBjZWxlYnJhdGlvbnxlbnwwfDB8fHwxNzczOTcyODE5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    category: '자연생태',
    status: 'upcoming',
  },
  {
    id: '17',
    title: '군포 철쭉축제',
    location: '경기도 군포시',
    date: '2026.04.20 - 2026.04.28',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    category: '자연생태',
    status: 'upcoming',
  },
  {
    id: '18',
    title: '수원 화성문화제',
    location: '경기도 수원시',
    date: '2026.10.05 - 2026.10.07',
    image: 'https://images.unsplash.com/photo-1599930113854-d6d7fd521f10?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    category: '역사문화',
    status: 'upcoming',
  },
  {
    id: '19',
    title: '강릉 커피축제',
    location: '강원도 강릉시',
    date: '2026.10.02 - 2026.10.06',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    category: '음식축제',
    status: 'upcoming',
  },
];

export const formatDate = (dateString: string): string => {
  return dateString;
};

export const getCategoryColor = (category: string): string => {
  const colorMap: Record<string, string> = {
    '전통문화': 'bg-[#F5E8D3] text-[#8C6239] dark:bg-[#4A3623] dark:text-[#E3C8A8]',
    '체험': 'bg-[#FFFBEB] text-[#B45309] dark:bg-[#451A03] dark:text-[#FCD34D]',
    '겨울축제': 'bg-blue-500/10 text-blue-600',
    '불꽃축제': 'bg-gradient-to-r from-[#FFE5E5] via-[#FFF0E0] to-[#FFF8E0] text-[#CC4444] border-none shadow-none font-medium',
    '자연생태': 'bg-green-500/10 text-green-600',
    '빛축제': 'bg-yellow-500/10 text-yellow-600',
    '음식축제': 'bg-orange-500/10 text-orange-600',
    '공연예술': 'bg-purple-500/10 text-purple-600',
    '역사문화': 'bg-indigo-500/10 text-indigo-600',
    '음악축제': 'bg-pink-500/10 text-pink-600',
  };
  return colorMap[category] || 'bg-muted text-muted-foreground';
};

export const getStatusBadge = (status?: Festival['status']): { label: string; className: string } => {
  switch (status) {
    case 'ongoing':
      return { label: '진행중', className: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-500' };
    case 'upcoming':
      return { label: '예정', className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-500' };
    case 'ended':
      return { label: '종료', className: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-500' };
    default:
      return { label: '예정', className: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-500' };
  }
};