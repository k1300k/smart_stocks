/** 
 * Alpha Vantage API 키 입력 모달
 */

import { useEffect, useState } from 'react'
import { useApiKey } from '../../contexts/ApiKeyContext'

interface ApiKeyModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ApiKeyModal({ isOpen, onClose }: ApiKeyModalProps) {
  const { alphaKey, setAlphaKey } = useApiKey()
  const [inputValue, setInputValue] = useState(alphaKey)

  useEffect(() => {
    setInputValue(alphaKey)
  }, [alphaKey])

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">API 키 설정</h2>
          <button onClick={onClose} className="text-text-tertiary hover:text-text-primary">
            ✕
          </button>
        </div>
        <p className="mt-2 text-sm text-text-secondary">
          Alpha Vantage API 키를 입력하면 해외 주식 검색과 현재가 정보를 실시간으로 가져옵니다.
        </p>
        <label className="mt-4 block text-sm font-medium text-text-secondary">Alpha Vantage API Key</label>
        <input
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          placeholder="예: TB6MLLZCCCNOCVLR"
          className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-primary-blue focus:outline-none focus:ring-2 focus:ring-primary-blue/50"
        />
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => {
              setAlphaKey(inputValue.trim())
              onClose()
            }}
            className="flex-1 rounded-md bg-primary-blue px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600"
          >
            저장
          </button>
          <button
            onClick={() => {
              setInputValue(alphaKey)
              onClose()
            }}
            className="flex-1 rounded-md border border-gray-200 px-4 py-2 text-sm font-semibold text-text-secondary"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  )
}
