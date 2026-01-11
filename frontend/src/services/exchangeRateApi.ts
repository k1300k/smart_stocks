/**
 * 환율 API 서비스 (백엔드 없이 프론트엔드에서 직접 호출)
 */

import axios from 'axios';

/**
 * USD to KRW 환율 조회
 * 백엔드 서버 없이 공공 API를 직접 호출합니다.
 */
export async function getUSDToKRWRate(): Promise<number> {
  try {
    // 1. ExchangeRate-API (무료, 키 불필요)
    const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD', { timeout: 5000 });
    if (response.data && response.data.rates && response.data.rates.KRW) {
      return response.data.rates.KRW;
    }
    throw new Error('환율 데이터를 찾을 수 없습니다.');
  } catch (error) {
    console.error('Exchange rate API error:', error);
    // 모든 API 실패 시 기본값 반환
    return 1350; // 기본값
  }
}
