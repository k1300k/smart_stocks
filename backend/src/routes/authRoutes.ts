/**
 * 인증 관련 API 라우트
 */

import { Router, Request, Response } from 'express';
import { signup, login } from '../services/authService';

const router = Router();

/**
 * 회원가입
 * POST /api/auth/signup
 * Body: { email: string, password: string, name: string }
 */
router.post('/signup', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: '이메일, 비밀번호, 이름을 모두 입력하세요.',
        },
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_EMAIL',
          message: '올바른 이메일 형식이 아닙니다.',
        },
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // 비밀번호 최소 길이 검증
    if (password.length < 6) {
      res.status(400).json({
        success: false,
        error: {
          code: 'WEAK_PASSWORD',
          message: '비밀번호는 최소 6자 이상이어야 합니다.',
        },
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const result = await signup(email, password, name);

    res.status(201).json({
      success: true,
      data: {
        user: result.user,
        token: result.token,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SIGNUP_ERROR',
        message: error instanceof Error ? error.message : '회원가입 중 오류가 발생했습니다.',
      },
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * 로그인
 * POST /api/auth/login
 * Body: { email: string, password: string }
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: '이메일과 비밀번호를 입력하세요.',
        },
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const result = await login(email, password);

    res.json({
      success: true,
      data: {
        user: result.user,
        token: result.token,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({
      success: false,
      error: {
        code: 'LOGIN_ERROR',
        message: error instanceof Error ? error.message : '로그인에 실패했습니다.',
      },
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * 토큰 검증
 * GET /api/auth/verify
 * Header: Authorization: Bearer <token>
 */
router.get('/verify', async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: {
          code: 'NO_TOKEN',
          message: '인증 토큰이 필요합니다.',
        },
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const token = authHeader.substring(7);
    const { verifyToken } = await import('../services/authService');
    const user = verifyToken(token);

    res.json({
      success: true,
      data: { user },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Verify error:', error);
    res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: error instanceof Error ? error.message : '유효하지 않은 토큰입니다.',
      },
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
