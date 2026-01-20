import { supabase } from '../config/supabase.js'

const DEFAULT_ROLES = [
  { name: 'super_admin', description: 'Full system access' },
  { name: 'admin_manager', description: 'Manage admins and roles' },
  { name: 'product_manager', description: 'Manage products and categories' },
  { name: 'order_manager', description: 'Manage orders and fulfillment' },
  { name: 'support_agent', description: 'View customers and orders' },
  { name: 'marketing_manager', description: 'Manage promotions and featured products' },
]

export const seedRoles = async () => {
  const { data: existing, error } = await supabase.from('roles').select('name')
  if (error) {
    console.error('RBAC seed roles error:', error.message)
    return
  }

  const existingNames = new Set((existing || []).map((role) => role.name))
  const toInsert = DEFAULT_ROLES.filter((role) => !existingNames.has(role.name))

  if (toInsert.length > 0) {
    const { error: insertError } = await supabase.from('roles').insert(toInsert)
    if (insertError) {
      console.error('RBAC seed roles insert error:', insertError.message)
    }
  }
}

export const getUserRoles = async (userId) => {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role:roles(name)')
    .eq('user_id', userId)

  if (error) {
    console.error('RBAC getUserRoles error:', error.message)
    return []
  }

  return (data || [])
    .map((row) => row.role?.name)
    .filter(Boolean)
}

const ensureRoleAssignment = async (userId, roleName) => {
  const { data: role, error } = await supabase
    .from('roles')
    .select('id, name')
    .eq('name', roleName)
    .single()

  if (error || !role) {
    console.error('RBAC role lookup error:', error?.message || 'Role not found')
    return
  }

  const { error: upsertError } = await supabase
    .from('user_roles')
    .upsert({ user_id: userId, role_id: role.id }, { onConflict: 'user_id,role_id' })

  if (upsertError) {
    console.error('RBAC role assignment error:', upsertError.message)
  }
}

let rolesSeeded = false

export const ensureBootstrapRoles = async () => {
  if (rolesSeeded) return
  await seedRoles()
  rolesSeeded = true
}

export const hasAnyRole = (userRoles, requiredRoles = []) => {
  if (!Array.isArray(userRoles)) return false
  if (userRoles.includes('super_admin')) return true
  return requiredRoles.some((role) => userRoles.includes(role))
}

export const ADMIN_BASE_ROLES = [
  'admin',
  'super_admin',
  'admin_manager',
  'product_manager',
  'order_manager',
  'support_agent',
  'marketing_manager',
]
