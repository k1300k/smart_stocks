/**
 * CSV 서비스
 * 포트폴리오 데이터를 CSV로 변환 및 파싱
 */

import { Holding } from '../types';
import { convertKrwToUsd, convertUsdToKrw } from '../utils/currency';

/**
 * CSV 헤더
 */
const CSV_HEADERS = [
  '종목코드',
  '종목명',
  '보유수량',
  '평균매수가(원)',
  '평균매수가(달러)',
  '현재가(원)',
  '현재가(달러)',
  '섹터',
  '태그',
];

/**
 * Holding을 CSV 행으로 변환
 */
function holdingToCsvRow(holding: Holding): string[] {
  return [
    holding.symbol,
    holding.name,
    holding.quantity.toString(),
    holding.avgPriceKrw.toString(),
    holding.avgPriceUsd.toString(),
    holding.currentPriceKrw.toString(),
    holding.currentPriceUsd.toString(),
    holding.sector || '',
    holding.tags.join(';'), // 태그는 세미콜론으로 구분
  ];
}

/**
 * CSV 행을 Holding으로 변환
 */
function csvRowToHolding(row: string[], headers: string[]): Holding | null {
  try {
    const symbolIndex = headers.indexOf('종목코드');
    const nameIndex = headers.indexOf('종목명');
    const quantityIndex = headers.indexOf('보유수량');
    const avgPriceKrwIndex = headers.indexOf('평균매수가(원)');
    const avgPriceUsdIndex = headers.indexOf('평균매수가(달러)');
    const currentPriceKrwIndex = headers.indexOf('현재가(원)');
    const currentPriceUsdIndex = headers.indexOf('현재가(달러)');
    const sectorIndex = headers.indexOf('섹터');
    const tagsIndex = headers.indexOf('태그');

    // v2 (dual price) required
    const hasV2 =
      avgPriceKrwIndex !== -1 &&
      avgPriceUsdIndex !== -1 &&
      currentPriceKrwIndex !== -1 &&
      currentPriceUsdIndex !== -1;

    // legacy (single price + currency) support
    const avgPriceLegacyIndex = headers.indexOf('평균매수가');
    const currentPriceLegacyIndex = headers.indexOf('현재가');
    const currencyLegacyIndex = headers.indexOf('통화');
    const hasLegacy = avgPriceLegacyIndex !== -1 && currentPriceLegacyIndex !== -1;

    if (symbolIndex === -1 || nameIndex === -1 || quantityIndex === -1 || (!hasV2 && !hasLegacy)) {
      return null;
    }

    const tags = row[tagsIndex] ? row[tagsIndex].split(';').map(t => t.trim()).filter(t => t) : [];

    const symbol = row[symbolIndex]?.trim() || '';
    const name = row[nameIndex]?.trim() || '';
    const quantity = parseFloat(row[quantityIndex] || '0');
    const sector = row[sectorIndex]?.trim() || '기타';

    if (hasV2) {
      const avgPriceKrw = parseFloat(row[avgPriceKrwIndex] || '0');
      const avgPriceUsd = parseFloat(row[avgPriceUsdIndex] || '0');
      const currentPriceKrw = parseFloat(row[currentPriceKrwIndex] || '0');
      const currentPriceUsd = parseFloat(row[currentPriceUsdIndex] || '0');

      return {
        symbol,
        name,
        quantity,
        avgPriceKrw,
        avgPriceUsd,
        currentPriceKrw,
        currentPriceUsd,
        sector,
        tags,
      };
    }

    // legacy
    const legacyAvg = parseFloat(row[avgPriceLegacyIndex] || '0');
    const legacyCur = parseFloat(row[currentPriceLegacyIndex] || '0');
    const legacyCurrency = row[currencyLegacyIndex]?.trim() === 'USD' ? 'USD' : 'KRW';

    const avgPriceKrw = legacyCurrency === 'USD' ? Math.round(convertUsdToKrw(legacyAvg)) : Math.round(legacyAvg);
    const currentPriceKrw = legacyCurrency === 'USD' ? Math.round(convertUsdToKrw(legacyCur)) : Math.round(legacyCur);
    const avgPriceUsd = legacyCurrency === 'USD' ? Number(legacyAvg.toFixed(2)) : Number(convertKrwToUsd(avgPriceKrw).toFixed(2));
    const currentPriceUsd = legacyCurrency === 'USD' ? Number(legacyCur.toFixed(2)) : Number(convertKrwToUsd(currentPriceKrw).toFixed(2));

    return {
      symbol,
      name,
      quantity,
      avgPriceKrw,
      avgPriceUsd,
      currentPriceKrw,
      currentPriceUsd,
      sector,
      tags,
    };
  } catch (error) {
    console.error('CSV row parsing error:', error);
    return null;
  }
}

