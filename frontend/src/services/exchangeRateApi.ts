/**
 * 환율 API 서비스
 */

import axios from 'axios';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';

export interface ExchangeRateResponse {
  success: boolean;
  data: {
    rate: number;
    from: string;
    to: string;
    timestamp: string;
  };
  timestamp: string;
}

/**
 * USD to KRW 환율 조회
 */
export async function getUSDToKRWRate(): Promise<number> {
  try {
    const response = await axios.get<ExchangeRateResponse>(
      `${API_BASE_URL}/exchange-rate/usd-krw`,
      { timeout: 5000 }
    );

    if (response.data.success && response.data.data.rate) {
      return response.data.data.rate;
    }
    
    // 기본값 반환
    return 1300;
  } catch (error) {
    console.error('Exchange rate API error:', error);
    // 기본값 반환
    return 1300;
  }
}
