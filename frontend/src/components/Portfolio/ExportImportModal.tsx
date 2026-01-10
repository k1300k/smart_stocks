/**
 * 포트폴리오 데이터 내보내기/불러오기 모달
 */

import { useState } from 'react';
import { usePortfolioStore } from '../../stores/portfolioStore';
import { exportToCsv, importFromCsv, downloadFile, readFile } from '../../services/csvService';
import { Holding } from '../../types';
import { convertKrwToUsd, convertUsdToKrw } from '../../utils/currency';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ExportImportModal({ isOpen, onClose }: ExportImportModalProps) {
  const { portfolio, setHoldings } = usePortfolioStore();
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  if (!isOpen) {
    return null;
  }

  const handleExportJson = () => {
    const data = {
      holdings: portfolio.holdings,
      exportedAt: new Date().toISOString(),
      version: '2.0',
    };
    
    const jsonContent = JSON.stringify(data, null, 2);
    downloadFile(jsonContent, `portfolio_${new Date().toISOString().split('T')[0]}.json`, 'application/json');
    onClose();
  };

  const handleExportCsv = () => {
    const csvContent = exportToCsv(portfolio.holdings);
    downloadFile(csvContent, `portfolio_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv;charset=utf-8;');
    onClose();
  };

  const handleImportJson = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.name.endsWith('.json')) {
      setImportError('JSON 파일만 업로드 가능합니다.');
      return;
    }

    setIsImporting(true);
    setImportError(null);

    try {
      const content = await readFile(file);
      const data = JSON.parse(content);

      if (!data.holdings || !Array.isArray(data.holdings)) {
        throw new Error('잘못된 JSON 형식입니다. holdings 배열이 필요합니다.');
      }

      // 데이터 검증 및 변환
      const holdings: Holding[] = data.holdings
        .map((item: any) => {
          // v2 format
          if (
            typeof item.avgPriceKrw !== 'undefined' &&
            typeof item.avgPriceUsd !== 'undefined' &&
            typeof item.currentPriceKrw !== 'undefined' &&
            typeof item.currentPriceUsd !== 'undefined'
          ) {
            return {
              symbol: item.symbol || '',
              name: item.name || '',
              quantity: Number(item.quantity) || 0,
              avgPriceKrw: Number(item.avgPriceKrw) || 0,
              avgPriceUsd: Number(item.avgPriceUsd) || 0,
              currentPriceKrw: Number(item.currentPriceKrw) || 0,
              currentPriceUsd: Number(item.currentPriceUsd) || 0,
              sector: item.sector || '기타',
              tags: Array.isArray(item.tags) ? item.tags : [],
            } satisfies Holding;
          }

          // legacy format (avgPrice/currentPrice + currency)
          const legacyCurrency = item.currency === 'USD' ? 'USD' : 'KRW';
          const legacyAvg = Number(item.avgPrice) || 0;
          const legacyCur = Number(item.currentPrice) || 0;

          const avgPriceKrw = legacyCurrency === 'USD' ? Math.round(convertUsdToKrw(legacyAvg)) : Math.round(legacyAvg);
          const currentPriceKrw = legacyCurrency === 'USD' ? Math.round(convertUsdToKrw(legacyCur)) : Math.round(legacyCur);
          const avgPriceUsd = legacyCurrency === 'USD' ? Number(legacyAvg.toFixed(2)) : Number(convertKrwToUsd(avgPriceKrw).toFixed(2));
          const currentPriceUsd = legacyCurrency === 'USD' ? Number(legacyCur.toFixed(2)) : Number(convertKrwToUsd(currentPriceKrw).toFixed(2));

          return {
            symbol: item.symbol || '',
            name: item.name || '',
            quantity: Number(item.quantity) || 0,
            avgPriceKrw,
            avgPriceUsd,
            currentPriceKrw,
            currentPriceUsd,
            sector: item.sector || '기타',
            tags: Array.isArray(item.tags) ? item.tags : [],
          } satisfies Holding;
        })
        .filter((h: Holding) => h.symbol && h.name);

      if (holdings.length === 0) {
        throw new Error('유효한 종목 데이터가 없습니다.');
      }

      // 기존 데이터와 병합할지 덮어쓸지 확인
      if (portfolio.holdings.length > 0) {
        const shouldMerge = window.confirm(
          `현재 ${portfolio.holdings.length}개의 종목이 있습니다. ` +
          `새 데이터로 덮어쓰시겠습니까? (취소하면 병합됩니다)`
        );

        if (shouldMerge) {
          // 덮어쓰기
          setHoldings(holdings);
        } else {
          // 병합 (중복 제거)
          const existingSymbols = new Set(portfolio.holdings.map(h => h.symbol));
          const newHoldings = holdings.filter(h => !existingSymbols.has(h.symbol));
          setHoldings([...portfolio.holdings, ...newHoldings]);
        }
      } else {
        setHoldings(holdings);
      }

      alert(`${holdings.length}개의 종목을 성공적으로 불러왔습니다.`);
      onClose();
    } catch (error) {
      console.error('JSON import error:', error);
      setImportError(error instanceof Error ? error.message : 'JSON 파일 불러오기 실패');
    } finally {
      setIsImporting(false);
      // 파일 input 초기화
      event.target.value = '';
    }
  };

  const handleImportCsv = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.name.endsWith('.csv')) {
      setImportError('CSV 파일만 업로드 가능합니다.');
      return;
    }

    setIsImporting(true);
    setImportError(null);

    try {
      const content = await readFile(file);
      const holdings = importFromCsv(content);

      if (holdings.length === 0) {
        throw new Error('유효한 종목 데이터가 없습니다.');
      }

      // 기존 데이터와 병합할지 덮어쓸지 확인
      if (portfolio.holdings.length > 0) {
        const shouldMerge = window.confirm(
          `현재 ${portfolio.holdings.length}개의 종목이 있습니다. ` +
          `새 데이터로 덮어쓰시겠습니까? (취소하면 병합됩니다)`
        );

        if (shouldMerge) {
          // 덮어쓰기
          setHoldings(holdings);
        } else {
          // 병합 (중복 제거)
          const existingSymbols = new Set(portfolio.holdings.map(h => h.symbol));
          const newHoldings = holdings.filter(h => !existingSymbols.has(h.symbol));
          setHoldings([...portfolio.holdings, ...newHoldings]);
        }
      } else {
        setHoldings(holdings);
      }

      alert(`${holdings.length}개의 종목을 성공적으로 불러왔습니다.`);
      onClose();
    } catch (error) {
      console.error('CSV import error:', error);
      setImportError(error instanceof Error ? error.message : 'CSV 파일 불러오기 실패');
    } finally {
      setIsImporting(false);
      // 파일 input 초기화
      event.target.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary">데이터 내보내기/불러오기</h2>
          <button 
            onClick={onClose} 
            className="text-text-tertiary hover:text-text-primary text-xl"
          >
            ✕
          </button>
        </div>

        {/* 내보내기 섹션 */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-text-secondary mb-3">내보내기</h3>
          <div className="flex gap-2">
            <button
              onClick={handleExportJson}
              disabled={portfolio.holdings.length === 0}
              className="flex-1 px-4 py-2 rounded-md bg-primary-blue text-white text-sm font-medium hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              JSON 내보내기 ({portfolio.holdings.length}개)
            </button>
            <button
              onClick={handleExportCsv}
              disabled={portfolio.holdings.length === 0}
              className="flex-1 px-4 py-2 rounded-md bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              CSV 내보내기 ({portfolio.holdings.length}개)
            </button>
          </div>
        </div>

        {/* 불러오기 섹션 */}
        <div>
          <h3 className="text-sm font-medium text-text-secondary mb-3">불러오기</h3>
          <div className="space-y-2">
            <label className="block">
              <span className="sr-only">JSON 파일 선택</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportJson}
                disabled={isImporting}
                className="hidden"
                id="json-file-input"
              />
              <button
                type="button"
                onClick={() => document.getElementById('json-file-input')?.click()}
                disabled={isImporting}
                className="w-full px-4 py-2 rounded-md border border-primary-blue text-primary-blue text-sm font-medium hover:bg-primary-blue hover:text-white disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isImporting ? '불러오는 중...' : 'JSON 파일 불러오기'}
              </button>
            </label>
            <label className="block">
              <span className="sr-only">CSV 파일 선택</span>
              <input
                type="file"
                accept=".csv"
                onChange={handleImportCsv}
                disabled={isImporting}
                className="hidden"
                id="csv-file-input"
              />
              <button
                type="button"
                onClick={() => document.getElementById('csv-file-input')?.click()}
                disabled={isImporting}
                className="w-full px-4 py-2 rounded-md border border-green-600 text-green-600 text-sm font-medium hover:bg-green-600 hover:text-white disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isImporting ? '불러오는 중...' : 'CSV 파일 불러오기'}
              </button>
            </label>
          </div>
          
          {importError && (
            <div className="mt-3 p-3 rounded-md bg-red-50 border border-red-200">
              <p className="text-sm text-red-600">{importError}</p>
            </div>
          )}
        </div>

        {/* 안내 문구 */}
        <div className="mt-4 p-3 rounded-md bg-gray-50">
          <p className="text-xs text-text-tertiary">
            • JSON: 전체 데이터 구조 보존 (태그, 섹터 포함)<br/>
            • CSV: Excel에서 편집 가능한 형식<br/>
            • 불러오기 시 중복 종목은 제외됩니다
          </p>
        </div>
      </div>
    </div>
  );
}
