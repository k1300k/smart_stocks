/**
 * 포트폴리오 관련 타입 정의
 */

export interface Portfolio {
  id: string;
  userId: string;
  name: string;
  holdings: Holding[];
  totalValue: number;
  totalProfitLoss: number;
}

export type Currency = 'KRW' | 'USD';

export interface Holding {
  symbol: string;        // 005930 (삼성전자)
  name: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;  // KIS API에서 실시간 업데이트
  currency: Currency;    // 통화 (기본값: KRW)
  sector: string;
  tags: string[];        // 사용자 정의 태그
  profitLoss?: number;   // 손익
  profitLossRate?: number; // 손익률 (%)
}

export type ViewMode = 'sector' | 'profitLoss' | 'theme';

/**
 * 마인드맵 노드 구조
 */
export interface MindMapNode {
  id: string;
  name: string;
  value: number;         // 포트폴리오 가치
  profitLoss?: number;   // 손익
  profitLossRate?: number; // 손익률
  type: 'root' | 'category' | 'stock';
  children?: MindMapNode[];
  parent?: string;
  sector?: string;
  tags?: string[];
  symbol?: string;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
  vx?: number;
  vy?: number;
  radius?: number;       // 노드 반지름 (시각화용)
}

/**
 * API 응답 형식
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: string;
}
