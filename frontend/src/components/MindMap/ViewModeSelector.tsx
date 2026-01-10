/**
 * 뷰 모드 선택 컴포넌트
 */

import { ViewMode } from '../../types';

interface ViewModeSelectorProps {
  currentMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}

export default function ViewModeSelector({
  currentMode,
  onModeChange,
}: ViewModeSelectorProps) {
  const modes: Array<{ value: ViewMode; label: string }> = [
    { value: 'sector', label: '섹터별' },
    { value: 'profitLoss', label: '수익률별' },
    { value: 'theme', label: '테마별' },
    { value: 'tag', label: '태그별' },
  ];

  return (
    <div className="flex gap-2 p-2 bg-white rounded-lg shadow-sm border border-gray-200">
      {modes.map(mode => (
        <button
          key={mode.value}
          onClick={() => onModeChange(mode.value)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            currentMode === mode.value
              ? 'bg-primary-blue text-white'
              : 'bg-bg-secondary text-text-secondary hover:bg-bg-tertiary'
          }`}
        >
          {mode.label}
        </button>
      ))}
    </div>
  );
}
