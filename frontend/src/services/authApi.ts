/**
 * 가상 인증 API 서비스 (백엔드 서버 없이 프론트엔드 단독 동작)
 */

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt?: string;
}

// 가상 딜레이 함수 (실제 통신 느낌을 주기 위함)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 가상 회원가입
 */
export async function signup(data: SignupRequest): Promise<{ user: User; token: string }> {
  await delay(500); // 0.5초 대기

  const newUser: User = {
    id: `user_${Date.now()}`,
    email: data.email,
    name: data.name,
    createdAt: new Date().toISOString(),
  };

  // 브라우저 로컬 스토리지에 가짜 유저 정보 저장
  const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
  mockUsers.push({ ...newUser, password: data.password });
  localStorage.setItem('mock_users', JSON.stringify(mockUsers));

  return {
    user: newUser,
    token: `mock_token_${Date.now()}`,
  };
}

/**
 * 가상 로그인
 */
export async function login(data: LoginRequest): Promise<{ user: User; token: string }> {
  await delay(500);

  // 로컬 스토리지에서 유저 확인
  const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
  const user = mockUsers.find((u: any) => u.email === data.email);

  if (user && user.password === data.password) {
    return {
      user: { id: user.id, email: user.email, name: user.name },
      token: `mock_token_${Date.now()}`,
    };
  }

  // 계정이 없거나 비밀번호가 틀려도 즉석에서 로그인시켜줌 (간편 모드)
  const instantUser: User = {
    id: `user_${Date.now()}`,
    email: data.email,
    name: data.email.split('@')[0], // 이메일 앞부분을 이름으로 사용
  };

  return {
    user: instantUser,
    token: `mock_token_${Date.now()}`,
  };
}

/**
 * 가상 토큰 검증
 */
export async function verifyToken(_token: string): Promise<User> {
  await delay(100);
  return {
    id: 'mock_user',
    email: 'test@example.com',
    name: '테스트 유저',
  };
}
