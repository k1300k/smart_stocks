/**
 * 포트폴리오 데이터를 마인드맵 노드 구조로 변환하는 서비스
 */

import { Portfolio, Holding, MindMapNode, ViewMode } from '../types';

const BASE_NODE_SIZE = 30;
const MIN_NODE_SIZE = 15;
const MAX_NODE_SIZE = 80;

/**
 * 노드 크기 계산
 * NodeSize = BaseSize * sqrt(StockValue / TotalPortfolioValue)
 */
function calculateNodeSize(value: number, totalValue: number): number {
  if (totalValue === 0) return MIN_NODE_SIZE;
  const ratio = value / totalValue;
  const size = BASE_NODE_SIZE * Math.sqrt(ratio);
  return Math.max(MIN_NODE_SIZE, Math.min(MAX_NODE_SIZE, size));
}

/**
 * 수익률에 따른 색상 계산
 * 수익 (+): Green 그라데이션 (#22C55E ~ #15803D)
 * 손실 (-): Red 그라데이션 (#EF4444 ~ #DC2626)
 * 보합 (0): Neutral Gray (#9CA3AF)
 */
export function getColorByProfitLoss(profitLossRate?: number): string {
  if (profitLossRate === undefined || profitLossRate === 0) {
    return '#9CA3AF'; // Neutral Gray
  }
  
  if (profitLossRate > 0) {
    // Green gradient: #22C55E to #15803D
    const intensity = Math.min(profitLossRate / 50, 1); // 최대 50%까지 그라데이션
    const r = Math.round(34 - (21 * intensity));
    const g = Math.round(197 - (151 * intensity));
    const b = Math.round(94 - (61 * intensity));
    return `rgb(${r}, ${g}, ${b})`;
  } else {
    // Red gradient: #EF4444 to #DC2626
    const intensity = Math.min(Math.abs(profitLossRate) / 50, 1);
    const r = Math.round(239 - (19 * intensity));
    const g = Math.round(68 - (38 * intensity));
    const b = Math.round(68 - (38 * intensity));
    return `rgb(${r}, ${g}, ${b})`;
  }
}

/**
 * 섹터별 뷰로 변환
 */
function transformToSectorView(portfolio: Portfolio): MindMapNode {
  const root: MindMapNode = {
    id: 'root',
    name: '나의 포트폴리오',
    value: portfolio.totalValue,
    profitLoss: portfolio.totalProfitLoss,
    profitLossRate: portfolio.totalValue > 0 
      ? (portfolio.totalProfitLoss / (portfolio.totalValue - portfolio.totalProfitLoss)) * 100 
      : 0,
    type: 'root',
    children: [],
  };

  // 섹터별로 그룹화
  const sectorMap = new Map<string, Holding[]>();
  
  portfolio.holdings.forEach(holding => {
    const sector = holding.sector || '기타';
    if (!sectorMap.has(sector)) {
      sectorMap.set(sector, []);
    }
    sectorMap.get(sector)!.push(holding);
  });

  // 각 섹터별 노드 생성
  sectorMap.forEach((holdings, sector) => {
    const sectorValue = holdings.reduce((sum, h) => 
      sum + (h.currentPrice * h.quantity), 0
    );
    const sectorProfitLoss = holdings.reduce((sum, h) => {
      const profitLoss = (h.currentPrice - h.avgPrice) * h.quantity;
      return sum + profitLoss;
    }, 0);
    const sectorProfitLossRate = sectorValue > 0 
      ? (sectorProfitLoss / (sectorValue - sectorProfitLoss)) * 100 
      : 0;

    const sectorNode: MindMapNode = {
      id: `sector-${sector}`,
      name: sector,
      value: sectorValue,
      profitLoss: sectorProfitLoss,
      profitLossRate: sectorProfitLossRate,
      type: 'category',
      sector,
      children: holdings.map(holding => {
        const value = holding.currentPrice * holding.quantity;
        const profitLoss = (holding.currentPrice - holding.avgPrice) * holding.quantity;
        const profitLossRate = holding.avgPrice > 0 
          ? ((holding.currentPrice - holding.avgPrice) / holding.avgPrice) * 100 
          : 0;

        return {
          id: `stock-${holding.symbol}`,
          name: holding.name,
          value,
          profitLoss,
          profitLossRate,
          type: 'stock',
          symbol: holding.symbol,
          sector: holding.sector,
          tags: holding.tags,
        };
      }),
    };

    root.children!.push(sectorNode);
  });

  return root;
}

/**
 * 수익률별 뷰로 변환
 */
