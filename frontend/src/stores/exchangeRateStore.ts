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
  updateRate: () => Promise<void>;
}

// 기본 환율 (1 USD = 1300 KRW)
const DEFAULT_RATE = 1300;
const UPDATE_INTERVAL = 60 * 60 * 1000; // 1시간마다 업데이트

export const useExchangeRateStore = create<ExchangeRateState>()(
  persist(
    (set, get) => ({
      usdToKrwRate: DEFAULT_RATE,
      lastUpdated: null,
      isLoading: false,

      updateRate: async () => {
        const state = get();
        const now = Date.now();

        // 이미 최근에 업데이트했고 아직 1시간이 지나지 않았으면 스킵
        if (state.lastUpdated && (now - state.lastUpdated) < UPDATE_INTERVAL) {
          return;
        }

        set({ isLoading: true });

        try {
          const rate = await getUSDToKRWRate();
          set({
            usdToKrwRate: rate,
            lastUpdated: now,
            isLoading: false,
          });
        } catch (error) {
          console.error('Failed to update exchange rate:', error);
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'exchange-rate-storage',
      partialize: (state) => ({
        usdToKrwRate: state.usdToKrwRate,
        lastUpdated: state.lastUpdated,
      }),
    }
  )
);
