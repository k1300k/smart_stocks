/**
 * 주식 입력 폼 컴포넌트
 */

import { useState } from 'react';
import { Holding } from '../../types';
import { usePortfolioStore } from '../../stores/portfolioStore';

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
    avgPrice: editingHolding?.avgPrice || 0,
    currentPrice: editingHolding?.currentPrice || 0,
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
        {/* 종목 코드 */}
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
            disabled={isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue disabled:bg-gray-100"
          />
        </div>

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
            보유 수량 *
          </label>
          <input
            type="number"
            value={formData.quantity || ''}
            onChange={e => setFormData({ ...formData, quantity: Number(e.target.value) })}
            placeholder="100"
            required
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue"
          />
        </div>

        {/* 평균 매수가 */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            평균 매수가 (원) *
          </label>
          <input
            type="number"
            value={formData.avgPrice || ''}
            onChange={e => setFormData({ ...formData, avgPrice: Number(e.target.value) })}
            placeholder="65000"
            required
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue"
          />
        </div>

        {/* 현재가 */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            현재가 (원) *
          </label>
          <input
            type="number"
            value={formData.currentPrice || ''}
            onChange={e => setFormData({ ...formData, currentPrice: Number(e.target.value) })}
            placeholder="70000"
            required
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue"
          />
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
