/**
 * Admin seed utilities.
 * Uses environment variables to identify bootstrap admin emails.
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
  const adminEmailsEnv = [
    process.env.SUPER_ADMIN_EMAIL || '',
    process.env.ADMIN_EMAILS || '',
  ]
    .filter(Boolean)
    .join(',')

  const fallbackAdmins = ['brianomomdi@gmail.com']

  const normalized = adminEmailsEnv
    .split(',')
    .map(email => normalizeEmail(email))
    .filter(email => email.length > 0)

  if (normalized.length > 0) {
    return Array.from(new Set(normalized))
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
