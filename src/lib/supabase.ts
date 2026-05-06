// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
// 프론트엔드 환경변수 가져오기 (Vite 기준)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);