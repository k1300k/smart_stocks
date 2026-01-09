/**
 * 종목 검색 입력 컴포넌트
 */

import { useState, useEffect, useRef } from 'react';
import { searchStocks, getCurrentPrice, StockSearchResult } from '../../services/stockApi';

interface StockSearchInputProps {
  onSelect: (stock: StockSearchResult, currentPrice: number) => void;
  disabled?: boolean;
}

export default function StockSearchInput({ onSelect, disabled }: StockSearchInputProps) {
  const [query, setQuery] = useState('');
  const [market, setMarket] = useState<string>(''); // '' = 전체, 'KRX' = 국내, 'NYSE'/'NASDAQ' = 해외
  const [results, setResults] = useState<StockSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 검색 디바운스
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const searchResults = await searchStocks(query, market || undefined);
        setResults(searchResults);
        setShowResults(searchResults.length > 0);
        setSelectedIndex(-1);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
        setShowResults(false);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, market]);

  // 외부 클릭 시 결과 숨기기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = async (stock: StockSearchResult) => {
    try {
      setIsLoading(true);
      const stockInfo = await getCurrentPrice(stock.symbol, stock.market);
      onSelect(stock, stockInfo.currentPrice);
      setQuery(stock.name);
      setShowResults(false);
    } catch (error) {
      console.error('Get price error:', error);
      alert('현재가를 가져오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowResults(false);
        break;
    }
  };

  return (
    <div ref={searchRef} className="relative">
      {/* 시장 선택 */}
      <div className="flex gap-2 mb-2">
        <button
          type="button"
          onClick={() => setMarket('')}
          className={`px-3 py-1 text-sm rounded-md transition-colors ${
            market === ''
              ? 'bg-primary-blue text-white'
              : 'bg-bg-secondary text-text-secondary hover:bg-bg-tertiary'
          }`}
        >
          전체
        </button>
        <button
          type="button"
          onClick={() => setMarket('KRX')}
          className={`px-3 py-1 text-sm rounded-md transition-colors ${
            market === 'KRX'
              ? 'bg-primary-blue text-white'
              : 'bg-bg-secondary text-text-secondary hover:bg-bg-tertiary'
          }`}
        >
          국내
        </button>
        <button
          type="button"
          onClick={() => setMarket('NYSE')}
          className={`px-3 py-1 text-sm rounded-md transition-colors ${
            market === 'NYSE'
              ? 'bg-primary-blue text-white'
              : 'bg-bg-secondary text-text-secondary hover:bg-bg-tertiary'
          }`}
        >
          해외
        </button>
      </div>

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && results.length > 0 && setShowResults(true)}
          onKeyDown={handleKeyDown}
          placeholder={
            market === 'KRX'
              ? '종목명 또는 종목 코드 검색 (예: 삼성전자, 005930)'
              : market === 'NYSE'
              ? '종목명 또는 심볼 검색 (예: Apple, AAPL)'
              : '종목명 또는 코드 검색 (예: 삼성전자, Apple, AAPL)'
          }
          disabled={disabled}
          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-blue disabled:bg-gray-100"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-blue"></div>
          </div>
        )}
        {!isLoading && query.length >= 2 && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-tertiary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        )}
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {results.map((stock, index) => (
            <button
              key={stock.symbol}
              type="button"
              onClick={() => handleSelect(stock)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={`w-full text-left px-4 py-2 hover:bg-bg-secondary transition-colors ${
                index === selectedIndex ? 'bg-bg-secondary' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-text-primary">{stock.name}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-text-secondary font-mono">{stock.symbol}</span>
                    <span className="text-xs px-1.5 py-0.5 bg-primary-blue bg-opacity-10 text-primary-blue rounded">
                      {stock.market}
                    </span>
                  </div>
                </div>
                {stock.sector && (
                  <span className="text-xs px-2 py-0.5 bg-bg-tertiary text-text-secondary rounded">
                    {stock.sector}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {showResults && query.length >= 2 && results.length === 0 && !isLoading && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-4 text-center text-text-secondary">
          검색 결과가 없습니다
        </div>
      )}
    </div>
  );
}
