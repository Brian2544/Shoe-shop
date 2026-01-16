/**
 * Twilio Configuration Helper
 * Provides safe, lazy initialization of Twilio client
 * Server will boot successfully even if Twilio credentials are missing
 */

/**
 * Check if Twilio is configured
 * @returns {Object} { isConfigured: boolean, missingVars: string[] }
 */
export function checkTwilioConfig() {
  const requiredVars = ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN']
  const missingVars = requiredVars.filter(varName => !process.env[varName] || process.env[varName].trim() === '')
  
  return {
    isConfigured: missingVars.length === 0,
    missingVars,
  }
}

// Lazy import Twilio module (only loaded when needed)
let twilioModule = null

/**
 * Get Twilio client instance (lazy initialization)
 * Returns null if Twilio is not configured
 * @returns {Promise<import('twilio').Twilio | null>}
 */
export async function getTwilioClient() {
  const { isConfigured } = checkTwilioConfig()
  
  if (!isConfigured) {
    return null
  }
  
  // Lazy import to avoid loading Twilio module if not needed
  if (!twilioModule) {
    twilioModule = await import('twilio')
  }
  
  return twilioModule.default(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  )
}

/**
 * Get Twilio from number
 * Checks TWILIO_FROM_NUMBER first, then TWILIO_MESSAGING_SERVICE_SID
 * @returns {string | null}
 */
export function getTwilioFromNumber() {
  return process.env.TWILIO_FROM_NUMBER || 
         process.env.TWILIO_MESSAGING_SERVICE_SID || 
         null
}
