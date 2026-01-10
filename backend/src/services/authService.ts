/**
 * 인증 서비스
 * 간단한 메모리 기반 사용자 저장 (실제로는 DB 사용 필요)
 */

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

// 임시 메모리 저장소 (실제로는 DB 사용)
const users: Map<string, { user: User; passwordHash: string }> = new Map();

/**
 * 회원가입
 */
export async function signup(email: string, password: string, name: string): Promise<{
  user: User;
  token: string;
}> {
  // 중복 이메일 확인
  if (users.has(email.toLowerCase())) {
    throw new Error('이미 존재하는 이메일입니다.');
  }

  // 비밀번호 해싱
  const passwordHash = await bcrypt.hash(password, 10);

  // 사용자 생성
  const user: User = {
    id: Date.now().toString(),
    email: email.toLowerCase(),
    name: name.trim(),
    createdAt: new Date().toISOString(),
  };

  // 저장 (실제로는 DB에 저장)
  users.set(user.email, { user, passwordHash });

  // JWT 토큰 생성
  const token = jwt.sign(
    { userId: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return { user, token };
}

/**
 * 로그인
 */
export async function login(email: string, password: string): Promise<{
  user: User;
  token: string;
}> {
  const userData = users.get(email.toLowerCase());

  if (!userData) {
    throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
  }

  // 비밀번호 확인
  const isPasswordValid = await bcrypt.compare(password, userData.passwordHash);

  if (!isPasswordValid) {
    throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
  }

  // JWT 토큰 생성
  const token = jwt.sign(
    { userId: userData.user.id, email: userData.user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return { user: userData.user, token };
}

/**
 * 토큰 검증
 */
export function verifyToken(token: string): User {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    
    // 사용자 찾기
    const userData = users.get(decoded.email);
    if (!userData) {
      throw new Error('사용자를 찾을 수 없습니다.');
    }

    return userData.user;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('유효하지 않은 토큰입니다.');
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('토큰이 만료되었습니다.');
    }
    throw error;
  }
}

/**
 * 사용자 조회 (ID로)
 */
export function getUserById(userId: string): User | null {
  for (const [, userData] of users) {
    if (userData.user.id === userId) {
      return userData.user;
    }
  }
  return null;
}
