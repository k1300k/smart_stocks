/**
 * 한국투자증권 KIS API 서비스
 */

import axios from 'axios';

const KIS_APP_KEY = process.env.KIS_APP_KEY || '';
const KIS_APP_SECRET = process.env.KIS_APP_SECRET || '';
const KIS_BASE_URL = process.env.KIS_BASE_URL || 'https://openapi.koreainvestment.com:9443';

let accessToken: string | null = null;
let tokenExpiry: number = 0;

/**
 * 접근 토큰 발급
 */
async function getAccessToken(): Promise<string> {
  // 토큰이 유효하면 재사용
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken;
  }

  try {
    const response = await axios.post(`${KIS_BASE_URL}/oauth2/tokenP`, {
      grant_type: 'client_credentials',
      appkey: KIS_APP_KEY,
      appsecret: KIS_APP_SECRET,
    });

    const token = response.data.access_token;
    if (!token) {
      throw new Error('토큰을 받지 못했습니다.');
    }
    
    accessToken = token;
    // 토큰 만료 시간 (24시간 - 5분 여유)
    tokenExpiry = Date.now() + (24 * 60 * 60 * 1000) - (5 * 60 * 1000);

    return token;
  } catch (error) {
    console.error('KIS token error:', error);
    throw new Error('한국투자증권 API 토큰 발급 실패');
  }
}

/**
 * 국내 주식 검색
 */
export async function searchKoreanStocks(query: string): Promise<Array<{
  symbol: string;
  name: string;
  market: string;
}>> {
  if (!isKISConfigured()) {
    return [];
  }

  try {
    const token = await getAccessToken();
    
    // KIS API의 종목 검색 엔드포인트
    // 실제 엔드포인트는 KIS API 문서 참조
    const response = await axios.get(`${KIS_BASE_URL}/uapi/domestic-stock/v1/quotations/search`, {
      headers: {
        'authorization': `Bearer ${token}`,
        'appkey': KIS_APP_KEY,
        'appsecret': KIS_APP_SECRET,
        'tr_id': 'CTPF1002R', // 종목 검색 TR ID (실제 ID 확인 필요)
      },
      params: {
        user_id: '',
        seq: '1',
        query: query,
      },
      timeout: 5000,
    });

    // 응답 데이터 파싱 (실제 응답 형식에 맞게 수정 필요)
    if (response.data && response.data.output) {
      return response.data.output.map((item: any) => ({
        symbol: item.pdno,
        name: item.prdt_name,
        market: 'KRX',
      }));
    }

    return [];
  } catch (error) {
    console.error('KIS search error:', error);
    return [];
  }
}

/**
 * 국내 주식 현재가 조회
 */
export async function getKoreanStockPrice(symbol: string): Promise<{
  symbol: string;
  name: string;
  currentPrice: number;
  changeAmount: number;
  changeRate: number;
  volume: number;
} | null> {
  if (!isKISConfigured()) {
    return null;
  }

  try {
    const token = await getAccessToken();
    
    // 국내 주식 현재가 조회
    const response = await axios.get(`${KIS_BASE_URL}/uapi/domestic-stock/v1/quotations/inquire-price`, {
      headers: {
        'authorization': `Bearer ${token}`,
        'appkey': KIS_APP_KEY,
        'appsecret': KIS_APP_SECRET,
        'tr_id': 'FHKST01010100', // 현재가 조회 TR ID
      },
      params: {
        fid_cond_mrkt_div_code: 'J',
        fid_input_iscd: symbol,
      },
      timeout: 5000,
    });

    const data = response.data.output;
    
    if (!data) {
      return null;
    }

    return {
      symbol: symbol,
      name: data.prdt_name || '',
      currentPrice: parseInt(data.stck_prpr || '0'),
      changeAmount: parseInt(data.prdy_vrss || '0'),
      changeRate: parseFloat(data.prdy_ctrt || '0'),
      volume: parseInt(data.acml_vol || '0'),
    };
  } catch (error) {
    console.error('KIS price error:', error);
    return null;
  }
}

/**
 * API 설정 확인
 */
export function isKISConfigured(): boolean {
  return KIS_APP_KEY.length > 0 && KIS_APP_SECRET.length > 0;
}
