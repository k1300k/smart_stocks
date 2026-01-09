/**
 * 주식 API 서비스
 */

import axios from 'axios';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3000/api';

export interface StockSearchResult {
  symbol: string;
  name: string;
  market: string;
  sector?: string;
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

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
  };
  timestamp: string;
}

/**
 * 종목 검색
 */
export async function searchStocks(query: string): Promise<StockSearchResult[]> {
  if (!query || query.trim().length < 2) {
    return [];
  }

  try {
    const response = await axios.get<ApiResponse<StockSearchResult[]>>(
      `${API_BASE_URL}/stocks/search`,
      { params: { q: query.trim() } }
    );

    if (response.data.success) {
      return response.data.data;
    }
    return [];
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
    const response = await axios.get<ApiResponse<StockInfo>>(
      `${API_BASE_URL}/stocks/price/${symbol}`
    );

    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.error?.message || '현재가 조회 실패');
  } catch (error) {
    console.error('Get current price error:', error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error?.message || '현재가 조회 중 오류가 발생했습니다.');
    }
    throw error;
  }
}

/**
 * 여러 종목 현재가 일괄 조회
 */
export async function getBatchCurrentPrices(symbols: string[]): Promise<StockInfo[]> {
  try {
    const response = await axios.post<ApiResponse<StockInfo[]>>(
      `${API_BASE_URL}/stocks/batch-price`,
      { symbols }
    );

    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.error?.message || '일괄 조회 실패');
  } catch (error) {
    console.error('Batch price error:', error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error?.message || '일괄 조회 중 오류가 발생했습니다.');
    }
    throw error;
  }
}
