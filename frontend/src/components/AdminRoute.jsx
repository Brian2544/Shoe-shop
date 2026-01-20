import { useEffect, useState } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import api from '../services/api'
import { Loader } from 'lucide-react'

/**
 * Protected route component for admin-only pages
 * Checks if user is authenticated and is an admin
 */
const AdminRoute = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          setIsAuthenticated(false)
          setIsAdmin(false)
          setIsLoading(false)
          return
        }

        setIsAuthenticated(true)

        try {
          const response = await api.get('/admin/me')
          if (response.data?.success) {
            setIsAdmin(true)
            setErrorMessage('')
          } else {
            setIsAdmin(false)
            setErrorMessage('Not authorized to access admin dashboard.')
          }
        } catch (error) {
          setIsAdmin(false)
          setErrorMessage(error.response?.data?.message || 'Not authorized to access admin dashboard.')
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Error checking admin access:', error)
        }
        setIsAdmin(false)
        setErrorMessage('Unable to verify admin access.')
      } finally {
        setIsLoading(false)
      }
    }

    checkAdminAccess()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAdminAccess()
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-primary-orange animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Checking admin access...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access restricted</h2>
          <p className="text-gray-600 mb-4">{errorMessage || 'Admin privileges required.'}</p>
          <Link to="/" className="btn-primary inline-flex items-center justify-center">
            Back to home
          </Link>
        </div>
      </div>
    )
  }

  return children
}

export default AdminRoute
