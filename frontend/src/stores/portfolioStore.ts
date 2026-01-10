/**
 * 포트폴리오 상태 관리 스토어 (Zustand)
 * localStorage에 자동 저장되어 페이지 새로고침 후에도 상태 유지
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Portfolio, Holding } from '../types';
import { convertKrwToUsd } from '../utils/currency';

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

const DEFAULT_USD_TO_KRW_RATE = 1300;

// 초기 샘플 데이터
const initialHoldings: Holding[] = [
  {
    symbol: '005930',
    name: '삼성전자',
    quantity: 100,
    avgPriceKrw: 65000,
    avgPriceUsd: Number(convertKrwToUsd(65000).toFixed(2)),
    currentPriceKrw: 70000,
    currentPriceUsd: Number(convertKrwToUsd(70000).toFixed(2)),
    sector: 'IT',
    tags: ['대형주', '배당주'],
  },
  {
    symbol: '000660',
    name: 'SK하이닉스',
    quantity: 50,
    avgPriceKrw: 120000,
    avgPriceUsd: Number(convertKrwToUsd(120000).toFixed(2)),
    currentPriceKrw: 135000,
    currentPriceUsd: Number(convertKrwToUsd(135000).toFixed(2)),
    sector: 'IT',
    tags: ['반도체', 'AI'],
  },
  {
    symbol: '035420',
    name: 'NAVER',
    quantity: 30,
    avgPriceKrw: 200000,
    avgPriceUsd: Number(convertKrwToUsd(200000).toFixed(2)),
    currentPriceKrw: 220000,
    currentPriceUsd: Number(convertKrwToUsd(220000).toFixed(2)),
    sector: 'IT',
    tags: ['인터넷', 'AI'],
  },
  {
    symbol: '005380',
    name: '현대차',
    quantity: 80,
    avgPriceKrw: 180000,
    avgPriceUsd: Number(convertKrwToUsd(180000).toFixed(2)),
    currentPriceKrw: 170000,
    currentPriceUsd: Number(convertKrwToUsd(170000).toFixed(2)),
    sector: '자동차',
    tags: ['자동차', '전기차'],
  },
  {
    symbol: '051910',
    name: 'LG화학',
    quantity: 40,
    avgPriceKrw: 450000,
    avgPriceUsd: Number(convertKrwToUsd(450000).toFixed(2)),
    currentPriceKrw: 480000,
    currentPriceUsd: Number(convertKrwToUsd(480000).toFixed(2)),
    sector: '화학',
    tags: ['배터리', 'ESG'],
  },
  {
    symbol: '006400',
    name: '삼성SDI',
    quantity: 25,
    avgPriceKrw: 500000,
    avgPriceUsd: Number(convertKrwToUsd(500000).toFixed(2)),
    currentPriceKrw: 550000,
    currentPriceUsd: Number(convertKrwToUsd(550000).toFixed(2)),
    sector: '화학',
    tags: ['배터리', '전기차'],
  },
];

const calculateValue = (holdings: Holding[]) => {
  return holdings.reduce((sum, h) => sum + h.currentPriceKrw * h.quantity, 0);
};

const calculateProfitLoss = (holdings: Holding[]) => {
  return holdings.reduce((sum, h) => sum + (h.currentPriceKrw - h.avgPriceKrw) * h.quantity, 0);
};

function normalizeHolding(raw: any): Holding | null {
  if (!raw) return null;

  // v2 format (KRW/USD fields)
  if (
    typeof raw.avgPriceKrw === 'number' &&
    typeof raw.currentPriceKrw === 'number' &&
    typeof raw.avgPriceUsd === 'number' &&
    typeof raw.currentPriceUsd === 'number'
  ) {
    return {
      symbol: String(raw.symbol || '').trim(),
      name: String(raw.name || '').trim(),
      quantity: Number(raw.quantity) || 0,
      avgPriceKrw: Number(raw.avgPriceKrw) || 0,
      avgPriceUsd: Number(raw.avgPriceUsd) || 0,
      currentPriceKrw: Number(raw.currentPriceKrw) || 0,
      currentPriceUsd: Number(raw.currentPriceUsd) || 0,
      dayChangeRate: typeof raw.dayChangeRate === 'number' ? raw.dayChangeRate : undefined,
      sector: String(raw.sector || '기타'),
      tags: Array.isArray(raw.tags) ? raw.tags : [],
    };
  }

  // legacy format (avgPrice/currentPrice + currency)
  if (typeof raw.avgPrice !== 'undefined' && typeof raw.currentPrice !== 'undefined') {
    const legacyCurrency = raw.currency === 'USD' ? 'USD' : 'KRW';
    const avg = Number(raw.avgPrice) || 0;
    const cur = Number(raw.currentPrice) || 0;

    const avgPriceKrw =
      legacyCurrency === 'USD' ? Math.round(avg * DEFAULT_USD_TO_KRW_RATE) : Math.round(avg);
    const currentPriceKrw =
      legacyCurrency === 'USD' ? Math.round(cur * DEFAULT_USD_TO_KRW_RATE) : Math.round(cur);

    const avgPriceUsd =
      legacyCurrency === 'USD' ? Number(avg.toFixed(2)) : Number((avgPriceKrw / DEFAULT_USD_TO_KRW_RATE).toFixed(2));
    const currentPriceUsd =
      legacyCurrency === 'USD' ? Number(cur.toFixed(2)) : Number((currentPriceKrw / DEFAULT_USD_TO_KRW_RATE).toFixed(2));

    return {
      symbol: String(raw.symbol || '').trim(),
      name: String(raw.name || '').trim(),
      quantity: Number(raw.quantity) || 0,
      avgPriceKrw,
      avgPriceUsd,
      currentPriceKrw,
      currentPriceUsd,
      dayChangeRate: typeof raw.dayChangeRate === 'number' ? raw.dayChangeRate : undefined,
      sector: String(raw.sector || '기타'),
      tags: Array.isArray(raw.tags) ? raw.tags : [],
    };
  }

  return null;
}

function normalizeHoldings(rawHoldings: any[]): Holding[] {
  return (rawHoldings || [])
    .map(normalizeHolding)
    .filter((h): h is Holding => !!h && !!h.symbol && !!h.name);
}

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
      version: 2,
      migrate: (persistedState: any, version: number) => {
        if (!persistedState?.portfolio) {
          return persistedState;
        }

        // v1 -> v2 migration
        if (version < 2) {
          const portfolio = persistedState.portfolio;
          const normalized = normalizeHoldings(portfolio.holdings);

          const nextPortfolio: Portfolio = {
            ...portfolio,
            holdings: normalized,
            totalValue: calculateValue(normalized),
            totalProfitLoss: calculateProfitLoss(normalized),
          };

          return { ...persistedState, portfolio: nextPortfolio };
        }

        // v2 or later: still normalize defensively
        const portfolio = persistedState.portfolio;
        const normalized = normalizeHoldings(portfolio.holdings);
        return {
          ...persistedState,
          portfolio: {
            ...portfolio,
            holdings: normalized,
            totalValue: calculateValue(normalized),
            totalProfitLoss: calculateProfitLoss(normalized),
          },
        };
      },
    }
  )
);
