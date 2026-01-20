import { supabase } from '../config/supabase.js'
import { ADMIN_BASE_ROLES, ensureBootstrapRoles, getUserRoles, hasAnyRole } from '../lib/rbac.js'

/**
 * Middleware to verify authentication
 * Attaches user and roles to request
 */
export const verifyAuth = async (req, res, next) => {
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

    const userEmail = (user.email || '').trim().toLowerCase()
    await ensureBootstrapRoles()

    const roles = await getUserRoles(user.id)

    let profileRole = null
    try {
      let { data: profile } = await supabase
        .from('profiles')
        .select('role, email')
        .eq('id', user.id)
        .single()

      if (!profile) {
        const { data: createdProfile } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            email: userEmail,
            role: 'user',
          })
          .select('role, email')
          .single()
        profile = createdProfile
      }

      if (profile?.email && profile.email !== userEmail) {
        await supabase
          .from('profiles')
          .update({ email: userEmail })
          .eq('id', user.id)
      }

      profileRole = profile?.role || null
    } catch (error) {
      profileRole = null
    }

    const derivedRoles = new Set(roles)
    if (profileRole) {
      if (profileRole === 'super_admin') {
        derivedRoles.add('super_admin')
      } else if (profileRole === 'admin') {
        derivedRoles.add('admin')
        derivedRoles.add('admin_manager')
      } else if (profileRole !== 'user') {
        derivedRoles.add(profileRole)
      }
    }

    req.user = {
      ...user,
      roles: Array.from(derivedRoles),
      isAdmin: hasAnyRole(Array.from(derivedRoles), ADMIN_BASE_ROLES),
    }

    return next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    res.status(500).json({ 
      success: false, 
      message: 'Authentication error' 
    })
  }
}

export const requireRoles = (roles = []) => {
  return async (req, res, next) => {
    try {
      await verifyAuth(req, res, async () => {
        if (hasAnyRole(req.user.roles, roles)) {
          return next()
        }

        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin privileges required.',
        })
      })
    } catch (error) {
      console.error('RBAC middleware error:', error)
      res.status(500).json({ success: false, message: 'Authorization error' })
    }
  }
}

/**
 * Backwards compatible admin middleware
 */
export const verifyAdmin = requireRoles(ADMIN_BASE_ROLES)
