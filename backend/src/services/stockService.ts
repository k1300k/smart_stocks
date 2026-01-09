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
  nameKo?: string; // 한글 이름
}

/**
 * 종목 검색 (국내/해외 주식)
 */
export async function searchStocks(query: string, market?: string): Promise<StockSearchResult[]> {
  if (!query || query.length < 2) {
    return [];
  }

  try {
    let stocks: Array<{ symbol: string; name: string; market: string; sector?: string }> = [];
    
    // 시장별로 필터링
    if (market === 'KRX' || !market) {
      // 국내 주식
      stocks = stocks.concat(getMajorStocks());
    }
    
    if (market === 'NYSE' || market === 'NASDAQ' || !market) {
      // 해외 주식
      stocks = stocks.concat(getForeignStocks());
    }
    
    // 검색 필터링 (한글 이름 포함)
    const queryLower = query.toLowerCase();
    const filtered = stocks.filter(
      stock => {
        const nameMatch = stock.name.toLowerCase().includes(queryLower);
        const symbolMatch = stock.symbol.toLowerCase().includes(queryLower);
        const nameKoMatch = (stock as any).nameKo && (stock as any).nameKo.includes(query);
        
        return nameMatch || symbolMatch || nameKoMatch;
      }
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
export async function getCurrentPrice(symbol: string, market?: string): Promise<StockInfo> {
  try {
    // 한국투자증권 API 사용 (실제 구현 필요)
    // 여기서는 샘플 데이터 반환
    
    // 실제 구현 시:
    // 1. 한국투자증권 API 토큰 발급
    // 2. 현재가 조회 API 호출
    // 3. Redis 캐싱 (1분 간격)
    
    // 임시로 샘플 데이터 반환
    let stock = getMajorStocks().find(s => s.symbol === symbol);
    if (!stock) {
      stock = getForeignStocks().find(s => s.symbol === symbol);
    }
    
    if (!stock) {
      throw new Error('종목을 찾을 수 없습니다.');
    }

    // 실제 가격은 API에서 가져와야 함
    // 여기서는 랜덤 가격 생성 (개발용)
    const basePrice = getBasePrice(symbol, stock.market);
    const changeRate = (Math.random() - 0.5) * 10; // -5% ~ +5%
    const currentPrice = Number((basePrice * (1 + changeRate / 100)).toFixed(2));
    const changeAmount = Number((currentPrice - basePrice).toFixed(2));

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
export async function getBatchCurrentPrices(symbols: string[], markets?: string[]): Promise<StockInfo[]> {
  const promises = symbols.map((symbol, index) => 
    getCurrentPrice(symbol, markets?.[index])
  );
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
 * 해외 주요 주식 목록 (한글 이름 포함)
 */
interface ForeignStock {
  symbol: string;
  name: string;
  nameKo: string; // 한글 이름
  market: string;
  sector?: string;
}

function getForeignStocks(): Array<{ symbol: string; name: string; market: string; sector?: string; nameKo?: string }> {
  const stocks: ForeignStock[] = [
    { symbol: 'AAPL', name: 'Apple Inc.', nameKo: '애플', market: 'NASDAQ', sector: 'IT' },
    { symbol: 'MSFT', name: 'Microsoft Corporation', nameKo: '마이크로소프트', market: 'NASDAQ', sector: 'IT' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', nameKo: '구글', market: 'NASDAQ', sector: 'IT' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', nameKo: '아마존', market: 'NASDAQ', sector: '소비재' },
    { symbol: 'TSLA', name: 'Tesla, Inc.', nameKo: '테슬라', market: 'NASDAQ', sector: '자동차' },
    { symbol: 'META', name: 'Meta Platforms Inc.', nameKo: '메타', market: 'NASDAQ', sector: 'IT' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation', nameKo: '엔비디아', market: 'NASDAQ', sector: 'IT' },
    { symbol: 'JPM', name: 'JPMorgan Chase & Co.', nameKo: 'JP모건', market: 'NYSE', sector: '금융' },
    { symbol: 'V', name: 'Visa Inc.', nameKo: '비자', market: 'NYSE', sector: '금융' },
    { symbol: 'JNJ', name: 'Johnson & Johnson', nameKo: '존슨앤존슨', market: 'NYSE', sector: '바이오' },
    { symbol: 'WMT', name: 'Walmart Inc.', nameKo: '월마트', market: 'NYSE', sector: '유통' },
    { symbol: 'PG', name: 'Procter & Gamble Co.', nameKo: 'P&G', market: 'NYSE', sector: '소비재' },
    { symbol: 'MA', name: 'Mastercard Inc.', nameKo: '마스터카드', market: 'NYSE', sector: '금융' },
    { symbol: 'UNH', name: 'UnitedHealth Group Inc.', nameKo: '유나이티드헬스', market: 'NYSE', sector: '의료' },
    { symbol: 'HD', name: 'The Home Depot, Inc.', nameKo: '홈디포', market: 'NYSE', sector: '소비재' },
    { symbol: 'DIS', name: 'The Walt Disney Company', nameKo: '월트디즈니', market: 'NYSE', sector: '엔터테인먼트' },
    { symbol: 'BAC', name: 'Bank of America Corp.', nameKo: '뱅크오브아메리카', market: 'NYSE', sector: '금융' },
    { symbol: 'XOM', name: 'Exxon Mobil Corporation', nameKo: '엑슨모빌', market: 'NYSE', sector: '에너지' },
    { symbol: 'CVX', name: 'Chevron Corporation', nameKo: '셰브론', market: 'NYSE', sector: '에너지' },
    { symbol: 'NFLX', name: 'Netflix, Inc.', nameKo: '넷플릭스', market: 'NASDAQ', sector: '엔터테인먼트' },
  ];
  
  return stocks.map(stock => ({
    symbol: stock.symbol,
    name: stock.name,
    market: stock.market,
    sector: stock.sector,
    nameKo: stock.nameKo,
  }));
}

/**
 * 종목별 기준 가격 (실제로는 API에서 가져와야 함)
 */
function getBasePrice(symbol: string, market?: string): number {
  // 국내 주식 가격 (원)
  const krxPriceMap: Record<string, number> = {
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
  
  // 해외 주식 가격 (달러)
  const foreignPriceMap: Record<string, number> = {
    'AAPL': 180, // Apple
    'MSFT': 380, // Microsoft
    'GOOGL': 140, // Alphabet
    'AMZN': 150, // Amazon
    'TSLA': 250, // Tesla
    'META': 350, // Meta
    'NVDA': 500, // NVIDIA
    'JPM': 150, // JPMorgan
    'V': 250, // Visa
    'JNJ': 160, // Johnson & Johnson
    'WMT': 160, // Walmart
    'PG': 150, // Procter & Gamble
    'MA': 400, // Mastercard
    'UNH': 500, // UnitedHealth
    'HD': 350, // Home Depot
    'DIS': 100, // Disney
    'BAC': 35, // Bank of America
    'XOM': 110, // Exxon Mobil
    'CVX': 150, // Chevron
    'NFLX': 450, // Netflix
  };
  
  if (market === 'KRX' || (!market && krxPriceMap[symbol])) {
    return krxPriceMap[symbol] || 50000;
  }
  
  return foreignPriceMap[symbol] || 100;
}
