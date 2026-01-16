import { supabase } from '../config/supabase.js'
import { isAdminEmail, ensureAdminRole } from '../lib/admin.js'

/**
 * Middleware to verify admin authentication
 * Checks if user is authenticated and has admin role (via email list or DB role)
 */
export const verifyAdmin = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'No authentication token provided' 
      })
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      })
    }

    const userEmail = user.email

    // Primary check: Email-based admin detection (source of truth)
    if (isAdminEmail(userEmail)) {
      // Ensure role is set in DB for consistency
      await ensureAdminRole(user.id, userEmail, supabase)
      req.user = user
      req.user.isAdmin = true
      return next()
    }

    // Fallback check: Check user metadata
    const userRole = user.user_metadata?.role || user.app_metadata?.role
    
    if (userRole === 'admin') {
      req.user = user
      req.user.isAdmin = true
      return next()
    }

    // Fallback check: Check profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, email')
      .eq('id', user.id)
      .single()

    // If profile exists and role is admin, allow access
    if (!profileError && profile?.role === 'admin') {
      req.user = user
      req.user.isAdmin = true
      return next()
    }

    // If email is in admin list but role not set, set it and allow
    if (isAdminEmail(profile?.email || userEmail)) {
      await ensureAdminRole(user.id, userEmail, supabase)
      req.user = user
      req.user.isAdmin = true
      return next()
    }

    // All checks failed
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. Admin privileges required.' 
    })
  } catch (error) {
    console.error('Auth middleware error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Authentication error' 
    })
  }
}
