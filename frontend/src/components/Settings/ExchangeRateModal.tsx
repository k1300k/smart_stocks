/**
 * 환율 설정 모달 컴포넌트
 */

import { useEffect, useState } from 'react';
import { useExchangeRateStore } from '../../stores/exchangeRateStore';
import { getUSDToKRWRate } from '../../services/exchangeRateApi';

interface ExchangeRateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ExchangeRateModal({ isOpen, onClose }: ExchangeRateModalProps) {
  const { usdToKrwRate, lastUpdated, isLoading, isManualRate, updateRate, setManualRate } = useExchangeRateStore();
  const [inputValue, setInputValue] = useState(usdToKrwRate.toString());
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setInputValue(usdToKrwRate.toFixed(2));
  }, [usdToKrwRate]);

  if (!isOpen) {
    return null;
  }

  const handleManualUpdate = () => {
    const rate = parseFloat(inputValue);
    if (isNaN(rate) || rate <= 0 || rate >= 2000) {
      alert('환율은 0보다 크고 2000보다 작은 값이어야 합니다.');
      return;
    }
    setManualRate(rate);
    alert('환율이 저장되었습니다.');
  };

  const handleAutoUpdate = async () => {
    setIsUpdating(true);
    try {
      await updateRate();
      alert('환율이 업데이트되었습니다.');
    } catch (error) {
      alert('환율 업데이트에 실패했습니다.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary">환율 설정</h2>
          <button onClick={onClose} className="text-text-tertiary hover:text-text-primary">
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* 현재 환율 표시 */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-sm text-blue-700 mb-1">현재 환율</div>
            <div className="text-2xl font-bold text-blue-900">
              1 USD = {usdToKrwRate.toLocaleString('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} KRW
            </div>
            {lastUpdated && (
              <div className="text-xs text-blue-600 mt-1">
                {isManualRate ? '수동 설정' : '자동 업데이트'}: {new Date(lastUpdated).toLocaleString('ko-KR')}
              </div>
            )}
          </div>

          {/* 수동 환율 입력 */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              환율 직접 입력 (1 USD = ? KRW)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={inputValue}
                onChange={e => {
                  const value = e.target.value;
                  if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
                    setInputValue(value);
                  }
                }}
                placeholder="1300.00"
                min="800"
                max="2000"
                step="0.01"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue"
              />
              <button
                onClick={handleManualUpdate}
                className="px-4 py-2 bg-primary-blue text-white rounded-md hover:bg-blue-600 text-sm font-semibold whitespace-nowrap"
              >
                저장
              </button>
            </div>
            <p className="mt-1 text-xs text-text-tertiary">
              예: 1300.50 (실제 환율과 다를 경우 직접 입력 가능)
            </p>
          </div>

          {/* 자동 업데이트 버튼 */}
          <div>
            <button
              onClick={handleAutoUpdate}
              disabled={isUpdating || isLoading}
              className="w-full px-4 py-2 bg-gray-100 text-text-secondary rounded-md hover:bg-gray-200 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdating || isLoading ? '업데이트 중...' : '실시간 환율 자동 업데이트'}
            </button>
            <p className="mt-1 text-xs text-text-tertiary text-center">
              자동 업데이트를 사용하면 수동 설정이 해제됩니다
            </p>
          </div>

          {/* 참고 정보 */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-text-tertiary">
              💡 <strong>참고:</strong> 환율은 여러 API를 시도하여 가장 정확한 값을 사용합니다.
              <br />
              실제 환율과 차이가 있으면 직접 입력하여 사용할 수 있습니다.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-text-secondary rounded-md hover:bg-gray-300 text-sm font-semibold"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
