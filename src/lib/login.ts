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
 * 데이터 전송 시 키 값을 명시적으로 지정하여 순서 꼬임을 방지했습니다.
 * @path POST /api/auth/signup
 */
export const signup = async (email: string, id: string, password: string, name: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch(`${API_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // 🚩 키(Key)를 명시적으로 매칭하여 백엔드 req.body 구조와 일치시킴
      body: JSON.stringify({ 
        id: id,       // 사용자가 입력한 아이디
        email: email, // 사용자가 입력한 이메일
        password: password, 
        name: name 
      }),
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
export const login = async (id: string, password: string): Promise<{ success: boolean; message: string; user?: User }> => {
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, password }),
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

export const isLoggedIn = (): boolean => {
  return getToken() !== null;
};

export const isAdmin = (): boolean => {
  const user = getCurrentUser();
  return user?.role === 'ADMIN';
};

// --- 기타 함수들 ---

export const changePassword = async (email: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
  return { success: false, message: '비밀번호 변경 기능은 현재 준비 중입니다.' };
};

export const deleteAccount = async (email: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch(`${API_URL}/api/auth/delete`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    if (data.success) {
      logout();
    }
    return { success: data.success, message: data.message };
  } catch (error) {
    return { success: false, message: '서버 통신 오류가 발생했습니다.' };
  }
};

// 아이디 찾기
export const findUserId = async (email: string): Promise<{ success: boolean; userId?: string; message?: string }> => {
  try {
    const response = await fetch(`${API_URL}/api/auth/find-id`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return await response.json();
  } catch (error) {
    return { success: false, message: '서버 통신 오류' };
  }
};

// 비밀번호 재설정
export const resetPassword = async (id: string, email: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch(`${API_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, email, newPassword }),
    });
    return await response.json();
  } catch (error) {
    return { success: false, message: '서버 통신 오류' };
  }
};

export const updateProfilePhoto = async (photoBase64: string): Promise<User | null> => {
  const user = getCurrentUser();
  if (!user) return null;
  
  const updatedUser = { ...user, profilePhoto: photoBase64 };
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
  emitAuthChange();
  return updatedUser; 
};