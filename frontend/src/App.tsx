/**
 * 메인 App 컴포넌트
 */

import { useState } from 'react';
import MindMapView from './components/MindMap/MindMapView';
import ViewModeSelector from './components/MindMap/ViewModeSelector';
import NodeDetailPanel from './components/MindMap/NodeDetailPanel';
import PortfolioList from './components/Portfolio/PortfolioList';
import { ViewMode, MindMapNode } from './types';
import { transformPortfolioToMindMap } from './services/portfolioTransform';
import { usePortfolioStore } from './stores/portfolioStore';
import ApiKeyModal from './components/Settings/ApiKeyModal';

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('sector');
  const [selectedNode, setSelectedNode] = useState<MindMapNode | null>(null);
  const [showPortfolioList, setShowPortfolioList] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const portfolio = usePortfolioStore(state => state.portfolio);

  // 포트폴리오 데이터를 마인드맵 노드로 변환
  const mindMapData = transformPortfolioToMindMap(portfolio, viewMode);

  const handleNodeClick = (node: MindMapNode) => {
    setSelectedNode(node);
  };

  const handleClosePanel = () => {
    setSelectedNode(null);
  };

  return (
    <div className="w-full h-screen flex flex-col bg-bg-secondary">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-text-primary">MindStock</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowPortfolioList(!showPortfolioList)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                showPortfolioList
                  ? 'bg-primary-blue text-white'
                  : 'bg-bg-secondary text-text-secondary hover:bg-bg-tertiary'
              }`}
            >
              포트폴리오 관리
            </button>
            <button
              onClick={() => setShowApiKeyModal(true)}
              className="px-4 py-2 rounded-md border border-gray-200 bg-white text-sm font-medium text-text-secondary transition hover:border-primary-blue hover:text-primary-blue"
            >
              API 키 설정
            </button>
            <ViewModeSelector currentMode={viewMode} onModeChange={setViewMode} />
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 p-6 overflow-hidden flex gap-6">
        {/* 마인드맵 영역 */}
        <div className={`flex-1 transition-all ${showPortfolioList ? 'w-2/3' : 'w-full'}`}>
          <MindMapView
            data={mindMapData}
            viewMode={viewMode}
            width={showPortfolioList ? (window.innerWidth - 48) * 0.65 : window.innerWidth - 48}
            height={window.innerHeight - 120}
            onNodeClick={handleNodeClick}
          />
        </div>

        {/* 포트폴리오 목록 패널 */}
        {showPortfolioList && (
          <div className="w-1/3">
            <PortfolioList />
          </div>
        )}
      </main>

      {/* 노드 상세 패널 */}
      <NodeDetailPanel node={selectedNode} onClose={handleClosePanel} />
      <ApiKeyModal isOpen={showApiKeyModal} onClose={() => setShowApiKeyModal(false)} />
    </div>
  );
}

export default App;
