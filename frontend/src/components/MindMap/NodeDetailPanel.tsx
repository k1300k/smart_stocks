/**
 * 노드 상세 정보 패널 (우측 드로어)
 */

import { MindMapNode } from '../../types';
import { getColorByProfitLoss } from '../../services/portfolioTransform';

interface NodeDetailPanelProps {
  node: MindMapNode | null;
  onClose: () => void;
}

export default function NodeDetailPanel({ node, onClose }: NodeDetailPanelProps) {
  if (!node) return null;

  const isOpen = node !== null;

  return (
    <>
      {/* 오버레이 */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-20 z-40"
          onClick={onClose}
        />
      )}

      {/* 드로어 */}
      <div
        className={`fixed top-0 right-0 h-full w-96 bg-white shadow-xl z-50 transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6 h-full overflow-y-auto">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-text-primary">{node.name}</h2>
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

          {/* 노드 타입별 정보 */}
          <div className="space-y-4">
            {/* 기본 정보 */}
            <div className="p-4 bg-bg-secondary rounded-lg">
              <div className="text-sm text-text-secondary mb-2">타입</div>
              <div className="text-base font-medium text-text-primary">
                {node.type === 'root' && '포트폴리오'}
                {node.type === 'category' && '카테고리'}
                {node.type === 'stock' && '종목'}
              </div>
            </div>

            {/* 가치 정보 */}
            <div className="p-4 bg-bg-secondary rounded-lg">
              <div className="text-sm text-text-secondary mb-2">포트폴리오 가치</div>
              <div className="text-2xl font-bold text-text-primary font-mono">
                {node.value.toLocaleString('ko-KR')}원
              </div>
            </div>

            {/* 손익 정보 */}
            {node.profitLoss !== undefined && (
              <div className="p-4 bg-bg-secondary rounded-lg">
                <div className="text-sm text-text-secondary mb-2">손익</div>
                <div
                  className="text-2xl font-bold font-mono"
                  style={{
                    color: getColorByProfitLoss(node.profitLossRate),
                  }}
                >
                  {node.profitLoss >= 0 ? '+' : ''}
                  {node.profitLoss.toLocaleString('ko-KR')}원
                </div>
                {node.profitLossRate !== undefined && (
                  <div
                    className="text-base mt-1"
                    style={{
                      color: getColorByProfitLoss(node.profitLossRate),
                    }}
                  >
                    {node.profitLossRate >= 0 ? '+' : ''}
                    {node.profitLossRate.toFixed(2)}%
                  </div>
                )}
              </div>
            )}

            {/* 섹터 정보 */}
            {node.sector && (
              <div className="p-4 bg-bg-secondary rounded-lg">
                <div className="text-sm text-text-secondary mb-2">섹터</div>
                <div className="text-base font-medium text-text-primary">{node.sector}</div>
              </div>
            )}

            {/* 태그 정보 */}
            {node.tags && node.tags.length > 0 && (
              <div className="p-4 bg-bg-secondary rounded-lg">
                <div className="text-sm text-text-secondary mb-2">태그</div>
                <div className="flex flex-wrap gap-2">
                  {node.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-primary-blue bg-opacity-10 text-primary-blue rounded-md text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 종목 코드 */}
            {node.symbol && (
              <div className="p-4 bg-bg-secondary rounded-lg">
                <div className="text-sm text-text-secondary mb-2">종목 코드</div>
                <div className="text-base font-mono text-text-primary">{node.symbol}</div>
              </div>
            )}

            {/* 하위 노드 정보 */}
            {node.children && node.children.length > 0 && (
              <div className="p-4 bg-bg-secondary rounded-lg">
                <div className="text-sm text-text-secondary mb-2">
                  하위 항목 ({node.children.length}개)
                </div>
                <div className="space-y-2">
                  {node.children.map(child => (
                    <div
                      key={child.id}
                      className="p-2 bg-white rounded border border-gray-200"
                    >
                      <div className="font-medium text-text-primary">{child.name}</div>
                      <div className="text-sm text-text-secondary">
                        {child.value.toLocaleString('ko-KR')}원
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
