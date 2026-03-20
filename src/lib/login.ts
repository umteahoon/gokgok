// 로컬 스토리지 기반 간단한 인증 시스템 엄태훈 

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
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

// 현재 사용자 저장
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
  
  // 이메일 중복 체크
  if (users.some(u => u.email === email)) {
    return { success: false, message: '이미 사용 중인 이메일입니다.' };
  }

  // 이메일 형식 검증
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { success: false, message: '올바른 이메일 형식이 아닙니다.' };
  }

  // 비밀번호 길이 검증
  if (password.length < 6) {
    return { success: false, message: '비밀번호는 최소 6자 이상이어야 합니다.' };
  }

  // 이름 검증
  if (name.trim().length < 2) {
    return { success: false, message: '이름은 최소 2자 이상이어야 합니다.' };
  }

  // 새 사용자 생성
  const newUser: User = {
    id: Date.now().toString(),
    email,
    name: name.trim(),
    createdAt: new Date().toISOString(),
  };

  // 비밀번호는 실제로는 해시화해야 하지만, 데모용으로 간단히 저장
  // 실제 프로덕션에서는 절대 이렇게 하면 안됩니다!
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

  // 비밀번호 제외하고 사용자 정보만 저장
  const { password: _, ...userWithoutPassword } = user as any;
  setCurrentUser(userWithoutPassword);

  return { success: true, message: '로그인되었습니다.', user: userWithoutPassword };
};

// 로그아웃
export const logout = () => {
  setCurrentUser(null);
};

// 로그인 상태 확인
export const isLoggedIn = (): boolean => {
  return getCurrentUser() !== null;
};

