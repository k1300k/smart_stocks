/**
 * 통화 관련 유틸리티 함수
 */

import { Currency } from '../types';

// USD to KRW 환율 (기본값: 1300원)
// TODO: 나중에 실시간 환율 API 연동 가능
export const USD_TO_KRW_RATE = 1300;

/**
 * 통화를 원화로 변환
 */
export function convertToKRW(amount: number, currency: Currency): number {
  if (currency === 'KRW') {
    return amount;
  }
  return amount * USD_TO_KRW_RATE;
}

/**
 * 원화를 다른 통화로 변환
 */
export function convertFromKRW(amount: number, currency: Currency): number {
  if (currency === 'KRW') {
    return amount;
  }
  return amount / USD_TO_KRW_RATE;
}

/**
 * 통화 심볼 반환
 */
export function getCurrencySymbol(currency: Currency): string {
  return currency === 'KRW' ? '원' : '$';
}

/**
 * 통화 포맷팅
 */
export function formatCurrency(amount: number, currency: Currency, showSymbol: boolean = true): string {
  const symbol = showSymbol ? getCurrencySymbol(currency) : '';
  
  if (currency === 'KRW') {
    return `${amount.toLocaleString('ko-KR')}${symbol}`;
  } else {
    return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}

/**
 * 통화 이름 반환
 */
export function getCurrencyName(currency: Currency): string {
  return currency === 'KRW' ? '원화' : '달러';
}
