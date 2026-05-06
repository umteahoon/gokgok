import { createClient } from '@supabase/supabase-js';

// Vite 환경 변수에서 값 가져오기
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 환경 변수 설정 여부 확인 (디버깅용)
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "환경 변수가 설정되지 않았습니다. .env 파일이나 Netlify 설정을 확인해주세요. " +
    "필요한 키: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY"
  );
}

// 슈파베이스 클라이언트 생성 및 내보내기
export const supabase = createClient(supabaseUrl, supabaseAnonKey);