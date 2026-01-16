/**
 * Admin utilities for email-based admin detection
 * Uses environment variable ADMIN_EMAILS (comma-separated list)
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
  const adminEmailsEnv = process.env.ADMIN_EMAILS || ''
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
 * Ensure admin role is set in profiles table for admin emails
 * This should be called after user signup or login
 * @param {string} userId - User UUID
 * @param {string} email - User email
 * @param {object} supabase - Supabase client with service role
 */
export const ensureAdminRole = async (userId, email, supabase) => {
  if (!isAdminEmail(email)) return false
  
  try {
    // Update profile role to admin if email is in admin list
    const { error } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', userId)
      .eq('email', email)
    
    if (error) {
      console.error('Error setting admin role:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Error in ensureAdminRole:', error)
    return false
  }
}
