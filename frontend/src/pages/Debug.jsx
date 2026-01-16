import { useState, useEffect } from 'react'
import { useQuery } from 'react-query'
import { CheckCircle, XCircle, AlertCircle, Loader } from 'lucide-react'
import { config, checkEnvConfig } from '../config'
import api from '../services/api'
import { supabase } from '../lib/supabase'
import { isAdminEmail, getAdminEmails } from '../lib/admin'

const Debug = () => {
  const [backendHealth, setBackendHealth] = useState({ status: 'checking', error: null })
  const [backendConfig, setBackendConfig] = useState(null)
  const [lastApiError, setLastApiError] = useState(null)
  const [productsCount, setProductsCount] = useState(null)
  const [authStatus, setAuthStatus] = useState({ isAuthenticated: false, user: null, isAdmin: false })

  const envConfig = checkEnvConfig()

  // Check backend health and config
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await api.get('/health')
        setBackendHealth({ status: 'ok', error: null })
      } catch (error) {
        setBackendHealth({ 
          status: 'error', 
          error: error.message || 'Backend unreachable' 
        })
        setLastApiError({
          message: error.message,
          code: error.code,
          url: error.config?.url,
        })
      }
    }
    
    const checkConfig = async () => {
      try {
        const response = await api.get('/config-status')
        setBackendConfig(response.data)
      } catch (error) {
        // Config endpoint might not exist, that's ok
        console.warn('Config status endpoint not available:', error.message)
      }
    }
    
    checkHealth()
    if (process.env.NODE_ENV === 'development') {
      checkConfig()
    }
  }, [])
  
  // Check auth status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          const userEmail = session.user.email
          const isAdmin = isAdminEmail(userEmail)
          setAuthStatus({
            isAuthenticated: true,
            user: {
              email: userEmail,
              id: session.user.id,
            },
            isAdmin
          })
        } else {
          setAuthStatus({ isAuthenticated: false, user: null, isAdmin: false })
        }
      } catch (error) {
        console.error('Error checking auth:', error)
      }
    }
    
    checkAuth()
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAuth()
    })
    
    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  // Try to fetch products count
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('id', { count: 'exact', head: true })
        
        if (error) throw error
        setProductsCount(data?.length || 0)
      } catch (error) {
        console.error('Error fetching products count:', error)
        setProductsCount('error')
      }
    }
    fetchProducts()
  }, [])

  const StatusIcon = ({ status }) => {
    switch (status) {
      case 'ok':
        return <CheckCircle className="w-6 h-6 text-green-500" />
      case 'error':
        return <XCircle className="w-6 h-6 text-red-500" />
      case 'checking':
        return <Loader className="w-6 h-6 text-blue-500 animate-spin" />
      default:
        return <AlertCircle className="w-6 h-6 text-yellow-500" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">System Diagnostics</h1>

        <div className="space-y-6">
          {/* Environment Variables */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Environment Variables
            </h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">VITE_API_URL:</span>
                <span className={config.apiUrl ? 'text-green-600 font-mono text-sm' : 'text-red-600'}>
                  {config.apiUrl ? '✓ Set' : '✗ Missing'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">VITE_SUPABASE_URL:</span>
                <span className={config.supabaseUrl ? 'text-green-600 font-mono text-sm' : 'text-red-600'}>
                  {config.supabaseUrl ? '✓ Set' : '✗ Missing'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">VITE_SUPABASE_ANON_KEY:</span>
                <span className={config.supabaseAnonKey ? 'text-green-600 font-mono text-sm' : 'text-red-600'}>
                  {config.supabaseAnonKey ? '✓ Set' : '✗ Missing'}
                </span>
              </div>
              {envConfig.missing.length > 0 && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm text-yellow-800">
                    <strong>Missing variables:</strong> {envConfig.missing.join(', ')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Backend Health */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <StatusIcon status={backendHealth.status} />
              Backend Health
            </h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={
                  backendHealth.status === 'ok' ? 'text-green-600' :
                  backendHealth.status === 'error' ? 'text-red-600' :
                  'text-blue-600'
                }>
                  {backendHealth.status === 'ok' ? 'Online' :
                   backendHealth.status === 'error' ? 'Offline' :
                   'Checking...'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">API URL:</span>
                <span className="font-mono text-sm">{config.apiUrl}</span>
              </div>
              {backendHealth.error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                  <p className="text-sm text-red-800">
                    <strong>Error:</strong> {backendHealth.error}
                  </p>
                  <p className="text-xs text-red-600 mt-2">
                    Check that backend is running on port 5000 and CORS is configured.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Auth Status */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <StatusIcon status={authStatus.isAuthenticated ? 'ok' : 'error'} />
              Authentication Status
            </h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Authenticated:</span>
                <span className={authStatus.isAuthenticated ? 'text-green-600' : 'text-red-600'}>
                  {authStatus.isAuthenticated ? 'Yes' : 'No'}
                </span>
              </div>
              {authStatus.user && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">User Email:</span>
                    <span className="font-mono text-sm">{authStatus.user.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Is Admin:</span>
                    <span className={authStatus.isAdmin ? 'text-green-600 font-semibold' : 'text-gray-600'}>
                      {authStatus.isAdmin ? 'Yes ✓' : 'No'}
                    </span>
                  </div>
                </>
              )}
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Admin Emails Configured:</span>
                <span className={getAdminEmails().length > 0 ? 'text-green-600' : 'text-yellow-600'}>
                  {getAdminEmails().length > 0 ? `${getAdminEmails().length} email(s)` : 'Not set'}
                </span>
              </div>
            </div>
          </div>

          {/* Backend Config (Dev Only) */}
          {process.env.NODE_ENV === 'development' && backendConfig && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">Backend Configuration</h2>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Supabase URL Host:</span>
                  <span className="font-mono text-xs">
                    {backendConfig.supabaseUrlHost || 'Not configured'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Supabase Configured:</span>
                  <span className={backendConfig.supabaseConfigured ? 'text-green-600' : 'text-red-600'}>
                    {backendConfig.supabaseConfigured ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Admin Emails:</span>
                  <span className="text-gray-800">
                    {backendConfig.adminEmailsCount || 0} configured
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Data Layer */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4">Data Layer</h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Products in database:</span>
                <span className="font-semibold">
                  {productsCount === null ? 'Loading...' :
                   productsCount === 'error' ? 'Error fetching' :
                   `${productsCount} products`}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Supabase configured:</span>
                <span className={envConfig.isConfigured ? 'text-green-600' : 'text-red-600'}>
                  {envConfig.isConfigured ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Supabase URL:</span>
                <span className="font-mono text-xs text-gray-600">
                  {config.supabaseUrl ? new URL(config.supabaseUrl).hostname : 'Not set'}
                </span>
              </div>
            </div>
          </div>

          {/* Last API Error */}
          {lastApiError && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4 text-red-600">Last API Error</h2>
              <div className="space-y-2 text-sm">
                <div>
                  <strong>Message:</strong> {lastApiError.message}
                </div>
                {lastApiError.code && (
                  <div>
                    <strong>Code:</strong> {lastApiError.code}
                  </div>
                )}
                {lastApiError.url && (
                  <div>
                    <strong>URL:</strong> <span className="font-mono">{lastApiError.url}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
            <div className="flex gap-4">
              <button
                onClick={() => window.location.reload()}
                className="btn-primary"
              >
                Reload Page
              </button>
              <button
                onClick={() => {
                  setBackendHealth({ status: 'checking', error: null })
                  window.location.reload()
                }}
                className="btn-outline"
              >
                Re-check Health
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Debug
