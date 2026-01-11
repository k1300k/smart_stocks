/**
 * 로그인 폼 컴포넌트
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../services/authApi';
import { useAuthStore } from '../../stores/authStore';

interface LoginFormProps {
  onSwitchToSignup: () => void;
}

export default function LoginForm({ onSwitchToSignup }: LoginFormProps) {
  const { login: setAuth } = useAuthStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('로그인 시도:', { email, password: '***' });
      const result = await login({ email, password });
      console.log('로그인 성공:', result);
      setAuth(result.user, result.token);
      // 로그인 성공 후 대시보드로 이동
      navigate('/', { replace: true });
    } catch (err) {
      console.error('로그인 에러:', err);
      setError(err instanceof Error ? err.message : '로그인에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-center text-text-primary mb-6">로그인</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
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
            placeholder="비밀번호를 입력하세요"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue"
          />
        </div>

        {error && (
          <div className="p-3 rounded-md bg-red-50 border border-red-200">
            <p className="text-sm text-red-600 font-medium">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-4 py-2 bg-primary-blue text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isLoading ? '로그인 중...' : '로그인'}
        </button>
      </form>

      <div className="mt-4 text-center">
        <button
          onClick={onSwitchToSignup}
          className="text-sm text-primary-blue hover:underline"
        >
          계정이 없으신가요? 회원가입
        </button>
      </div>
    </div>
  );
}
