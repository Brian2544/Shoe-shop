/**
 * Application Configuration
 * Centralized config for API URLs and environment variables
 */

export const config = {
  // API Configuration
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  apiBaseUrl: import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000',
  
  // Supabase Configuration
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || '',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  
  // Environment
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  
  // Frontend Port (for connectivity checks)
  frontendPort: import.meta.env.VITE_PORT || 3000,
}

/**
 * Check if required environment variables are present
 * Returns object with status and missing variables (names only, never values)
 */
export function checkEnvConfig() {
  const missing = []
  
  if (!config.supabaseUrl) missing.push('VITE_SUPABASE_URL')
  if (!config.supabaseAnonKey) missing.push('VITE_SUPABASE_ANON_KEY')
  
  return {
    isConfigured: missing.length === 0,
    missing,
    hasApiUrl: !!config.apiUrl,
  }
}

export default config
