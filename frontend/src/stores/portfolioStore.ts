/**
 * 포트폴리오 상태 관리 스토어 (Zustand)
 * localStorage에 자동 저장되어 페이지 새로고침 후에도 상태 유지
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Portfolio, Holding } from '../types';
import { convertToKRW } from '../utils/currency';

interface PortfolioState {
  portfolio: Portfolio;
  addHolding: (holding: Holding) => void;
  updateHolding: (symbol: string, holding: Partial<Holding>) => void;
  removeHolding: (symbol: string) => void;
  setHoldings: (holdings: Holding[]) => void;
  updatePortfolio: (portfolio: Partial<Portfolio>) => void;
  calculateTotalValue: () => number;
  calculateTotalProfitLoss: () => number;
}

// 초기 샘플 데이터
const initialHoldings: Holding[] = [
  {
    symbol: '005930',
    name: '삼성전자',
    quantity: 100,
    avgPrice: 65000,
    currentPrice: 70000,
    currency: 'KRW',
    sector: 'IT',
    tags: ['대형주', '배당주'],
  },
  {
    symbol: '000660',
    name: 'SK하이닉스',
    quantity: 50,
    avgPrice: 120000,
    currentPrice: 135000,
    currency: 'KRW',
    sector: 'IT',
    tags: ['반도체', 'AI'],
  },
  {
    symbol: '035420',
    name: 'NAVER',
    quantity: 30,
    avgPrice: 200000,
    currentPrice: 220000,
    currency: 'KRW',
    sector: 'IT',
    tags: ['인터넷', 'AI'],
  },
  {
    symbol: '005380',
    name: '현대차',
    quantity: 80,
    avgPrice: 180000,
    currentPrice: 170000,
    currency: 'KRW',
    sector: '자동차',
    tags: ['자동차', '전기차'],
  },
  {
    symbol: '051910',
    name: 'LG화학',
    quantity: 40,
    avgPrice: 450000,
    currentPrice: 480000,
    currency: 'KRW',
    sector: '화학',
    tags: ['배터리', 'ESG'],
  },
  {
    symbol: '006400',
    name: '삼성SDI',
    quantity: 25,
    avgPrice: 500000,
    currentPrice: 550000,
    currency: 'KRW',
    sector: '화학',
    tags: ['배터리', '전기차'],
  },
];

const calculateValue = (holdings: Holding[]) => {
  return holdings.reduce((sum, h) => {
    const priceInKRW = convertToKRW(h.currentPrice, h.currency);
    return sum + priceInKRW * h.quantity;
  }, 0);
};

const calculateProfitLoss = (holdings: Holding[]) => {
  return holdings.reduce((sum, h) => {
    const avgPriceInKRW = convertToKRW(h.avgPrice, h.currency);
    const currentPriceInKRW = convertToKRW(h.currentPrice, h.currency);
    return sum + (currentPriceInKRW - avgPriceInKRW) * h.quantity;
  }, 0);
};

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set, get) => ({
      portfolio: {
        id: '1',
        userId: 'user1',
        name: '나의 포트폴리오',
        holdings: initialHoldings,
        totalValue: calculateValue(initialHoldings),
        totalProfitLoss: calculateProfitLoss(initialHoldings),
      },

      addHolding: (holding: Holding) => {
        set(state => {
          const newHoldings = [...state.portfolio.holdings, holding];
          const totalValue = calculateValue(newHoldings);
          const totalProfitLoss = calculateProfitLoss(newHoldings);
          return {
            portfolio: {
              ...state.portfolio,
              holdings: newHoldings,
              totalValue,
              totalProfitLoss,
            },
          };
        });
      },

      updateHolding: (symbol: string, updates: Partial<Holding>) => {
        set(state => {
          const newHoldings = state.portfolio.holdings.map(h =>
            h.symbol === symbol ? { ...h, ...updates } : h
          );
          const totalValue = calculateValue(newHoldings);
          const totalProfitLoss = calculateProfitLoss(newHoldings);
          return {
            portfolio: {
              ...state.portfolio,
              holdings: newHoldings,
              totalValue,
              totalProfitLoss,
            },
          };
        });
      },

      removeHolding: (symbol: string) => {
        set(state => {
          const newHoldings = state.portfolio.holdings.filter(h => h.symbol !== symbol);
          const totalValue = calculateValue(newHoldings);
          const totalProfitLoss = calculateProfitLoss(newHoldings);
          return {
            portfolio: {
              ...state.portfolio,
              holdings: newHoldings,
              totalValue,
              totalProfitLoss,
            },
          };
        });
      },

      setHoldings: (holdings: Holding[]) => {
        set(state => {
          const totalValue = calculateValue(holdings);
          const totalProfitLoss = calculateProfitLoss(holdings);
          return {
            portfolio: {
              ...state.portfolio,
              holdings,
              totalValue,
              totalProfitLoss,
            },
          };
        });
      },

      updatePortfolio: (updates: Partial<Portfolio>) => {
        set(state => {
          const updatedPortfolio = { ...state.portfolio, ...updates };
          // 업데이트 후 totalValue와 totalProfitLoss 재계산
          const totalValue = calculateValue(updatedPortfolio.holdings);
          const totalProfitLoss = calculateProfitLoss(updatedPortfolio.holdings);
          return {
            portfolio: {
              ...updatedPortfolio,
              totalValue,
              totalProfitLoss,
            },
          };
        });
      },

      calculateTotalValue: () => {
        return get().portfolio.totalValue;
      },

      calculateTotalProfitLoss: () => {
        return get().portfolio.totalProfitLoss;
      },
    }),
    {
      name: 'mindstock-portfolio-storage', // localStorage 키 이름
      // portfolio 객체 전체를 저장
      partialize: (state) => ({ portfolio: state.portfolio }),
    }
  )
);
