/**
 * Admin utilities for email-based admin detection
 * Uses environment variable VITE_ADMIN_EMAILS (comma-separated list)
 */

/**
 * Normalize email for comparison (lowercase, trim)
 */
const normalizeEmail = (email) => {
  if (!email) return ''
  return email.toLowerCase().trim()
}

/**
 * Get admin emails from environment variable
 * Falls back to a safe dev default when not provided.
 * @returns {string[]} Array of normalized admin emails
 */
export const getAdminEmails = () => {
  const adminEmailsEnv = import.meta.env.VITE_ADMIN_EMAILS || ''
  const fallbackAdmins = ['brianomomdi@gmail.com']

  const normalized = adminEmailsEnv
    .split(',')
    .map(email => normalizeEmail(email))
    .filter(email => email.length > 0)

  if (normalized.length > 0) {
    return normalized
  }

  return fallbackAdmins.map(email => normalizeEmail(email))
}

/**
 * Check if an email is an admin email
 * @param {string} email - Email to check
 * @returns {boolean} True if email is in admin list
 */
export const isAdminEmail = (email) => {
  if (!email) return false
  
  const normalizedEmail = normalizeEmail(email)
  const adminEmails = getAdminEmails()
  
  return adminEmails.includes(normalizedEmail)
}

/**
 * Check if current user is admin (from Supabase session)
 * @returns {Promise<boolean>} True if current user is admin
 */
export const isCurrentUserAdmin = async () => {
  try {
    const { supabase } = await import('./supabase.js')
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session?.user?.email) return false
    
    return isAdminEmail(session.user.email)
  } catch (error) {
    console.error('Error checking admin status:', error)
    return false
  }
}
