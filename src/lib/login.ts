// Render 백엔드 서버와 통신하는 인증 시스템 - lib/login.ts

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN'; // 엄태훈 관리자 권한
  profilePhoto?: string;
}

// Render에서 발급받은 실제 백엔드 주소
const API_URL = 'https://gokgok-8ztf.onrender.com';
const TOKEN_KEY = 'accessToken';
const CURRENT_USER_KEY = 'gokgok_current_user';

// --- 내부 유틸리티 함수 ---

// 현재 로그인한 사용자 정보 가져오기 (로컬스토리지)
export const getCurrentUser = (): User | null => {
  const userJson = localStorage.getItem(CURRENT_USER_KEY);
  return userJson ? JSON.parse(userJson) : null;
};

// 토큰 가져오기
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

// 인증 변경 이벤트 발생 (UI 업데이트용)
const emitAuthChange = () => {
  window.dispatchEvent(new Event('auth-change'));
};

// --- 핵심 인증 로직 ---

// 1. 회원가입 (백엔드 /api/signup 호출)
export const signup = async (email: string, password: string, name: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch(`${API_URL}/api/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });

    const data = await response.json();
    return { success: data.success, message: data.message };
  } catch (error) {
    return { success: false, message: '서버와 통신 중 오류가 발생했습니다.' };
  }
};

// 2. 로그인 (백엔드 /api/login 호출 및 30분 토큰 저장)
export const login = async (email: string, password: string): Promise<{ success: boolean; message: string; user?: User }> => {
  try {
    const response = await fetch(`${API_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data.success) {
      // 30분 유효한 JWT 토큰 저장
      localStorage.setItem(TOKEN_KEY, data.token);
      // 유저 정보 저장
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(data.user));
      emitAuthChange();
      return { success: true, message: '로그인되었습니다.', user: data.user };
    } else {
      return { success: false, message: data.message };
    }
  } catch (error) {
    return { success: false, message: '서버 오류가 발생했습니다.' };
  }
};

// 3. 로그아웃
export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(CURRENT_USER_KEY);
  emitAuthChange();
};

// 4. 상태 확인 함수들
export const isLoggedIn = (): boolean => {
  return getToken() !== null;
};

export const isAdmin = (): boolean => {
  const user = getCurrentUser();
  return user?.role === 'ADMIN';
};

/**
 * [주의] 비밀번호 변경 및 프로필 사진 업데이트는 
 * 백엔드(index.ts)에 해당 API 엔드포인트가 먼저 구현되어야 합니다.
 * 아래는 구조적 예시입니다.
 */

export const updateProfilePhoto = async (photoBase64: string): Promise<User | null> => {
  const token = getToken();
  if (!token) return null;

  try {
    // 실제 구현 시 백엔드에 /api/user/photo 엔드포인트 필요
    const response = await fetch(`${API_URL}/api/user/photo`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({ photo: photoBase64 }),
    });

    const data = await response.json();
    if (data.success) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(data.user));
      emitAuthChange();
      return data.user;
    }
  } catch (error) {
    console.error('프로필 업데이트 실패:', error);
  }
  return null;
};