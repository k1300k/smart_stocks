/**
 * 인증 API 서비스
 */

import axios from 'axios';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';

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
