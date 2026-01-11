/**
 * 메인 App 컴포넌트
 */

import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MindMapView from './components/MindMap/MindMapView';
import ViewModeSelector from './components/MindMap/ViewModeSelector';
import NodeDetailPanel from './components/MindMap/NodeDetailPanel';
import PortfolioList from './components/Portfolio/PortfolioList';
import { ViewMode, MindMapNode } from './types';
import { transformPortfolioToMindMap } from './services/portfolioTransform';
import { usePortfolioStore } from './stores/portfolioStore';
import { useExchangeRateStore } from './stores/exchangeRateStore';
import ApiKeyModal from './components/Settings/ApiKeyModal';
import ExchangeRateModal from './components/Settings/ExchangeRateModal';

function Dashboard() {
  const [viewMode, setViewMode] = useState<ViewMode>('sector');
  const [selectedNode, setSelectedNode] = useState<MindMapNode | null>(null);
  const [showPortfolioList, setShowPortfolioList] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [showExchangeRateModal, setShowExchangeRateModal] = useState(false);
  const portfolio = usePortfolioStore(state => state.portfolio);
  const { updateRate } = useExchangeRateStore();

  // 앱 시작 시 환율 업데이트
  useEffect(() => {
    console.log('🚀 앱 시작: 환율 자동 업데이트 초기화');
    updateRate().catch(err => {
      console.error('초기 환율 업데이트 실패:', err);
    });
    
    // 30분마다 환율 자동 업데이트
    const interval = setInterval(() => {
      console.log('⏰ 30분 경과: 환율 자동 업데이트 트리거');
      updateRate().catch(err => {
        console.error('주기적 환율 업데이트 실패:', err);
      });
    }, 30 * 60 * 1000); // 30분

    return () => {
      console.log('🛑 환율 자동 업데이트 중지');
      clearInterval(interval);
    };
  }, [updateRate]);

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
            <button
              onClick={() => setShowExchangeRateModal(true)}
              className="px-4 py-2 rounded-md border border-gray-200 bg-white text-sm font-medium text-text-secondary transition hover:border-primary-blue hover:text-primary-blue"
            >
              환율 설정
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
      <ExchangeRateModal isOpen={showExchangeRateModal} onClose={() => setShowExchangeRateModal(false)} />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
