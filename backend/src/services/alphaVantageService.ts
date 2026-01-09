/**
 * Alpha Vantage API 서비스 (해외 주식)
 */

import axios from 'axios';

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY || 'demo';
const ALPHA_VANTAGE_BASE_URL = 'https://www.alphavantage.co/query';

interface AlphaVantageSearchResult {
  '1. symbol': string;
  '2. name': string;
  '3. type': string;
  '4. region': string;
  '5. marketOpen': string;
  '6. marketClose': string;
  '7. timezone': string;
  '8. currency': string;
  '9. matchScore': string;
}

interface AlphaVantageQuote {
  '01. symbol': string;
  '02. open': string;
  '03. high': string;
  '04. low': string;
  '05. price': string;
  '06. volume': string;
  '07. latest trading day': string;
  '08. previous close': string;
  '09. change': string;
  '10. change percent': string;
}

/**
 * 해외 주식 검색
 */
export async function searchForeignStocks(query: string): Promise<Array<{
  symbol: string;
  name: string;
  market: string;
  region: string;
}>> {
  try {
    const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
      params: {
        function: 'SYMBOL_SEARCH',
        keywords: query,
        apikey: ALPHA_VANTAGE_API_KEY,
      },
      timeout: 5000,
    });

    if (response.data['bestMatches']) {
      return response.data['bestMatches'].map((match: AlphaVantageSearchResult) => ({
        symbol: match['1. symbol'],
        name: match['2. name'],
        market: match['4. region'] === 'United States' ? 'NASDAQ' : match['4. region'],
        region: match['4. region'],
      }));
    }

    return [];
  } catch (error) {
    console.error('Alpha Vantage search error:', error);
    // API 에러 시 빈 배열 반환 (fallback to local data)
    return [];
  }
}

/**
 * 해외 주식 현재가 조회
 */
export async function getForeignStockPrice(symbol: string): Promise<{
  symbol: string;
  currentPrice: number;
  changeAmount: number;
  changeRate: number;
  volume: number;
} | null> {
  try {
    const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
      params: {
        function: 'GLOBAL_QUOTE',
        symbol: symbol,
        apikey: ALPHA_VANTAGE_API_KEY,
      },
      timeout: 5000,
    });

    const quote: AlphaVantageQuote = response.data['Global Quote'];
    
    if (!quote || !quote['05. price']) {
      return null;
    }

    const currentPrice = parseFloat(quote['05. price']);
    const change = parseFloat(quote['09. change']);
    const changePercent = parseFloat(quote['10. change percent'].replace('%', ''));

    return {
      symbol: quote['01. symbol'],
      currentPrice,
      changeAmount: change,
      changeRate: changePercent,
      volume: parseInt(quote['06. volume']),
    };
  } catch (error) {
    console.error('Alpha Vantage price error:', error);
    return null;
  }
}

/**
 * API 키 유효성 확인
 */
export function isAlphaVantageConfigured(): boolean {
  return ALPHA_VANTAGE_API_KEY !== 'demo' && ALPHA_VANTAGE_API_KEY.length > 0;
}
