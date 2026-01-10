/**
 * 통화 관련 유틸리티 함수
 */

import { useExchangeRateStore } from '../stores/exchangeRateStore';

/**
 * 현재 USD->KRW 환율 가져오기
 */
export function getUsdToKrwRate(): number {
  return useExchangeRateStore.getState().usdToKrwRate;
}

/**
 * 달러를 원화로 변환
 */
export function convertUsdToKrw(usd: number): number {
  const rate = getUsdToKrwRate();
  return usd * rate;
}

/**
 * 원화를 달러로 변환
 */
export function convertKrwToUsd(krw: number): number {
  const rate = getUsdToKrwRate();
  if (!rate) return 0;
  return krw / rate;
}

export function formatKRW(krw: number): string {
  return `${krw.toLocaleString('ko-KR')}원`;
}

export function formatUSD(usd: number): string {
  return `$${usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
