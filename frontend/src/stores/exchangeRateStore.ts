/**
 * 환율 상태 관리 스토어
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getUSDToKRWRate } from '../services/exchangeRateApi';

interface ExchangeRateState {
  usdToKrwRate: number;
  lastUpdated: number | null;
  isLoading: boolean;
  isManualRate: boolean; // 사용자가 직접 입력한 환율인지
  updateRate: (force?: boolean) => Promise<void>;
  setManualRate: (rate: number) => void;
}

// 기본 환율 (1 USD = 1300 KRW)
const DEFAULT_RATE = 1300;
const UPDATE_INTERVAL = 30 * 60 * 1000; // 30분마다 업데이트

export const useExchangeRateStore = create<ExchangeRateState>()(
  persist(
    (set, get) => ({
      usdToKrwRate: DEFAULT_RATE,
      lastUpdated: null,
      isLoading: false,
      isManualRate: false,

      updateRate: async (force: boolean = false) => {
        const state = get();
        const now = Date.now();

        // 강제 업데이트가 아닌 경우
        if (!force) {
          // 수동으로 설정한 환율이면 자동 업데이트 스킵
          if (state.isManualRate) {
            console.log('⏭️ 환율 자동 업데이트 스킵: 수동 설정 모드');
            return;
          }

          // 이미 최근에 업데이트했고 아직 30분이 지나지 않았으면 스킵
          if (state.lastUpdated && (now - state.lastUpdated) < UPDATE_INTERVAL) {
            const remainingMinutes = Math.ceil((UPDATE_INTERVAL - (now - state.lastUpdated)) / 60000);
            console.log(`⏭️ 환율 자동 업데이트 스킵: ${remainingMinutes}분 후 업데이트 예정`);
            return;
          }
        }

        console.log('🔄 환율 자동 업데이트 시작...');
        set({ isLoading: true });

        try {
          const rate = await getUSDToKRWRate();
          console.log(`✅ 환율 업데이트 완료: 1 USD = ${rate.toLocaleString('ko-KR')} KRW`);
          set({
            usdToKrwRate: rate,
            lastUpdated: now,
            isLoading: false,
            isManualRate: false, // 강제 업데이트 시 수동 모드 해제
          });
        } catch (error) {
          console.error('❌ 환율 업데이트 실패:', error);
          set({ isLoading: false });
          // 에러를 다시 throw하지 않고 기본값 유지 (사용자 경험 개선)
          // throw error;
        }
      },

      setManualRate: (rate: number) => {
        if (rate > 0 && rate < 2000) {
          set({
            usdToKrwRate: rate,
            lastUpdated: Date.now(),
            isManualRate: true,
          });
        }
      },
    }),
    {
      name: 'exchange-rate-storage',
      partialize: (state) => ({
        usdToKrwRate: state.usdToKrwRate,
        lastUpdated: state.lastUpdated,
        isManualRate: state.isManualRate,
      }),
    }
  )
);
