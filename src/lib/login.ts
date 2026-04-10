// Render 백엔드 서버와 통신하는 인증 시스템 - lib/login.ts

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN'; //  관리자 권한
  profilePhoto?: string;
}

// Render에서 발급받은 실제 백엔드 주소 (주소 끝에 /가 없는지 확인하세요)
const API_URL = 'https://gokgok-8ztf.onrender.com';
const TOKEN_KEY = 'accessToken';
const CURRENT_USER_KEY = 'gokgok_current_user';

// --- 내부 유틸리티 함수 ---

export const getCurrentUser = (): User | null => {
  const userJson = localStorage.getItem(CURRENT_USER_KEY);
  return userJson ? JSON.parse(userJson) : null;
};

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

const emitAuthChange = () => {
  window.dispatchEvent(new Event('auth-change'));
};

// --- 핵심 인증 로직 ---

// 1. 회원가입
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

// 2. 로그인
export const login = async (email: string, password: string): Promise<{ success: boolean; message: string; user?: User }> => {
  try {
    const response = await fetch(`${API_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data.success) {
      localStorage.setItem(TOKEN_KEY, data.token);
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

// 4. 상태 확인
export const isLoggedIn = (): boolean => {
  return getToken() !== null;
};

export const isAdmin = (): boolean => {
  const user = getCurrentUser();
  return user?.role === 'ADMIN';
};

// --- MyPage.tsx 에러 해결을 위한 추가 함수들 ---

// 비밀번호 변경 (현재는 알림만 띄우고 실제 서버 연동은 추후 백엔드 작업 필요)
export const changePassword = async (email: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
  // 백엔드에 해당 API가 아직 없으므로 임시 메시지를 리턴합니다.
  return { success: false, message: '비밀번호 변경 기능은 현재 준비 중입니다.' };
};

// 회원 탈퇴 (현재는 알림만 띄우고 실제 서버 연동은 추후 백엔드 작업 필요)
export const deleteAccount = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
  // 백엔드에 해당 API가 아직 없으므로 임시 메시지를 리턴합니다.
  return { success: false, message: '회원 탈퇴 기능은 현재 준비 중입니다.' };
};

// 프로필 사진 업데이트
export const updateProfilePhoto = async (photoBase64: string): Promise<User | null> => {
  const user = getCurrentUser();
  if (!user) return null;
  
  // 임시로 로컬스토리지 정보만 업데이트 (완벽한 구현은 백엔드 API 필요)
  const updatedUser = { ...user, profilePhoto: photoBase64 };
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
  emitAuthChange();
  return updatedUser;
};