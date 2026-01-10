/**
 * 주식 입력 폼 컴포넌트
 */

import { useState } from 'react';
import { Holding } from '../../types';
import { usePortfolioStore } from '../../stores/portfolioStore';
import StockSearchInput from './StockSearchInput';
import { convertKrwToUsd, convertUsdToKrw } from '../../utils/currency';

interface StockInputFormProps {
  onClose: () => void;
  editingHolding?: Holding;
}

const SECTORS = [
  'IT',
  '금융',
  '바이오',
  '화학',
  '자동차',
  '에너지',
  '소비재',
  '산업재',
  '건설',
  '유통',
  '기타',
];

export default function StockInputForm({ onClose, editingHolding }: StockInputFormProps) {
  const { addHolding, updateHolding } = usePortfolioStore();
  const isEditing = !!editingHolding;

  const [formData, setFormData] = useState<Omit<Holding, 'profitLoss' | 'profitLossRate'>>({
    symbol: editingHolding?.symbol || '',
    name: editingHolding?.name || '',
    quantity: editingHolding?.quantity || 0,
    avgPriceKrw: editingHolding?.avgPriceKrw || 0,
    avgPriceUsd: editingHolding?.avgPriceUsd || 0,
    currentPriceKrw: editingHolding?.currentPriceKrw || 0,
    currentPriceUsd: editingHolding?.currentPriceUsd || 0,
    sector: editingHolding?.sector || '기타',
    tags: editingHolding?.tags || [],
  });

  const [tagInput, setTagInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditing) {
      updateHolding(editingHolding.symbol, formData);
    } else {
      // 중복 체크
      const { portfolio } = usePortfolioStore.getState();
      if (portfolio.holdings.some(h => h.symbol === formData.symbol)) {
        alert('이미 등록된 종목 코드입니다.');
        return;
      }
      addHolding(formData);
    }

    onClose();
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove),
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-text-primary">
          {isEditing ? '종목 수정' : '종목 추가'}
        </h2>
        <button
          onClick={onClose}
          className="text-text-tertiary hover:text-text-primary"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 종목 검색 (수정 모드가 아닐 때만) */}
        {!isEditing && (
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              종목 검색 *
            </label>
            <StockSearchInput
              onSelect={(stock, currentPrice) => {
                const isKrx = stock.market === 'KRX' || /^\d{6}$/.test(stock.symbol);
                setFormData(prev => ({
                  ...prev,
                  symbol: stock.symbol,
                  name: stock.nameKo ? `${stock.nameKo} (${stock.name})` : stock.name,
                  currentPriceKrw: isKrx ? currentPrice : Math.round(convertUsdToKrw(currentPrice)),
                  currentPriceUsd: isKrx ? Number(convertKrwToUsd(currentPrice).toFixed(2)) : Number(currentPrice.toFixed(2)),
                  sector: stock.sector || prev.sector,
                }));
              }}
            />
            <p className="mt-1 text-xs text-text-tertiary">
              검색되지 않는 종목은 아래에서 직접 입력하세요
            </p>
          </div>
        )}

        {/* 종목 코드 (수정 모드일 때만 표시) */}
        {isEditing && (
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              종목 코드 *
            </label>
            <input
              type="text"
              value={formData.symbol}
              onChange={e => setFormData({ ...formData, symbol: e.target.value })}
              placeholder="005930"
              required
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue disabled:bg-gray-100"
            />
          </div>
        )}

        {/* 종목명 */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            종목명 *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            placeholder="삼성전자"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue"
          />
        </div>

        {/* 보유 수량 */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            보유 수량 * (소수점 6자리까지 입력 가능)
          </label>
          <input
            type="number"
            value={formData.quantity || ''}
            onChange={e => {
              const value = e.target.value;
              // 소수점 6자리까지 허용
              if (value === '' || /^\d*\.?\d{0,6}$/.test(value)) {
                setFormData({ ...formData, quantity: value === '' ? 0 : parseFloat(value) });
              }
            }}
            placeholder="100 또는 0.123456"
            required
            min="0"
            step="0.000001"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue"
          />
          <p className="mt-1 text-xs text-text-tertiary">
            예: 100, 0.5, 0.123456
          </p>
        </div>

        {/* 평균 매수가 (원/달러) */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            평균 매수가 * (원 / 달러)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-xs text-text-tertiary mb-1">원 (KRW)</div>
              <input
                type="number"
                value={formData.avgPriceKrw || ''}
                onChange={e => {
                  const krw = Number(e.target.value) || 0;
                  setFormData(prev => ({
                    ...prev,
                    avgPriceKrw: krw,
                    avgPriceUsd: Number(convertKrwToUsd(krw).toFixed(2)),
                  }));
                }}
                placeholder="65000"
                required
                min="0"
                step="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue"
              />
            </div>
            <div>
              <div className="text-xs text-text-tertiary mb-1">달러 (USD)</div>
              <input
                type="number"
                value={formData.avgPriceUsd || ''}
                onChange={e => {
                  const usd = Number(e.target.value) || 0;
                  setFormData(prev => ({
                    ...prev,
                    avgPriceUsd: usd,
                    avgPriceKrw: Math.round(convertUsdToKrw(usd)),
                  }));
                }}
                placeholder="50.00"
                required
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue"
              />
            </div>
          </div>
        </div>

        {/* 현재가 (원/달러) */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            현재가 * (원 / 달러)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-xs text-text-tertiary mb-1">원 (KRW)</div>
              <input
                type="number"
                value={formData.currentPriceKrw || ''}
                onChange={e => {
                  const krw = Number(e.target.value) || 0;
                  setFormData(prev => ({
                    ...prev,
                    currentPriceKrw: krw,
                    currentPriceUsd: Number(convertKrwToUsd(krw).toFixed(2)),
                  }));
                }}
                placeholder="70000"
                required
                min="0"
                step="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue"
              />
            </div>
            <div>
              <div className="text-xs text-text-tertiary mb-1">달러 (USD)</div>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={formData.currentPriceUsd || ''}
                  onChange={e => {
                    const usd = Number(e.target.value) || 0;
                    setFormData(prev => ({
                      ...prev,
                      currentPriceUsd: usd,
                      currentPriceKrw: Math.round(convertUsdToKrw(usd)),
                    }));
                  }}
                  placeholder="53.85"
                  required
                  min="0"
                  step="0.01"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue"
                />
                {formData.symbol && !isEditing && (
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const { getCurrentPrice } = await import('../../services/stockApi');
                        // 시장 구분: 6자리 숫자는 국내(KRW), 그 외는 해외(USD)로 간주
                        const market = /^\d{6}$/.test(formData.symbol) ? 'KRX' : undefined;
                        const stockInfo = await getCurrentPrice(formData.symbol, market);
                        const isKrx = market === 'KRX';

                        setFormData(prev => ({
                          ...prev,
                          currentPriceKrw: isKrx ? stockInfo.currentPrice : Math.round(convertUsdToKrw(stockInfo.currentPrice)),
                          currentPriceUsd: isKrx
                            ? Number(convertKrwToUsd(stockInfo.currentPrice).toFixed(2))
                            : Number(stockInfo.currentPrice.toFixed(2)),
                        }));
                      } catch (error) {
                        alert('현재가를 가져오는 중 오류가 발생했습니다.');
                      }
                    }}
                    className="px-4 py-2 bg-primary-blue text-white rounded-md hover:bg-blue-600 text-sm whitespace-nowrap"
                  >
                    가격 조회
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 섹터 */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            섹터 *
          </label>
          <select
            value={formData.sector}
            onChange={e => setFormData({ ...formData, sector: e.target.value })}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue"
          >
            {SECTORS.map(sector => (
              <option key={sector} value={sector}>
                {sector}
              </option>
            ))}
          </select>
        </div>

        {/* 태그 */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            태그
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="태그 입력 후 Enter"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-4 py-2 bg-primary-blue text-white rounded-md hover:bg-blue-600"
            >
              추가
            </button>
          </div>
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-primary-blue bg-opacity-10 text-primary-blue rounded-md text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-blue-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 버튼 */}
        <div className="flex gap-2 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-text-secondary hover:bg-bg-tertiary"
          >
            취소
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-2 bg-primary-blue text-white rounded-md hover:bg-blue-600"
          >
            {isEditing ? '수정' : '추가'}
          </button>
        </div>
      </form>
    </div>
  );
}
