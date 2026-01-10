/**
 * 통화 관련 유틸리티 함수
 */

import { Currency } from '../types';
import { useExchangeRateStore } from '../stores/exchangeRateStore';

/**
 * 통화를 원화로 변환
 */
export function convertToKRW(amount: number, currency: Currency): number {
  if (currency === 'KRW') {
    return amount;
  }
  // 실시간 환율 사용
  const rate = useExchangeRateStore.getState().usdToKrwRate;
  return amount * rate;
}

/**
 * 원화를 다른 통화로 변환
 */
export function convertFromKRW(amount: number, currency: Currency): number {
  if (currency === 'KRW') {
    return amount;
  }
  // 실시간 환율 사용
  const rate = useExchangeRateStore.getState().usdToKrwRate;
  return amount / rate;
}

/**
 * 현재 USD to KRW 환율 가져오기
 */
export function getCurrentExchangeRate(): number {
  return useExchangeRateStore.getState().usdToKrwRate;
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
