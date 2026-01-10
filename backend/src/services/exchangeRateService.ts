/**
 * 환율 API 서비스
 * 여러 환율 API를 시도하여 가장 정확한 환율 사용
 */

import axios from 'axios';

// 여러 환율 API 엔드포인트 (순서대로 시도)
const EXCHANGE_RATE_APIS = [
  {
    name: 'ExchangeRate-API',
    url: 'https://api.exchangerate-api.com/v4/latest/USD',
    parser: (data: any) => data.rates?.KRW,
  },
  {
    name: 'Fixer.io (무료)',
    url: 'https://api.fixer.io/latest?base=USD&symbols=KRW',
    parser: (data: any) => data.rates?.KRW,
  },
  {
    name: 'CurrencyAPI',
    url: 'https://api.currencyapi.com/v3/latest?apikey=free&base_currency=USD&currencies=KRW',
    parser: (data: any) => data.data?.KRW?.value,
  },
];

interface ExchangeRateResponse {
  base?: string;
  date?: string;
  rates?: {
    [key: string]: number;
  };
  data?: {
    KRW?: {
      value: number;
    };
  };
}

let cachedRate: number | null = null;
let cacheExpiry: number = 0;
const CACHE_DURATION = 30 * 60 * 1000; // 30분 캐시 (더 자주 업데이트)

/**
 * USD to KRW 환율 조회 (여러 API 시도)
 */
export async function getUSDToKRWRate(): Promise<number> {
  // 캐시된 환율이 있고 아직 유효한 경우 반환
  const now = Date.now();
  if (cachedRate && now < cacheExpiry) {
    return cachedRate;
  }

  // 여러 API를 순서대로 시도
  for (const api of EXCHANGE_RATE_APIS) {
    try {
      const response = await axios.get<ExchangeRateResponse>(api.url, {
        timeout: 5000,
        headers: {
          'Accept': 'application/json',
        },
      });

      const krwRate = api.parser(response.data);
      
      if (krwRate && krwRate > 0 && krwRate < 2000) {
        // 합리적인 범위 체크 (800 ~ 2000원)
        if (krwRate >= 800 && krwRate <= 2000) {
          // 캐시에 저장
          cachedRate = krwRate;
          cacheExpiry = now + CACHE_DURATION;
          console.log(`✅ 환율 조회 성공 (${api.name}): ${krwRate} KRW/USD`);
          return krwRate;
        } else {
          console.warn(`⚠️ 환율 범위 초과 (${api.name}): ${krwRate}`);
        }
      }
    } catch (error) {
      console.warn(`❌ 환율 API 실패 (${api.name}):`, error instanceof Error ? error.message : error);
      continue; // 다음 API 시도
    }
  }

  // 모든 API 실패 시
  console.error('⚠️ 모든 환율 API 실패, 캐시된 값 또는 기본값 사용');
  
  // 캐시된 값이 있으면 사용
  if (cachedRate) {
    return cachedRate;
  }
  
  // 기본값: 1300원 (2024년 기준 평균 환율)
  return 1300;
}

/**
 * 캐시 초기화 (테스트용)
 */
export function clearExchangeRateCache(): void {
  cachedRate = null;
  cacheExpiry = 0;
}
