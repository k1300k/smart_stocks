import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ApiKeyProvider } from './contexts/ApiKeyContext'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ApiKeyProvider>
      <App />
    </ApiKeyProvider>
  </React.StrictMode>,
)
