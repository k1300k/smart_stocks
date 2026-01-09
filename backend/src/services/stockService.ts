/**
 * 주식 정보 조회 서비스
 * 한국투자증권 API 및 대체 API 연동
 */

import { searchKoreanStocks, getKoreanStockPrice, isKISConfigured } from './kisApiService';
import { searchForeignStocks, getForeignStockPrice, isAlphaVantageConfigured } from './alphaVantageService';

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
export async function searchStocks(query: string, market?: string, alphaKey?: string): Promise<StockSearchResult[]> {
  if (!query || query.length < 2) {
    return [];
  }

  try {
    let apiResults: StockSearchResult[] = [];
    let localResults: Array<{ symbol: string; name: string; market: string; sector?: string }> = [];
    
    // 실제 API 사용 시도
    if (market === 'KRX' || !market) {
      // 국내 주식 - KIS API
      if (isKISConfigured()) {
        try {
          const kisResults = await searchKoreanStocks(query);
          apiResults = apiResults.concat(kisResults);
        } catch (error) {
          console.error('KIS API error, using fallback:', error);
        }
      }
      // Fallback: 로컬 데이터
      localResults = localResults.concat(getMajorStocks());
    }
    
    if (market === 'NYSE' || market === 'NASDAQ' || !market) {
      // 해외 주식 - Alpha Vantage API
      if (isAlphaVantageConfigured(alphaKey)) {
        try {
          const foreignResults = await searchForeignStocks(query, alphaKey);
          apiResults = apiResults.concat(foreignResults);
        } catch (error) {
          console.error('Alpha Vantage API error, using fallback:', error);
        }
      }
      // Fallback: 로컬 데이터
      localResults = localResults.concat(getForeignStocks());
    }
    
    // API 결과가 있으면 우선 사용, 없으면 로컬 데이터 사용
    let stocks = apiResults.length > 0 ? apiResults : localResults;
    
    // 로컬 검색 필터링 (API 결과가 없을 때)
    if (apiResults.length === 0) {
      const queryLower = query.toUpperCase().trim();
      const queryLowerForName = query.toLowerCase();
      
      stocks = (stocks as any[])
        .map(stock => {
          const stockAny = stock as any;
          const exactSymbolMatch = stock.market !== 'KRX' && stock.symbol === queryLower;
          const symbolMatch = stock.symbol.toUpperCase().includes(queryLower);
          const nameMatch = stock.name.toLowerCase().includes(queryLowerForName);
          const nameKoMatch = stockAny.nameKo && stockAny.nameKo.includes(query);
          
          let score = 0;
          if (exactSymbolMatch) score = 100;
          else if (symbolMatch && stock.market !== 'KRX') score = 80;
          else if (symbolMatch) score = 50;
          else if (nameKoMatch) score = 40;
          else if (nameMatch) score = 30;
          
          return { stock, score, matches: exactSymbolMatch || symbolMatch || nameMatch || nameKoMatch };
        })
        .filter(item => item.matches)
        .sort((a, b) => b.score - a.score)
        .map(item => item.stock);
    }

    return stocks.slice(0, 10);
  } catch (error) {
    console.error('Stock search error:', error);
    throw new Error('종목 검색 중 오류가 발생했습니다.');
  }
}

/**
 * 현재가 조회
 */
