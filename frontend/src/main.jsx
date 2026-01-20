import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

if (import.meta.env.DEV) {
  console.log('🚀 Starting React application...')
}

// Create root element if it doesn't exist
let rootElement = document.getElementById('root')
if (!rootElement) {
  if (import.meta.env.DEV) {
    console.warn('⚠️ Root element not found, creating it...')
  }
  rootElement = document.createElement('div')
  rootElement.id = 'root'
  document.body.appendChild(rootElement)
}
if (import.meta.env.DEV) {
  console.log('✅ Root element found')
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

try {
  if (import.meta.env.DEV) {
    console.log('📦 Rendering React app...')
  }
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </QueryClientProvider>
      </ErrorBoundary>
    </React.StrictMode>
  )
  if (import.meta.env.DEV) {
    console.log('✅ React app rendered successfully!')
  }
} catch (error) {
  console.error('❌ Failed to render app:', error)
  rootElement.innerHTML = `
    <div style="padding: 40px; text-align: center; font-family: Arial, sans-serif; min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f5f5f5;">
      <div style="background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 500px;">
        <h1 style="color: #d32f2f; margin-bottom: 16px;">Error Loading App</h1>
        <p style="color: #666; margin-bottom: 8px;">${error.message}</p>
        <p style="color: #999; font-size: 14px; margin-top: 20px; margin-bottom: 24px;">Check browser console (F12) for details</p>
        <button onclick="window.location.reload()" style="padding: 12px 24px; background: #FF6B35; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: bold;">
          Reload Page
        </button>
      </div>
    </div>
  `
}