function transformToProfitLossView(portfolio: Portfolio): MindMapNode {
  const root: MindMapNode = {
    id: 'root',
    name: '나의 포트폴리오',
    value: portfolio.totalValue,
    profitLoss: portfolio.totalProfitLoss,
    profitLossRate: portfolio.totalValue > 0 
      ? (portfolio.totalProfitLoss / (portfolio.totalValue - portfolio.totalProfitLoss)) * 100 
      : 0,
    type: 'root',
    children: [],
  };

  // 수익률 구간별 그룹화
  const categories = [
    { name: '+20% 이상', min: 20, max: Infinity },
    { name: '+10% ~ +20%', min: 10, max: 20 },
    { name: '0% ~ +10%', min: 0, max: 10 },
    { name: '-10% ~ 0%', min: -10, max: 0 },
    { name: '-10% 미만', min: -Infinity, max: -10 },
  ];

  categories.forEach(category => {
    const holdings = portfolio.holdings.filter(holding => {
      const profitLossRate = holding.avgPrice > 0 
        ? ((holding.currentPrice - holding.avgPrice) / holding.avgPrice) * 100 
        : 0;
      return profitLossRate >= category.min && profitLossRate < category.max;
    });

    if (holdings.length === 0) return;

    const categoryValue = holdings.reduce((sum, h) => 
      sum + (h.currentPrice * h.quantity), 0
    );
    const categoryProfitLoss = holdings.reduce((sum, h) => {
      const profitLoss = (h.currentPrice - h.avgPrice) * h.quantity;
      return sum + profitLoss;
    }, 0);
    const categoryProfitLossRate = categoryValue > 0 
      ? (categoryProfitLoss / (categoryValue - categoryProfitLoss)) * 100 
      : 0;

    const categoryNode: MindMapNode = {
      id: `category-${category.name}`,
      name: category.name,
      value: categoryValue,
      profitLoss: categoryProfitLoss,
      profitLossRate: categoryProfitLossRate,
      type: 'category',
      children: holdings.map(holding => {
        const value = holding.currentPrice * holding.quantity;
        const profitLoss = (holding.currentPrice - holding.avgPrice) * holding.quantity;
        const profitLossRate = holding.avgPrice > 0 
          ? ((holding.currentPrice - holding.avgPrice) / holding.avgPrice) * 100 
          : 0;

        return {
          id: `stock-${holding.symbol}`,
          name: holding.name,
          value,
          profitLoss,
          profitLossRate,
          type: 'stock',
          symbol: holding.symbol,
          sector: holding.sector,
          tags: holding.tags,
        };
      }),
    };

    root.children!.push(categoryNode);
  });

  return root;
}

/**
 * 테마별 뷰로 변환
 */
function transformToThemeView(portfolio: Portfolio): MindMapNode {
  const root: MindMapNode = {
    id: 'root',
    name: '나의 포트폴리오',
    value: portfolio.totalValue,
    profitLoss: portfolio.totalProfitLoss,
    profitLossRate: portfolio.totalValue > 0 
      ? (portfolio.totalProfitLoss / (portfolio.totalValue - portfolio.totalProfitLoss)) * 100 
      : 0,
    type: 'root',
    children: [],
  };

  // 태그별로 그룹화
  const tagMap = new Map<string, Holding[]>();
  
  portfolio.holdings.forEach(holding => {
    if (holding.tags && holding.tags.length > 0) {
      holding.tags.forEach(tag => {
        if (!tagMap.has(tag)) {
          tagMap.set(tag, []);
        }
        tagMap.get(tag)!.push(holding);
      });
    } else {
      // 태그가 없는 경우 "기타"로 분류
      if (!tagMap.has('기타')) {
        tagMap.set('기타', []);
      }
      tagMap.get('기타')!.push(holding);
    }
  });

  // 각 태그별 노드 생성
  tagMap.forEach((holdings, tag) => {
    const tagValue = holdings.reduce((sum, h) => 
      sum + (h.currentPrice * h.quantity), 0
    );
    const tagProfitLoss = holdings.reduce((sum, h) => {
      const profitLoss = (h.currentPrice - h.avgPrice) * h.quantity;
      return sum + profitLoss;
    }, 0);
    const tagProfitLossRate = tagValue > 0 
      ? (tagProfitLoss / (tagValue - tagProfitLoss)) * 100 
      : 0;

    const tagNode: MindMapNode = {
      id: `theme-${tag}`,
      name: tag,
      value: tagValue,
      profitLoss: tagProfitLoss,
      profitLossRate: tagProfitLossRate,
      type: 'category',
      tags: [tag],
      children: holdings.map(holding => {
        const value = holding.currentPrice * holding.quantity;
        const profitLoss = (holding.currentPrice - holding.avgPrice) * holding.quantity;
        const profitLossRate = holding.avgPrice > 0 
          ? ((holding.currentPrice - holding.avgPrice) / holding.avgPrice) * 100 
          : 0;

        return {
          id: `stock-${holding.symbol}`,
          name: holding.name,
          value,
          profitLoss,
          profitLossRate,
          type: 'stock',
          symbol: holding.symbol,
          sector: holding.sector,
          tags: holding.tags,
        };
      }),
    };

    root.children!.push(tagNode);
  });

  return root;
}

/**
 * 포트폴리오 데이터를 마인드맵 노드 구조로 변환
 */
export function transformPortfolioToMindMap(
  portfolio: Portfolio,
  viewMode: ViewMode
): MindMapNode {
  switch (viewMode) {
    case 'sector':
      return transformToSectorView(portfolio);
    case 'profitLoss':
      return transformToProfitLossView(portfolio);
    case 'theme':
      return transformToThemeView(portfolio);
    default:
      return transformToSectorView(portfolio);
  }
}

/**
 * 노드 크기 계산 헬퍼
 */
export function getNodeSize(node: MindMapNode, totalValue: number): number {
  return calculateNodeSize(node.value, totalValue);
}
