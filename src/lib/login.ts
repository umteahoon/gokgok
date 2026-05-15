/**
 * Render 백엔드 서버와 통신하는 인증 시스템 - lib/login.ts
 * 작성자: 엄태훈 (GokGok Project)
 * 업데이트: 아이디 찾기, 비밀번호 재설정, 회원 탈퇴 로직 통합
 */

// 유저 데이터 구조 정의
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN'; 
  profilePhoto?: string;
}

// 백엔드 서버 주소 및 로컬 스토리지 키 설정
const API_URL = 'https://gokgok-8ztf.onrender.com';
const TOKEN_KEY = 'accessToken';
const CURRENT_USER_KEY = 'gokgok_current_user';

// --- [내부 유틸리티 함수] ---

/**
 * 로컬 스토리지에서 현재 로그인한 유저 객체를 가져옵니다.
 */
export const getCurrentUser = (): User | null => {
  const userJson = localStorage.getItem(CURRENT_USER_KEY);
  return userJson ? JSON.parse(userJson) : null;
};

/**
 * 로컬 스토리지에서 인증용 JWT 토큰을 가져옵니다.
 */
export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * 인증 상태가 변경되었음을 브라우저에 알립니다. (Nav바 등의 UI 업데이트용)
 */
const emitAuthChange = () => {
  window.dispatchEvent(new Event('auth-change'));
};

// --- [핵심 인증 로직] ---

/**
 * 1. 회원가입
 * @param email 사용자 이메일
 * @param id 사용자 아이디
 * @param password 비밀번호
 * @param name 실명 또는 닉네임
 */
export const signup = async (email: string, id: string, password: string, name: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch(`${API_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, email, password, name }), // 백엔드 req.body와 매칭
    });
    return await response.json();
  } catch (error) {
    return { success: false, message: '서버와 통신 중 오류가 발생했습니다.' };
  }
};

/**
 * 2. 로그인
 * 성공 시 토큰과 유저 정보를 로컬 스토리지에 저장합니다.
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
      localStorage.setItem(TOKEN_KEY, data.token); // JWT 저장
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(data.user)); // 유저 정보 저장
      emitAuthChange(); // UI 갱신 이벤트 발생
    }
    return data;
  } catch (error) {
    return { success: false, message: '서버 오류가 발생했습니다.' };
  }
};

/**
 * 3. 로그아웃
 * 로컬 스토리지의 모든 인증 정보를 삭제합니다.
 */
export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(CURRENT_USER_KEY);
  emitAuthChange();
};

// --- [사용자 관리 및 찾기 기능] ---

/**
 * 4. 아이디 찾기
 * @param email 가입 시 사용한 이메일
 */
export const findUserId = async (email: string): Promise<{ success: boolean; userId?: string; message?: string }> => {
  try {
    const response = await fetch(`${API_URL}/api/auth/find-id`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return await response.json();
  } catch (error) {
    return { success: false, message: '서버 통신 오류가 발생했습니다.' };
  }
};

/**
 * 5. 비밀번호 재설정 (새 비밀번호로 덮어쓰기)
 * @param id 사용자 아이디
 * @param email 사용자 이메일
 * @param newPassword 새로 설정할 비밀번호
 */
export const resetPassword = async (id: string, email: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch(`${API_URL}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, email, currentPassword, newPassword }),
    });
    return await response.json();
  } catch (error) {
    return { success: false, message: '서버 통신 오류가 발생했습니다.' };
  }
};

/**
 * 6. 회원 탈퇴
 * @param id 삭제할 사용자의 아이디
 */
export const deleteAccount = async (id: string): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch(`${API_URL}/api/auth/delete`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    const data = await response.json();
    if (data.success) {
      logout(); // 탈퇴 성공 시 자동으로 로그아웃 처리
    }
    return data;
  } catch (error) {
    return { success: false, message: '서버 통신 오류가 발생했습니다.' };
  }
};

/**
 * 7. 프로필 사진 업데이트 (로컬 우선 반영)
 * @param photoBase64 이미지의 Base64 문자열
 */
export const updateProfilePhoto = async (photoBase64: string): Promise<User | null> => {
  const user = getCurrentUser();
  if (!user) return null;
  
  // 현재 유저 정보에 사진 데이터만 교체
  const updatedUser = { ...user, profilePhoto: photoBase64 };
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
  emitAuthChange();
  return updatedUser; 
};