export async function getCurrentPrice(symbol: string, market?: string, alphaKey?: string): Promise<StockInfo> {
  try {
    let apiResult = null;
    
    // 실제 API 호출 시도
    if (market === 'KRX' || (!market && /^\d{6}$/.test(symbol))) {
      // 국내 주식
      if (isKISConfigured()) {
        try {
          apiResult = await getKoreanStockPrice(symbol);
        } catch (error) {
          console.error('KIS API error, using fallback:', error);
        }
      }
    } else {
      // 해외 주식
      if (isAlphaVantageConfigured(alphaKey)) {
        try {
          apiResult = await getForeignStockPrice(symbol, alphaKey);
        } catch (error) {
          console.error('Alpha Vantage API error, using fallback:', error);
        }
      }
    }
    
    // API 결과가 있으면 반환
    if (apiResult) {
      // 로컬 데이터에서 이름 찾기
      let stockName = symbol;
      const localStock = getMajorStocks().find(s => s.symbol === symbol) || 
                        getForeignStocks().find(s => s.symbol === symbol);
      if (localStock) {
        stockName = localStock.name;
      }
      
      return {
        symbol: apiResult.symbol,
        name: stockName,
        currentPrice: apiResult.currentPrice,
        changeRate: apiResult.changeRate,
        changeAmount: apiResult.changeAmount,
        volume: apiResult.volume,
      };
    }
    
    // Fallback: 로컬 데이터 사용
    let stock = getMajorStocks().find(s => s.symbol === symbol);
    if (!stock) {
      stock = getForeignStocks().find(s => s.symbol === symbol);
    }
    
    if (!stock) {
      throw new Error('종목을 찾을 수 없습니다.');
    }

    const basePrice = getBasePrice(symbol, stock.market);
    const changeRate = (Math.random() - 0.5) * 10;
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
    // 주요 IT 기업
    { symbol: 'AAPL', name: 'Apple Inc.', nameKo: '애플', market: 'NASDAQ', sector: 'IT' },
    { symbol: 'MSFT', name: 'Microsoft Corporation', nameKo: '마이크로소프트', market: 'NASDAQ', sector: 'IT' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', nameKo: '구글', market: 'NASDAQ', sector: 'IT' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', nameKo: '아마존', market: 'NASDAQ', sector: '소비재' },
    { symbol: 'TSLA', name: 'Tesla, Inc.', nameKo: '테슬라', market: 'NASDAQ', sector: '자동차' },
    { symbol: 'META', name: 'Meta Platforms Inc.', nameKo: '메타', market: 'NASDAQ', sector: 'IT' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation', nameKo: '엔비디아', market: 'NASDAQ', sector: 'IT' },
    { symbol: 'NFLX', name: 'Netflix, Inc.', nameKo: '넷플릭스', market: 'NASDAQ', sector: '엔터테인먼트' },
    
    // 반도체 & 기술
    { symbol: 'AMD', name: 'Advanced Micro Devices, Inc.', nameKo: 'AMD', market: 'NASDAQ', sector: 'IT' },
    { symbol: 'INTC', name: 'Intel Corporation', nameKo: '인텔', market: 'NASDAQ', sector: 'IT' },
    { symbol: 'QCOM', name: 'QUALCOMM Incorporated', nameKo: '퀄컴', market: 'NASDAQ', sector: 'IT' },
    { symbol: 'AVGO', name: 'Broadcom Inc.', nameKo: '브로드컴', market: 'NASDAQ', sector: 'IT' },
    
    // 우주 & 통신
    { symbol: 'ASTS', name: 'AST SpaceMobile, Inc.', nameKo: 'AST 스페이스모바일', market: 'NASDAQ', sector: 'IT' },
    { symbol: 'RKLB', name: 'Rocket Lab USA, Inc.', nameKo: '로켓랩', market: 'NASDAQ', sector: '항공우주' },
    { symbol: 'SPCE', name: 'Virgin Galactic Holdings, Inc.', nameKo: '버진갤럭틱', market: 'NYSE', sector: '항공우주' },
    
    // 금융
    { symbol: 'JPM', name: 'JPMorgan Chase & Co.', nameKo: 'JP모건', market: 'NYSE', sector: '금융' },
    { symbol: 'V', name: 'Visa Inc.', nameKo: '비자', market: 'NYSE', sector: '금융' },
    { symbol: 'MA', name: 'Mastercard Inc.', nameKo: '마스터카드', market: 'NYSE', sector: '금융' },
    { symbol: 'BAC', name: 'Bank of America Corp.', nameKo: '뱅크오브아메리카', market: 'NYSE', sector: '금융' },
    
    // 헬스케어
    { symbol: 'JNJ', name: 'Johnson & Johnson', nameKo: '존슨앤존슨', market: 'NYSE', sector: '바이오' },
    { symbol: 'UNH', name: 'UnitedHealth Group Inc.', nameKo: '유나이티드헬스', market: 'NYSE', sector: '의료' },
    { symbol: 'PFE', name: 'Pfizer Inc.', nameKo: '화이자', market: 'NYSE', sector: '바이오' },
    { symbol: 'MRNA', name: 'Moderna, Inc.', nameKo: '모더나', market: 'NASDAQ', sector: '바이오' },
    { symbol: 'NVO', name: 'Novo Nordisk A/S', nameKo: '노보노디스크', market: 'NYSE', sector: '바이오' },
    { symbol: 'LLY', name: 'Eli Lilly and Company', nameKo: '일라이릴리', market: 'NYSE', sector: '바이오' },
    { symbol: 'ABBV', name: 'AbbVie Inc.', nameKo: '애브비', market: 'NYSE', sector: '바이오' },
    
    // 소비재 & 유통
    { symbol: 'WMT', name: 'Walmart Inc.', nameKo: '월마트', market: 'NYSE', sector: '유통' },
    { symbol: 'PG', name: 'Procter & Gamble Co.', nameKo: 'P&G', market: 'NYSE', sector: '소비재' },
    { symbol: 'HD', name: 'The Home Depot, Inc.', nameKo: '홈디포', market: 'NYSE', sector: '소비재' },
    { symbol: 'NKE', name: 'Nike, Inc.', nameKo: '나이키', market: 'NYSE', sector: '소비재' },
    { symbol: 'SBUX', name: 'Starbucks Corporation', nameKo: '스타벅스', market: 'NASDAQ', sector: '소비재' },
    
    // 엔터테인먼트
    { symbol: 'DIS', name: 'The Walt Disney Company', nameKo: '월트디즈니', market: 'NYSE', sector: '엔터테인먼트' },
    
    // 에너지
    { symbol: 'XOM', name: 'Exxon Mobil Corporation', nameKo: '엑슨모빌', market: 'NYSE', sector: '에너지' },
    { symbol: 'CVX', name: 'Chevron Corporation', nameKo: '셰브론', market: 'NYSE', sector: '에너지' },
    
    // 전기차 & 자동차
    { symbol: 'F', name: 'Ford Motor Company', nameKo: '포드', market: 'NYSE', sector: '자동차' },
    { symbol: 'GM', name: 'General Motors Company', nameKo: 'GM', market: 'NYSE', sector: '자동차' },
    { symbol: 'RIVN', name: 'Rivian Automotive, Inc.', nameKo: '리비안', market: 'NASDAQ', sector: '자동차' },
    { symbol: 'LCID', name: 'Lucid Group, Inc.', nameKo: '루시드', market: 'NASDAQ', sector: '자동차' },
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
    // 주요 IT
    'AAPL': 180, 'MSFT': 380, 'GOOGL': 140, 'AMZN': 150,
    'TSLA': 250, 'META': 350, 'NVDA': 500, 'NFLX': 450,
    // 반도체
    'AMD': 120, 'INTC': 45, 'QCOM': 140, 'AVGO': 900,
    // 우주 & 통신
    'ASTS': 25, 'RKLB': 18, 'SPCE': 8,
    // 금융
    'JPM': 150, 'V': 250, 'MA': 400, 'BAC': 35,
    // 헬스케어
    'JNJ': 160, 'UNH': 500, 'PFE': 30, 'MRNA': 85,
    'NVO': 135, 'LLY': 620, 'ABBV': 170,
    // 소비재
    'WMT': 160, 'PG': 150, 'HD': 350, 'NKE': 110, 'SBUX': 95,
    // 엔터테인먼트
    'DIS': 100,
    // 에너지
    'XOM': 110, 'CVX': 150,
    // 자동차
    'F': 12, 'GM': 38, 'RIVN': 15, 'LCID': 3,
  };
  
  if (market === 'KRX' || (!market && krxPriceMap[symbol])) {
    return krxPriceMap[symbol] || 50000;
  }
  
  return foreignPriceMap[symbol] || 100;
}
