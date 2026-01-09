/**
 * 주식 정보 조회 서비스
 * 한국투자증권 API 및 대체 API 연동
 */

import axios from 'axios';

interface StockInfo {
  symbol: string;
  name: string;
  currentPrice: number;
  changeRate: number;
  changeAmount: number;
  volume: number;
  marketCap?: number;
  sector?: string;
}

interface StockSearchResult {
  symbol: string;
  name: string;
  market: string;
  sector?: string;
}

/**
 * 종목 검색 (한국 주식)
 */
export async function searchStocks(query: string): Promise<StockSearchResult[]> {
  if (!query || query.length < 2) {
    return [];
  }

  try {
    // 한국투자증권 API 또는 대체 API 사용
    // 여기서는 샘플 데이터와 공개 API를 조합하여 사용
    
    // 실제로는 한국투자증권 API를 사용하거나
    // 공개 주식 검색 API를 사용해야 함
    
    // 임시로 주요 종목 목록에서 검색
    const majorStocks = getMajorStocks();
    const filtered = majorStocks.filter(
      stock =>
        stock.name.includes(query) ||
        stock.symbol.includes(query) ||
        stock.name.toLowerCase().includes(query.toLowerCase())
    );

    return filtered.slice(0, 10); // 최대 10개 반환
  } catch (error) {
    console.error('Stock search error:', error);
    throw new Error('종목 검색 중 오류가 발생했습니다.');
  }
}

/**
 * 현재가 조회
 */
export async function getCurrentPrice(symbol: string): Promise<StockInfo> {
  try {
    // 한국투자증권 API 사용 (실제 구현 필요)
    // 여기서는 샘플 데이터 반환
    
    // 실제 구현 시:
    // 1. 한국투자증권 API 토큰 발급
    // 2. 현재가 조회 API 호출
    // 3. Redis 캐싱 (1분 간격)
    
    // 임시로 샘플 데이터 반환
    const stock = getMajorStocks().find(s => s.symbol === symbol);
    if (!stock) {
      throw new Error('종목을 찾을 수 없습니다.');
    }

    // 실제 가격은 API에서 가져와야 함
    // 여기서는 랜덤 가격 생성 (개발용)
    const basePrice = getBasePrice(symbol);
    const changeRate = (Math.random() - 0.5) * 10; // -5% ~ +5%
    const currentPrice = Math.round(basePrice * (1 + changeRate / 100));
    const changeAmount = currentPrice - basePrice;

    return {
      symbol,
      name: stock.name,
      currentPrice,
      changeRate: Number(changeRate.toFixed(2)),
      changeAmount,
      volume: Math.floor(Math.random() * 1000000),
      sector: stock.sector,
    };
  } catch (error) {
    console.error('Get current price error:', error);
    throw new Error('현재가 조회 중 오류가 발생했습니다.');
  }
}

/**
 * 여러 종목의 현재가 일괄 조회
 */
export async function getBatchCurrentPrices(symbols: string[]): Promise<StockInfo[]> {
  const promises = symbols.map(symbol => getCurrentPrice(symbol));
  return Promise.all(promises);
}

/**
 * 주요 종목 목록 (실제로는 API 또는 DB에서 가져와야 함)
 */
function getMajorStocks(): Array<{ symbol: string; name: string; market: string; sector?: string }> {
  return [
    { symbol: '005930', name: '삼성전자', market: 'KRX', sector: 'IT' },
    { symbol: '000660', name: 'SK하이닉스', market: 'KRX', sector: 'IT' },
    { symbol: '035420', name: 'NAVER', market: 'KRX', sector: 'IT' },
    { symbol: '005380', name: '현대차', market: 'KRX', sector: '자동차' },
    { symbol: '051910', name: 'LG화학', market: 'KRX', sector: '화학' },
    { symbol: '006400', name: '삼성SDI', market: 'KRX', sector: '화학' },
    { symbol: '035720', name: '카카오', market: 'KRX', sector: 'IT' },
    { symbol: '028260', name: '삼성물산', market: 'KRX', sector: '기타' },
    { symbol: '105560', name: 'KB금융', market: 'KRX', sector: '금융' },
    { symbol: '055550', name: '신한지주', market: 'KRX', sector: '금융' },
    { symbol: '032830', name: '삼성생명', market: 'KRX', sector: '금융' },
    { symbol: '003670', name: '포스코홀딩스', market: 'KRX', sector: '산업재' },
    { symbol: '034730', name: 'SK', market: 'KRX', sector: '에너지' },
    { symbol: '096770', name: 'SK이노베이션', market: 'KRX', sector: '에너지' },
    { symbol: '207940', name: '삼성바이오로직스', market: 'KRX', sector: '바이오' },
    { symbol: '068270', name: '셀트리온', market: 'KRX', sector: '바이오' },
    { symbol: '028300', name: 'HLB', market: 'KRX', sector: '바이오' },
    { symbol: '017670', name: 'SK텔레콤', market: 'KRX', sector: 'IT' },
    { symbol: '030200', name: 'KT', market: 'KRX', sector: 'IT' },
    { symbol: '018260', name: '삼성에스디에스', market: 'KRX', sector: 'IT' },
  ];
}

/**
 * 종목별 기준 가격 (실제로는 API에서 가져와야 함)
 */
function getBasePrice(symbol: string): number {
  const priceMap: Record<string, number> = {
    '005930': 70000, // 삼성전자
    '000660': 135000, // SK하이닉스
    '035420': 220000, // NAVER
    '005380': 170000, // 현대차
    '051910': 480000, // LG화학
    '006400': 550000, // 삼성SDI
    '035720': 50000, // 카카오
    '028260': 150000, // 삼성물산
    '105560': 60000, // KB금융
    '055550': 40000, // 신한지주
    '032830': 80000, // 삼성생명
    '003670': 400000, // 포스코홀딩스
    '034730': 200000, // SK
    '096770': 120000, // SK이노베이션
    '207940': 800000, // 삼성바이오로직스
    '068270': 200000, // 셀트리온
    '028300': 50000, // HLB
    '017670': 50000, // SK텔레콤
    '030200': 30000, // KT
    '018260': 150000, // 삼성에스디에스
  };
  return priceMap[symbol] || 50000;
}
