import { createClient } from '@supabase/supabase-js'

// Validate required environment variables
const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Validate env vars exist
const missingVars = []
if (!supabaseUrl) missingVars.push('SUPABASE_URL')
if (!supabaseAnonKey) missingVars.push('SUPABASE_ANON_KEY')
if (!supabaseServiceRoleKey) missingVars.push('SUPABASE_SERVICE_ROLE_KEY')

if (missingVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingVars.join(', ')}. ` +
    'Please check your .env file.'
  )
}

// Validate URL format
if (!supabaseUrl.startsWith('http://') && !supabaseUrl.startsWith('https://')) {
  throw new Error('SUPABASE_URL must be a valid URL (starting with http:// or https://)')
}

// Validate keys are non-empty
if (supabaseAnonKey.trim().length === 0) {
  throw new Error('SUPABASE_ANON_KEY cannot be empty')
}
if (supabaseServiceRoleKey.trim().length === 0) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY cannot be empty')
}

// Create admin client with service role key (bypasses RLS)
// WARNING: Only use this on the server-side. Never expose service role key to frontend.
export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false,
  },
})

// Create public client with anon key (respects RLS)
// Use this for operations that should respect Row Level Security policies
export const supabasePublic = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: false,
  },
})
