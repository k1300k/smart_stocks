import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'mindstock_alpha_vantage_api_key'

interface ApiKeyContextValue {
  alphaKey: string
  setAlphaKey: (value: string) => void
}

const ApiKeyContext = createContext<ApiKeyContextValue>({
  alphaKey: '',
  setAlphaKey: () => {},
})

export function ApiKeyProvider({ children }: { children: ReactNode }) {
  const [alphaKey, setAlphaKey] = useState(() => {
    if (typeof window === 'undefined') {
      return ''
    }
    return localStorage.getItem(STORAGE_KEY) ?? ''
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, alphaKey)
    }
  }, [alphaKey])

  const value = useMemo(() => ({ alphaKey, setAlphaKey }), [alphaKey])

  return <ApiKeyContext.Provider value={value}>{children}</ApiKeyContext.Provider>
}

export function useApiKey() {
  return useContext(ApiKeyContext)
}
