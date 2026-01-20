import 'dotenv/config'
import { execSync } from 'node:child_process'

const supabaseUrl = process.env.SUPABASE_URL || ''
const dbUrl = process.env.SUPABASE_DB_URL || ''
const dbPassword = process.env.SUPABASE_DB_PASSWORD || ''
const dbHostOverride = process.env.SUPABASE_DB_HOST || ''
const poolerHost = process.env.SUPABASE_POOLER_HOST || 'aws-1-eu-central-1.pooler.supabase.com'
const poolerPort = process.env.SUPABASE_POOLER_PORT || '5432'

const getProjectRef = (url) => {
  try {
    const host = new URL(url).hostname
    return host.split('.')[0]
  } catch {
    return ''
  }
}

const buildDbUrl = () => {
  if (dbUrl) return dbUrl

  const projectRef = getProjectRef(supabaseUrl)
  if (!projectRef) return ''
  if (!dbPassword) return ''

  const host = dbHostOverride || poolerHost
  const username = dbHostOverride ? 'postgres' : `postgres.${projectRef}`
  return `postgresql://${username}:${encodeURIComponent(dbPassword)}@${host}:${poolerPort}/postgres?sslmode=require`
}

const run = () => {
  const finalDbUrl = buildDbUrl()
  if (!finalDbUrl) {
    throw new Error(
      'Missing SUPABASE_DB_URL or SUPABASE_DB_PASSWORD (and SUPABASE_URL).'
    )
  }

  execSync(
    `npx supabase db push --db-url "${finalDbUrl}" --include-all --include-seed`,
    { stdio: 'inherit' }
  )
}

try {
  run()
} catch (error) {
  console.error('❌ Migration failed:', error.message)
  process.exit(1)
}
