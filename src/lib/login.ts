// 로컬 스토리지 기반 간단한 인증 시스템 - lib/login.ts

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  password?: string;
}

const USERS_KEY = 'gokgok_users';
const CURRENT_USER_KEY = 'gokgok_current_user';

// 로컬 스토리지에서 모든 사용자 가져오기
const getUsers = (): User[] => {
  const usersJson = localStorage.getItem(USERS_KEY);
  return usersJson ? JSON.parse(usersJson) : [];
};

// 로컬 스토리지에 사용자 저장
const saveUsers = (users: User[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

// 현재 로그인한 사용자 가져오기
export const getCurrentUser = (): User | null => {
  const userJson = localStorage.getItem(CURRENT_USER_KEY);
  return userJson ? JSON.parse(userJson) : null;
};

// 현재 사용자 저장/삭제 내부 함수
const setCurrentUser = (user: User | null) => {
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
};

// 회원가입
export const signup = (email: string, password: string, name: string): { success: boolean; message: string; user?: User } => {
  const users = getUsers();
  
  if (users.some(u => u.email === email)) {
    return { success: false, message: '이미 사용 중인 이메일입니다.' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { success: false, message: '올바른 이메일 형식이 아닙니다.' };
  }

  if (password.length < 6) {
    return { success: false, message: '비밀번호는 최소 6자 이상이어야 합니다.' };
  }

  if (name.trim().length < 2) {
    return { success: false, message: '이름은 최소 2자 이상이어야 합니다.' };
  }

  const newUser: User = {
    id: Date.now().toString(),
    email,
    name: name.trim(),
    createdAt: new Date().toISOString(),
  };

  const userWithPassword = { ...newUser, password };
  users.push(userWithPassword);
  saveUsers(users);

  return { success: true, message: '회원가입이 완료되었습니다.', user: newUser };
};

// 로그인
export const login = (email: string, password: string): { success: boolean; message: string; user?: User } => {
  const users = getUsers();
  const user = users.find(u => u.email === email && (u as any).password === password);

  if (!user) {
    return { success: false, message: '이메일 또는 비밀번호가 올바르지 않습니다.' };
  }

  const { password: _, ...userWithoutPassword } = user as any;
  setCurrentUser(userWithoutPassword);

  return { success: true, message: '로그인되었습니다.', user: userWithoutPassword };
};

/**
 * 로그아웃 (수정됨)
 * UI 관련 로직(confirm, alert)을 제거하여 Layout에서 제어할 수 있도록 함
 */
export const logout = () => {
  setCurrentUser(null);
  // 상태 변경을 전역에 알림
  window.dispatchEvent(new Event('auth-change'));
};

// 로그인 상태 확인
export const isLoggedIn = (): boolean => {
  return getCurrentUser() !== null;
};

// 비밀번호 변경
export const changePassword = (email: string, currentPassword: string, newPassword: string): { success: boolean; message: string } => {
  const users = getUsers();
  const userIndex = users.findIndex(u => u.email === email && u.password === currentPassword);

  if (userIndex === -1) {
    return { success: false, message: '현재 비밀번호가 일치하지 않습니다.' };
  }

  if (newPassword.length < 6) {
    return { success: false, message: '새 비밀번호는 최소 6자 이상이어야 합니다.' };
  }

  users[userIndex].password = newPassword;
  saveUsers(users);

  return { success: true, message: '비밀번호가 성공적으로 변경되었습니다.' };
};

// 회원 탈퇴
export const deleteAccount = (email: string, password: string): { success: boolean; message: string } => {
  const users = getUsers();
  const userExists = users.some(u => u.email === email && u.password === password);

  if (!userExists) {
    return { success: false, message: '비밀번호가 일치하지 않아 탈퇴할 수 없습니다.' };
  }

  const updatedUsers = users.filter(u => !(u.email === email && u.password === password));
  saveUsers(updatedUsers);

  // 현재 로그인된 정보 삭제 (단순 데이터 삭제만 수행)
  setCurrentUser(null);
  window.dispatchEvent(new Event('auth-change'));

  return { success: true, message: '회원 탈퇴가 완료되었습니다.' };
};