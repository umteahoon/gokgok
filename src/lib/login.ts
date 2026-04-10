/**
 * Render 백엔드 서버와 통신하는 인증 시스템 - lib/login.ts
 * 작성자: 엄태훈 (GokGok Project)
 */

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN'; 
  profilePhoto?: string;
}

// Render에서 발급받은 실제 백엔드 주소
const API_URL = 'https://gokgok-8ztf.onrender.com';
const TOKEN_KEY = 'accessToken';
const CURRENT_USER_KEY = 'gokgok_current_user';

// --- 내부 유틸리티 함수 ---

/**
 * 로컬 스토리지에서 현재 로그인한 유저 정보를 가져옵니다.
 */
export const getCurrentUser = (): User | null => {
  const userJson = localStorage.getItem(CURRENT_USER_KEY);
  return userJson ? JSON.parse(userJson) : null;
};

/**
 * 로컬 스토리지에서 JWT 토큰을 가져옵니다.
 */
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * 인증 상태 변경 이벤트를 발생시켜 UI(Layout, Nav 등)를 업데이트합니다.
 */
const emitAuthChange = () => {
  window.dispatchEvent(new Event('auth-change'));
};

// --- 핵심 인증 로직 (API 호출) ---

/**
 * 1. 회원가입
 * @path POST /api/auth/signup
 */
export const signup = async (email: string, password: string, name: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch(`${API_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });
    
    const data = await response.json();
    return { success: data.success, message: data.message };
  } catch (error) {
    console.error('Signup Error:', error);
    return { success: false, message: '서버와 통신 중 오류가 발생했습니다.' };
  }
};

/**
 * 2. 로그인
 * @path POST /api/auth/login
 */
export const login = async (email: string, password: string): Promise<{ success: boolean; message: string; user?: User }> => {
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (data.success) {
      // 서버에서 받은 JWT 토큰과 유저 정보를 로컬 스토리지에 저장
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(data.user));
      
      emitAuthChange();
      return { success: true, message: '로그인되었습니다.', user: data.user };
    } else {
      return { success: false, message: data.message };
    }
  } catch (error) {
    console.error('Login Error:', error);
    return { success: false, message: '서버 오류가 발생했습니다.' };
  }
};

/**
 * 3. 로그아웃
 */
export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(CURRENT_USER_KEY);
  emitAuthChange();
};

// --- 상태 확인 및 권한 함수 ---

/**
 * 로그인 여부 확인
 */
export const isLoggedIn = (): boolean => {
  return getToken() !== null;
};

/**
 * 관리자 권한 여부 확인
 */
export const isAdmin = (): boolean => {
  const user = getCurrentUser();
  return user?.role === 'ADMIN';
};

// --- 페이지 연동용 추가 함수 (임시 구현) ---

/**
 * 비밀번호 변경
 */
export const changePassword = async (email: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
  // TODO: 백엔드 /api/auth/change-password 구현 필요
  return { success: false, message: '비밀번호 변경 기능은 현재 준비 중입니다.' };
};

/**
 * 회원 탈퇴
 */
export const deleteAccount = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
  // TODO: 백엔드 /api/auth/delete 구현 필요
  return { success: false, message: '회원 탈퇴 기능은 현재 준비 중입니다.' };
};

/**
 * 프로필 사진 업데이트
 */
export const updateProfilePhoto = async (photoBase64: string): Promise<User | null> => {
  const user = getCurrentUser();
  if (!user) return null;
  
  // 현재는 로컬 정보만 업데이트하며, 실제 구현 시 백엔드 API 연동이 필요합니다.
  const updatedUser = { ...user, profilePhoto: photoBase64 };
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
  emitAuthChange();
  return updatedUser;
};