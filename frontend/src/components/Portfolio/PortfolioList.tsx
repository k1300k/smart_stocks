/**
 * 포트폴리오 목록 컴포넌트
 */

import { useState } from 'react';
import { Holding } from '../../types';
import { usePortfolioStore } from '../../stores/portfolioStore';
import StockInputForm from './StockInputForm';
import ExportImportModal from './ExportImportModal';
import { getColorByProfitLoss } from '../../services/portfolioTransform';
import { formatKRW, formatUSD } from '../../utils/currency';
import { useExchangeRateStore } from '../../stores/exchangeRateStore';

export default function PortfolioList() {
  const { portfolio, removeHolding } = usePortfolioStore();
  const { usdToKrwRate, lastUpdated } = useExchangeRateStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isExportImportOpen, setIsExportImportOpen] = useState(false);
  const [editingHolding, setEditingHolding] = useState<Holding | undefined>();

  const handleEdit = (holding: Holding) => {
    setEditingHolding(holding);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setEditingHolding(undefined);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingHolding(undefined);
  };

  const calculateProfitLoss = (holding: Holding) => {
    return (holding.currentPriceKrw - holding.avgPriceKrw) * holding.quantity;
  };

  const calculateProfitLossRate = (holding: Holding) => {
    if (holding.avgPriceKrw === 0) return 0;
    return ((holding.currentPriceKrw - holding.avgPriceKrw) / holding.avgPriceKrw) * 100;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-text-primary">포트폴리오</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setIsExportImportOpen(true)}
            className="px-4 py-2 border border-gray-300 text-text-secondary rounded-md hover:bg-bg-secondary text-sm font-medium"
          >
            내보내기/불러오기
          </button>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-primary-blue text-white rounded-md hover:bg-blue-600 text-sm font-medium"
          >
            + 종목 추가
          </button>
        </div>
      </div>

      {/* 포트폴리오 요약 */}
      <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-bg-secondary rounded-lg">
        <div>
          <div className="text-sm text-text-secondary mb-1">총 자산</div>
          <div className="text-lg font-bold text-text-primary font-mono">
            {portfolio.totalValue.toLocaleString('ko-KR')}원
          </div>
        </div>
        <div>
          <div className="text-sm text-text-secondary mb-1">총 손익</div>
          <div
            className={`text-lg font-bold font-mono ${
              portfolio.totalProfitLoss >= 0 ? 'text-primary-green' : 'text-primary-red'
            }`}
          >
            {portfolio.totalProfitLoss >= 0 ? '+' : ''}
            {portfolio.totalProfitLoss.toLocaleString('ko-KR')}원
          </div>
        </div>
        <div>
          <div className="text-sm text-text-secondary mb-1">보유 종목</div>
          <div className="text-lg font-bold text-text-primary">
            {portfolio.holdings.length}개
          </div>
        </div>
      </div>

      {/* 환율 정보 */}
      {lastUpdated && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-xs text-blue-700">
            💱 환율: 1 USD = {usdToKrwRate.toLocaleString('ko-KR')} KRW
            <span className="ml-2 text-blue-600">
              (업데이트: {new Date(lastUpdated).toLocaleTimeString('ko-KR')})
            </span>
          </div>
        </div>
      )}

      {/* 종목 목록 */}
      <div className="space-y-2">
        {portfolio.holdings.length === 0 ? (
          <div className="text-center py-8 text-text-secondary">
            등록된 종목이 없습니다.
            <br />
            <button
              onClick={handleAdd}
              className="mt-2 text-primary-blue hover:underline"
            >
              종목을 추가해보세요
            </button>
          </div>
        ) : (
          portfolio.holdings.map(holding => {
            const profitLoss = calculateProfitLoss(holding);
            const profitLossRate = calculateProfitLossRate(holding);
            const valueKrw = holding.currentPriceKrw * holding.quantity;
            const valueUsd = holding.currentPriceUsd * holding.quantity;
            const profitLossUsd = holding.currentPriceUsd * holding.quantity - holding.avgPriceUsd * holding.quantity;

            return (
              <div
                key={holding.symbol}
                className="p-4 border border-gray-200 rounded-lg hover:border-primary-blue transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-text-primary">{holding.name}</h3>
                      <span className="text-xs text-text-tertiary font-mono">
                        {holding.symbol}
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-bg-tertiary text-text-secondary rounded">
                        {holding.sector}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-text-secondary">보유 수량: </span>
                        <span className="font-mono">
                          {(() => {
                            const qty = holding.quantity;
                            // 정수인 경우 천단위 구분자 사용
                            if (qty % 1 === 0) {
                              return qty.toLocaleString('ko-KR');
                            }
                            // 소수점이 있는 경우 소수점 6자리까지 표시하되, 끝의 불필요한 0 제거
                            const formatted = qty.toFixed(6);
                            return formatted.replace(/\.?0+$/, '');
                          })()}주
                        </span>
                      </div>
                      <div>
                        <span className="text-text-secondary">평균가: </span>
                        <span className="font-mono">
                          {formatKRW(holding.avgPriceKrw)} / {formatUSD(holding.avgPriceUsd)}
                        </span>
                      </div>
                      <div>
                        <span className="text-text-secondary">현재가: </span>
                        <span className="font-mono">
                          {formatKRW(holding.currentPriceKrw)} / {formatUSD(holding.currentPriceUsd)}
                        </span>
                      </div>
                      <div>
                        <span className="text-text-secondary">평가액: </span>
                        <span className="font-mono font-semibold">
                          {formatKRW(valueKrw)} / {formatUSD(valueUsd)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2">
                      <span
                        className="text-sm font-semibold"
                        style={{ color: getColorByProfitLoss(profitLossRate) }}
                      >
                        {profitLoss >= 0 ? '+' : ''}
                        {formatKRW(profitLoss)} / {formatUSD(profitLossUsd)} (
                        {profitLossRate >= 0 ? '+' : ''}{profitLossRate.toFixed(2)}%)
                      </span>
                    </div>

                    {holding.tags && holding.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {holding.tags.map(tag => (
                          <span
                            key={tag}
                            className="text-xs px-2 py-0.5 bg-primary-blue bg-opacity-10 text-primary-blue rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(holding)}
                      className="px-3 py-1 text-sm text-primary-blue hover:bg-primary-blue hover:bg-opacity-10 rounded"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`${holding.name}을(를) 삭제하시겠습니까?`)) {
                          removeHolding(holding.symbol);
                        }
                      }}
                      className="px-3 py-1 text-sm text-primary-red hover:bg-primary-red hover:bg-opacity-10 rounded"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 입력 폼 모달 */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <StockInputForm onClose={handleCloseForm} editingHolding={editingHolding} />
        </div>
      )}

      {/* 내보내기/불러오기 모달 */}
      <ExportImportModal
        isOpen={isExportImportOpen}
        onClose={() => setIsExportImportOpen(false)}
      />
    </div>
  );
}
