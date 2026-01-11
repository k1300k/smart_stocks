/**
 * 인증 API 서비스
 */

import axios from 'axios';

// API Base URL 설정
// Vercel 배포 시: 환경 변수 VITE_API_URL 사용
// 로컬 개발 시: http://localhost:3000/api (Vite 프록시 사용)
const getApiBaseUrl = () => {
  // Vite 환경 변수 접근
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    return envUrl;
  }
  
  // 프로덕션 환경에서도 백엔드가 같은 도메인에 있지 않으면 에러 발생
  // Vercel 배포 시 백엔드 서버가 별도로 필요함
  if (import.meta.env.PROD) {
    console.warn('⚠️ VITE_API_URL 환경 변수가 설정되지 않았습니다. 백엔드 서버 URL을 설정해주세요.');
    // Vercel 배포 시 백엔드 서버 URL 필요
    return 'http://localhost:3000/api'; // 임시값, 실제로는 백엔드 서버 URL 필요
  }
  
  return 'http://localhost:3000/api';
};

const API_BASE_URL = getApiBaseUrl();

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

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
  error?: {
    code: string;
    message: string;
  };
  timestamp: string;
}

/**
 * 회원가입
 */
export async function signup(data: SignupRequest): Promise<{ user: User; token: string }> {
  const response = await axios.post<AuthResponse>(
    `${API_BASE_URL}/auth/signup`,
    data
  );

  if (response.data.success && response.data.data) {
    return response.data.data;
  }

  throw new Error(response.data.error?.message || '회원가입에 실패했습니다.');
}

/**
 * 로그인
 */
export async function login(data: LoginRequest): Promise<{ user: User; token: string }> {
  const response = await axios.post<AuthResponse>(
    `${API_BASE_URL}/auth/login`,
    data
  );

  if (response.data.success && response.data.data) {
    return response.data.data;
  }

  throw new Error(response.data.error?.message || '로그인에 실패했습니다.');
}

/**
 * 토큰 검증
 */
export async function verifyToken(token: string): Promise<User> {
  const response = await axios.get<AuthResponse>(
    `${API_BASE_URL}/auth/verify`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (response.data.success && response.data.data?.user) {
    return response.data.data.user;
  }

  throw new Error(response.data.error?.message || '토큰 검증에 실패했습니다.');
}
