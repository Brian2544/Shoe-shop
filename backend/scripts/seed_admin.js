import { createClient } from '@supabase/supabase-js'
import { pathToFileURL } from 'url'
import { getAdminEmails } from '../lib/admin.js'

const supabaseUrl = process.env.SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const createServiceClient = () =>
  createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  })

const normalizeEmail = (email) => (email || '').toLowerCase().trim()

const seedRolesCatalog = async (supabase) => {
  const roles = [
    { name: 'super_admin', description: 'Full system access' },
    { name: 'admin_manager', description: 'Manage admins and roles' },
    { name: 'product_manager', description: 'Manage products and categories' },
    { name: 'order_manager', description: 'Manage orders and fulfillment' },
    { name: 'support_agent', description: 'View customers and orders' },
    { name: 'marketing_manager', description: 'Manage promotions and featured products' },
  ]

  const { error } = await supabase.from('roles').upsert(roles, { onConflict: 'name' })
  if (error) {
    console.warn('Roles table not available; skipping role seed.')
    return null
  }

  const { data: roleRow } = await supabase
    .from('roles')
    .select('id')
    .eq('name', 'super_admin')
    .single()

  return roleRow?.id || null
}

const seedAdminUsers = async () => {
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.')
  }

  const adminEmails = getAdminEmails()
  if (adminEmails.length === 0) {
    throw new Error('No admin seed emails configured.')
  }

  const supabase = createServiceClient()
  const { data: users, error: usersError } = await supabase.auth.admin.listUsers()
  if (usersError) throw usersError

  const superAdminRoleId = await seedRolesCatalog(supabase)

  for (const email of adminEmails) {
    const normalizedEmail = normalizeEmail(email)
    const user = users.users.find((u) => normalizeEmail(u.email) === normalizedEmail)
    if (!user) {
      console.warn(`Admin user not found in auth.users: ${normalizedEmail}`)
      continue
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({ id: user.id, email: normalizedEmail, role: 'admin' }, { onConflict: 'id' })

    if (profileError) throw profileError

    if (superAdminRoleId) {
      await supabase
        .from('user_roles')
        .upsert({ user_id: user.id, role_id: superAdminRoleId }, { onConflict: 'user_id,role_id' })
    }

    console.log('✅ Admin profile seeded:', normalizedEmail)
  }

  return true
}

const run = async () => {
  try {
    await seedAdminUsers()
    console.log('✅ Admin seed completed')
  } catch (error) {
    console.error('Admin seed failed:', error.message)
    process.exit(1)
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  run()
}

export { seedAdminUsers }
