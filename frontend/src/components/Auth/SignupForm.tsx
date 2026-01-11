/**
 * 회원가입 폼 컴포넌트
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signup } from '../../services/authApi';
import { useAuthStore } from '../../stores/authStore';

interface SignupFormProps {
  onSwitchToLogin: () => void;
}

export default function SignupForm({ onSwitchToLogin }: SignupFormProps) {
  const { login: setAuth } = useAuthStore();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 비밀번호 확인
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    // 비밀번호 최소 길이 확인
    if (password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }

    setIsLoading(true);

    try {
      console.log('회원가입 시도:', { email, password: '***', name });
      const result = await signup({ name, email, password });
      console.log('회원가입 성공:', result);
      setAuth(result.user, result.token);
      // 회원가입 성공 후 대시보드로 이동
      navigate('/', { replace: true });
    } catch (err) {
      console.error('회원가입 에러:', err);
      setError(err instanceof Error ? err.message : '회원가입에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-center text-text-primary mb-6">회원가입</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            이름
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="이름을 입력하세요"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            이메일
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="example@email.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            비밀번호
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="최소 6자 이상"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            비밀번호 확인
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="비밀번호를 다시 입력하세요"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue"
          />
        </div>

        {error && (
          <div className="p-3 rounded-md bg-red-50 border border-red-200">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-4 py-2 bg-primary-blue text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isLoading ? '가입 중...' : '회원가입'}
        </button>
      </form>

      <div className="mt-4 text-center">
        <button
          onClick={onSwitchToLogin}
          className="text-sm text-primary-blue hover:underline"
        >
          이미 계정이 있으신가요? 로그인
        </button>
      </div>
    </div>
  );
}