/**
 * 포트폴리오 데이터를 CSV 문자열로 변환
 */
export function exportToCsv(holdings: Holding[]): string {
  const rows: string[][] = [];
  
  // 헤더 추가
  rows.push(CSV_HEADERS);
  
  // 데이터 행 추가
  holdings.forEach(holding => {
    rows.push(holdingToCsvRow(holding));
  });
  
  // CSV 문자열 생성 (BOM 추가하여 Excel에서 한글 깨짐 방지)
  const csvContent = '\uFEFF' + rows.map(row => 
    row.map(cell => {
      // 쉼표, 따옴표, 줄바꿈이 포함된 경우 따옴표로 감싸기
      if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
        return `"${cell.replace(/"/g, '""')}"`;
      }
      return cell;
    }).join(',')
  ).join('\n');
  
  return csvContent;
}

/**
 * CSV 문자열을 포트폴리오 데이터로 변환
 */
export function importFromCsv(csvContent: string): Holding[] {
  const holdings: Holding[] = [];
  
  // BOM 제거
  const content = csvContent.replace(/^\uFEFF/, '');
  
  // 줄 단위로 분리
  const lines = content.split(/\r?\n/).filter(line => line.trim());
  
  if (lines.length < 2) {
    throw new Error('CSV 파일에 데이터가 없습니다.');
  }
  
  // 헤더 파싱
  const headerLine = lines[0];
  const headers = parseCsvLine(headerLine);
  
  // 헤더 검증
  const v2Required = ['종목코드', '종목명', '보유수량', '평균매수가(원)', '평균매수가(달러)', '현재가(원)', '현재가(달러)'];
  const legacyRequired = ['종목코드', '종목명', '보유수량', '평균매수가', '현재가'];
  const hasV2 = v2Required.every(h => headers.includes(h));
  const hasLegacy = legacyRequired.every(h => headers.includes(h));

  if (!hasV2 && !hasLegacy) {
    const missing = v2Required.filter(h => !headers.includes(h));
    throw new Error(`필수 컬럼이 없습니다: ${missing.join(', ')}`);
  }
  
  // 데이터 행 파싱
  for (let i = 1; i < lines.length; i++) {
    const row = parseCsvLine(lines[i]);
    const holding = csvRowToHolding(row, headers);
    
    if (holding && holding.symbol && holding.name) {
      holdings.push(holding);
    }
  }
  
  return holdings;
}

/**
 * CSV 라인 파싱 (쉼표와 따옴표 처리)
 */
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    
    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // 이스케이프된 따옴표
        current += '"';
        i++; // 다음 문자 스킵
      } else {
        // 따옴표 시작/끝
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // 필드 구분자
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  // 마지막 필드 추가
  result.push(current.trim());
  
  return result;
}

/**
 * 파일 다운로드 헬퍼
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 파일 읽기 헬퍼
 */
export function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error('파일 읽기 실패'));
      }
    };
    reader.onerror = () => reject(new Error('파일 읽기 오류'));
    reader.readAsText(file, 'UTF-8');
  });
}
