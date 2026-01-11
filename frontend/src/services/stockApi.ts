/**
 * 주식 API 서비스 (로컬 전용 모드)
 * 백엔드 서버 없이 프론트엔드 내장 데이터 및 외부 API를 사용합니다.
 */

import axios from 'axios';

export interface StockSearchResult {
  symbol: string;
  name: string;
  market: string;
  sector?: string;
  nameKo?: string;
}

export interface StockInfo {
  symbol: string;
  name: string;
  currentPrice: number;
  changeRate: number;
  changeAmount: number;
  volume: number;
  marketCap?: number;
  sector?: string;
}

// 로컬 종목 데이터 (백엔드 없이 검색 가능하도록)
const MAJOR_STOCKS: StockSearchResult[] = [
  { symbol: '005930', name: 'Samsung Electronics', nameKo: '삼성전자', market: 'KRX', sector: 'IT' },
  { symbol: '000660', name: 'SK Hynix', nameKo: 'SK하이닉스', market: 'KRX', sector: 'IT' },
  { symbol: '035420', name: 'NAVER', nameKo: '네이버', market: 'KRX', sector: 'IT' },
  { symbol: '005380', name: 'Hyundai Motor', nameKo: '현대차', market: 'KRX', sector: '자동차' },
  { symbol: 'AAPL', name: 'Apple Inc.', nameKo: '애플', market: 'NASDAQ', sector: 'IT' },
  { symbol: 'TSLA', name: 'Tesla, Inc.', nameKo: '테슬라', market: 'NASDAQ', sector: '자동차' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', nameKo: '엔비디아', market: 'NASDAQ', sector: 'IT' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', nameKo: '마이크로소프트', market: 'NASDAQ', sector: 'IT' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', nameKo: '구글', market: 'NASDAQ', sector: 'IT' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', nameKo: '아마존', market: 'NASDAQ', sector: '소비재' },
];

/**
 * 종목 검색 (로컬 데이터 기반)
 */
export async function searchStocks(query: string, market?: string, alphaKey?: string): Promise<StockSearchResult[]> {
  if (!query || query.trim().length < 2) return [];

  // 1. Alpha Vantage API 키가 있으면 직접 검색 시도
  if (alphaKey && (market !== 'KRX')) {
    try {
      const response = await axios.get(`https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${query}&apikey=${alphaKey}`);
      if (response.data && response.data.bestMatches) {
        return response.data.bestMatches.map((m: any) => ({
          symbol: m['1. symbol'],
          name: m['2. name'],
          market: m['4. region'],
          sector: '해외주식'
        }));
      }
    } catch (e) {
      console.warn('Alpha Vantage search failed, falling back to local data');
    }
  }

  // 2. 로컬 데이터에서 검색
  const searchLower = query.toLowerCase();
  return MAJOR_STOCKS.filter(s => 
    s.symbol.toLowerCase().includes(searchLower) || 
    s.name.toLowerCase().includes(searchLower) || 
    (s.nameKo && s.nameKo.includes(query))
  ).filter(s => !market || s.market === market);
}

/**
 * 현재가 조회 (Alpha Vantage 직접 호출 또는 로컬 시뮬레이션)
 */
export async function getCurrentPrice(symbol: string, market?: string, alphaKey?: string): Promise<StockInfo> {
  // 1. Alpha Vantage API 키가 있고 해외 주식이면 직접 호출
  if (alphaKey && market !== 'KRX') {
    try {
      const response = await axios.get(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${alphaKey}`);
      const quote = response.data['Global Quote'];
      if (quote && quote['05. price']) {
        return {
          symbol,
          name: symbol,
          currentPrice: parseFloat(quote['05. price']),
          changeRate: parseFloat(quote['10. change percent'].replace('%', '')),
          changeAmount: parseFloat(quote['09. change']),
          volume: parseInt(quote['06. volume']),
        };
      }
    } catch (e) {
      console.warn('Alpha Vantage price fetch failed');
    }
  }

  // 2. 시뮬레이션 데이터 반환 (백엔드 없을 때)
  const isKrx = market === 'KRX' || /^\d{6}$/.test(symbol);
  const basePrice = isKrx ? 70000 : 150;
  const changeRate = (Math.random() - 0.5) * 4; // -2% ~ +2% 랜덤

  return {
    symbol,
    name: symbol,
    currentPrice: basePrice * (1 + changeRate / 100),
    changeRate: parseFloat(changeRate.toFixed(2)),
    changeAmount: basePrice * (changeRate / 100),
    volume: 1000000,
  };
}

/**
 * 일괄 조회 (로컬 전용)
 */
export async function getBatchCurrentPrices(symbols: string[]): Promise<StockInfo[]> {
  const promises = symbols.map(s => getCurrentPrice(s));
  return Promise.all(promises);
}
