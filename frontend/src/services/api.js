import axios from 'axios'
import { config } from '../config'
import { supabase } from '../lib/supabase'

const api = axios.create({
  baseURL: config.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
})

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  try {
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
      delete config.headers['content-type']
    }
    // Get Supabase session token
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('Failed to get auth token:', error)
    }
  }
  return config
})

// Error interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log error without exposing secrets
    if (import.meta.env.DEV) {
      if (error.response) {
        console.error('API Error:', {
          status: error.response.status,
          url: error.config?.url,
          message: error.response.data?.message || error.message,
        })
      } else if (error.request) {
        console.error('API Request failed - no response:', {
          url: error.config?.url,
          message: 'Network error or backend unreachable',
        })
      } else {
        console.error('API Error:', error.message)
      }
    }
    return Promise.reject(error)
  }
)

export default api
