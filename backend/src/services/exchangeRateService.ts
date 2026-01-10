/**
 * 환율 API 서비스
 * ExchangeRate-API 사용 (무료, API 키 불필요)
 */

import axios from 'axios';

const EXCHANGE_RATE_API_URL = 'https://api.exchangerate-api.com/v4/latest/USD';

interface ExchangeRateResponse {
  base: string;
  date: string;
  rates: {
    [key: string]: number;
  };
}

let cachedRate: number | null = null;
let cacheExpiry: number = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1시간 캐시

/**
 * USD to KRW 환율 조회
 */
export async function getUSDToKRWRate(): Promise<number> {
  // 캐시된 환율이 있고 아직 유효한 경우 반환
  const now = Date.now();
  if (cachedRate && now < cacheExpiry) {
    return cachedRate;
  }

  try {
    const response = await axios.get<ExchangeRateResponse>(EXCHANGE_RATE_API_URL, {
      timeout: 5000,
    });

    const krwRate = response.data.rates.KRW;
    if (!krwRate || krwRate <= 0) {
      throw new Error('Invalid exchange rate');
    }

    // 캐시에 저장
    cachedRate = krwRate;
    cacheExpiry = now + CACHE_DURATION;

    return krwRate;
  } catch (error) {
    console.error('Exchange rate API error:', error);
    
    // 캐시된 값이 있으면 사용, 없으면 기본값 반환
    if (cachedRate) {
      return cachedRate;
    }
    
    // 기본값: 1300원
    return 1300;
  }
}

/**
 * 캐시 초기화 (테스트용)
 */
export function clearExchangeRateCache(): void {
  cachedRate = null;
  cacheExpiry = 0;
}
