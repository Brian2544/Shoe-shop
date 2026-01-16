import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { isAdminEmail } from '../lib/admin'
import { Loader } from 'lucide-react'

/**
 * Protected route component for admin-only pages
 * Checks if user is authenticated and is an admin
 */
const AdminRoute = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

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

        // Check if email is in admin list
        const userEmail = session.user?.email
        if (userEmail && isAdminEmail(userEmail)) {
          setIsAdmin(true)
        } else {
          // Fallback: Check profile role
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('role, email')
              .eq('id', session.user.id)
              .single()

            if (profile?.role === 'admin' || isAdminEmail(profile?.email || userEmail)) {
              setIsAdmin(true)
            } else {
              setIsAdmin(false)
            }
          } catch (error) {
            console.error('Error checking profile:', error)
            setIsAdmin(false)
          }
        }
      } catch (error) {
        console.error('Error checking admin access:', error)
        setIsAdmin(false)
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
    return <Navigate to="/" replace />
  }

  return children
}

export default AdminRoute
