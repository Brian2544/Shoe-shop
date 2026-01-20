import express from 'express'
import { supabase } from '../config/supabase.js'
import { requireRoles } from '../middleware/auth.js'
import { ADMIN_BASE_ROLES } from '../lib/rbac.js'
import { getCloudinary } from '../config/cloudinary.js'

const router = express.Router()

const ROLE_PRODUCTS = ['super_admin', 'admin_manager', 'product_manager']
const ROLE_ORDERS = ['super_admin', 'admin_manager', 'order_manager', 'support_agent']
const ROLE_USERS = ['super_admin', 'admin_manager', 'support_agent']
const ROLE_AUDIT = ['super_admin', 'admin_manager']
const ROLE_ADMIN_MANAGEMENT = ['super_admin']

const logAdminAction = async (req, action, entity, entityId, meta = {}) => {
  try {
    await supabase.from('admin_audit_logs').insert({
      actor_user_id: req.user?.id || null,
      action,
      entity,
      entity_id: entityId || null,
      meta_json: meta,
    })
  } catch (error) {
    console.warn('Admin audit log failed:', error.message)
  }
}

router.get('/me', requireRoles(ADMIN_BASE_ROLES), async (req, res) => {
  res.json({
    success: true,
    data: {
      user: {
        id: req.user.id,
        email: req.user.email,
      },
      roles: req.user.roles || [],
    },
  })
})

// Dashboard stats
router.get('/dashboard', requireRoles(ADMIN_BASE_ROLES), async (req, res) => {
  const safeCount = async (table, filter) => {
    const query = supabase.from(table).select('id', { count: 'exact', head: true })
    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        query.neq(key, value)
      })
    }
    const { count, error } = await query
    if (error) {
      return 0
    }
    return count || 0
  }

  const safeSelect = async (table, fields = '*', options = {}) => {
    let query = supabase.from(table).select(fields)
    if (options.order) {
      const [column, direction] = options.order.split('.')
      query = query.order(column, { ascending: direction !== 'desc' })
    }
    if (options.limit) {
      query = query.limit(options.limit)
    }
    const { data, error } = await query
    if (error) {
      return []
    }
    return data || []
  }

  try {
    const [productsCount, ordersCount, usersCount] = await Promise.all([
      safeCount('products', { status: 'archived' }),
      safeCount('orders'),
      safeCount('profiles'),
    ])

    const revenueRows = await safeSelect('orders', 'total')
    const totalRevenue = revenueRows.reduce((sum, row) => sum + parseFloat(row.total || 0), 0)

    const recentOrders = await safeSelect('orders', '*', { order: 'created_at.desc', limit: 10 })
    const topProducts = await safeSelect('products', '*', { order: 'sales_count.desc', limit: 5 })

    res.json({
      success: true,
      data: {
        stats: {
          totalProducts: productsCount,
          totalOrders: ordersCount,
          totalUsers: usersCount,
          totalRevenue,
        },
        recentOrders,
        topProducts,
      },
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// Get all orders (admin)
router.get('/orders', requireRoles(ROLE_ORDERS), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    res.json({ success: true, data: data || [] })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// Update order (admin)
router.patch('/orders/:id', requireRoles(ROLE_ORDERS), async (req, res) => {
  try {
    const { status, payment_status, tracking_number } = req.body || {}

    const { data, error } = await supabase
      .from('orders')
      .update({
        status,
        payment_status,
        tracking_number,
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .select()
      .single()

    if (error) throw error

    await logAdminAction(req, 'order_updated', 'order', req.params.id, {
      status,
      payment_status,
      tracking_number,
    })

    res.json({ success: true, data })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// List products (admin)
router.get('/products', requireRoles(ROLE_PRODUCTS), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    res.json({ success: true, data: data || [] })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// Create product (admin)
router.post('/products', requireRoles(ROLE_PRODUCTS), async (req, res) => {
  try {
    const {
      name,
      brand,
      price,
      stock_quantity,
      category_id,
      status,
      description,
    } = req.body || {}

    if (!name || typeof name !== 'string') {
      return res.status(400).json({ success: false, message: 'Product name is required' })
    }

    const parsedPrice = Number(price)
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      return res.status(400).json({ success: false, message: 'Valid price is required' })
    }

    const parsedStock = Number.isFinite(Number(stock_quantity))
      ? Math.max(0, parseInt(stock_quantity, 10))
      : undefined

    const payload = {
      name: name.trim(),
      brand: brand?.trim() || null,
      price: parsedPrice,
      stock_quantity: parsedStock,
      category_id: category_id || null,
      status: status || 'active',
      currency_code: 'KES',
      description: description?.trim() || null,
    }

    const { data, error } = await supabase
      .from('products')
      .insert(payload)
      .select()
      .single()

    if (error) throw error

    await logAdminAction(req, 'product_created', 'product', data.id, payload)
    res.json({ success: true, data })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// Update product (admin)
router.patch('/products/:id', requireRoles(ROLE_PRODUCTS), async (req, res) => {
  try {
    const {
      name,
      brand,
      price,
      stock_quantity,
      category_id,
      status,
      description,
    } = req.body || {}

    const updates = {}
    if (name !== undefined) {
      if (!name || typeof name !== 'string') {
        return res.status(400).json({ success: false, message: 'Product name is required' })
      }
      updates.name = name.trim()
    }
    if (brand !== undefined) {
      updates.brand = brand?.trim() || null
    }
    if (price !== undefined) {
      const parsedPrice = Number(price)
      if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
        return res.status(400).json({ success: false, message: 'Valid price is required' })
      }
      updates.price = parsedPrice
    }
    if (stock_quantity !== undefined) {
      const parsedStock = Number(stock_quantity)
      updates.stock_quantity = Number.isFinite(parsedStock) ? Math.max(0, parseInt(parsedStock, 10)) : 0
    }
    if (category_id !== undefined) {
      updates.category_id = category_id || null
    }
    if (status !== undefined) {
      updates.status = status || 'active'
    }
    if (description !== undefined) {
      updates.description = description?.trim() || null
    }
    if (updates.price !== undefined) {
      updates.currency_code = 'KES'
    }

    const { data, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', req.params.id)
      .select()
      .single()

    if (error) throw error

    await logAdminAction(req, 'product_updated', 'product', req.params.id, req.body)
    res.json({ success: true, data })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// Add product image metadata (admin)
router.post('/products/:id/images', requireRoles(ROLE_PRODUCTS), async (req, res) => {
  try {
    const {
      url,
      public_id,
      width = null,
      height = null,
      format = null,
      alt_text = null,
      position = 0,
    } = req.body || {}

    if (!url || !public_id) {
      return res.status(400).json({
        success: false,
        message: 'Image url and public_id are required',
      })
    }

    const payload = {
      product_id: req.params.id,
      url,
      public_id,
      width,
      height,
      format,
      alt_text,
      position,
    }

    const { data, error } = await supabase
      .from('product_images')
      .insert(payload)
      .select()
      .single()

    if (error) throw error

    try {
      const { data: product } = await supabase
        .from('products')
        .select('images')
        .eq('id', req.params.id)
        .single()

      const existing = Array.isArray(product?.images) ? product.images : []
      if (!existing.includes(url)) {
        await supabase
          .from('products')
          .update({ images: [...existing, url] })
          .eq('id', req.params.id)
      }
    } catch (syncError) {
      console.warn('Product image sync failed:', syncError.message)
    }

    await logAdminAction(req, 'product_image_added', 'product_image', data.id, payload)
    res.json({ success: true, data })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// Delete product image (admin)
router.delete('/products/:id/images/:imageId', requireRoles(ROLE_PRODUCTS), async (req, res) => {
  try {
    const { data: image, error: fetchError } = await supabase
      .from('product_images')
      .select('*')
      .eq('id', req.params.imageId)
      .eq('product_id', req.params.id)
      .single()

    if (fetchError || !image) {
      return res.status(404).json({ success: false, message: 'Image not found' })
    }

    const cloudinary = getCloudinary()
    if (cloudinary) {
      const deleteResult = await cloudinary.uploader.destroy(image.public_id, {
        invalidate: true,
      })

      if (deleteResult?.result !== 'ok' && deleteResult?.result !== 'not found') {
        return res.status(500).json({
          success: false,
          message: 'Failed to delete image from Cloudinary',
        })
      }
    }

    const { error: deleteError } = await supabase
      .from('product_images')
      .delete()
      .eq('id', req.params.imageId)

    if (deleteError) throw deleteError

    try {
      const { data: product } = await supabase
        .from('products')
        .select('images')
        .eq('id', req.params.id)
        .single()

      const existing = Array.isArray(product?.images) ? product.images : []
      if (existing.length > 0) {
        const nextImages = existing.filter((imageUrl) => imageUrl !== image.url)
        await supabase
          .from('products')
          .update({ images: nextImages })
          .eq('id', req.params.id)
      }
    } catch (syncError) {
      console.warn('Product image cleanup failed:', syncError.message)
    }

    await logAdminAction(req, 'product_image_deleted', 'product_image', req.params.imageId, { public_id: image.public_id })
    res.json({
      success: true,
      message: cloudinary ? 'Image deleted' : 'Image deleted (Cloudinary not configured)',
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// Delete product (admin)
router.delete('/products/:id', requireRoles(ROLE_PRODUCTS), async (req, res) => {
  try {
    const hardDelete = req.query.hard === 'true'

    if (hardDelete) {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', req.params.id)

      if (error) throw error

      await logAdminAction(req, 'product_deleted', 'product', req.params.id, { hardDelete: true })
      return res.json({ success: true, message: 'Product deleted' })
    }

    const { data, error } = await supabase
      .from('products')
      .update({ status: 'archived' })
      .eq('id', req.params.id)
      .select()
      .single()

    if (error) throw error

    await logAdminAction(req, 'product_archived', 'product', req.params.id, { status: 'archived' })
    res.json({ success: true, message: 'Product archived', data })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// Categories
router.get('/categories', requireRoles(ROLE_PRODUCTS), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true })

    if (error) throw error

    res.json({ success: true, data: data || [] })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

router.post('/categories', requireRoles(ROLE_PRODUCTS), async (req, res) => {
  try {
    const { name, slug } = req.body || {}
    if (!name || !slug) {
      return res.status(400).json({ success: false, message: 'Name and slug are required' })
    }

    const { data, error } = await supabase
      .from('categories')
      .insert({ name, slug })
      .select()
      .single()

    if (error) throw error

    await logAdminAction(req, 'category_created', 'category', data.id, { name, slug })
    res.json({ success: true, data })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

router.patch('/categories/:id', requireRoles(ROLE_PRODUCTS), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single()

    if (error) throw error

    await logAdminAction(req, 'category_updated', 'category', req.params.id, req.body)
    res.json({ success: true, data })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

router.delete('/categories/:id', requireRoles(ROLE_PRODUCTS), async (req, res) => {
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', req.params.id)

    if (error) throw error

    await logAdminAction(req, 'category_deleted', 'category', req.params.id)
    res.json({ success: true, message: 'Category deleted' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// Users + roles
router.get('/users', requireRoles(ROLE_USERS), async (req, res) => {
  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name, role, created_at')
      .order('created_at', { ascending: false })

    if (error) throw error

    let rolesMap = {}
    const { data: rolesData, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id, role:roles(name)')

    if (!rolesError) {
      rolesMap = (rolesData || []).reduce((acc, row) => {
        if (!acc[row.user_id]) acc[row.user_id] = []
        if (row.role?.name) acc[row.user_id].push(row.role.name)
        return acc
      }, {})
    }

    const users = (profiles || []).map((profile) => ({
      ...profile,
      roles: rolesMap[profile.id] || (profile.role ? [profile.role === 'admin' ? 'admin_manager' : profile.role] : []),
    }))

    res.json({ success: true, data: users })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

router.get('/users/:id/orders', requireRoles(ROLE_USERS), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', req.params.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    res.json({ success: true, data: data || [] })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

router.get('/roles', requireRoles(ROLE_ADMIN_MANAGEMENT), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      return res.json({
        success: true,
        data: [
          { id: 'fallback-super', name: 'super_admin', description: 'Full system access' },
          { id: 'fallback-admin', name: 'admin_manager', description: 'Manage admins and roles' },
          { id: 'fallback-product', name: 'product_manager', description: 'Manage products and categories' },
          { id: 'fallback-order', name: 'order_manager', description: 'Manage orders and fulfillment' },
          { id: 'fallback-support', name: 'support_agent', description: 'View customers and orders' },
          { id: 'fallback-marketing', name: 'marketing_manager', description: 'Manage promotions and featured products' },
        ],
      })
    }

    res.json({ success: true, data: data || [] })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

router.put('/users/:id/roles', requireRoles(ROLE_ADMIN_MANAGEMENT), async (req, res) => {
  try {
    const { roles = [] } = req.body || {}
    const targetUserId = req.params.id

    if (!Array.isArray(roles)) {
      return res.status(400).json({ success: false, message: 'Roles must be an array' })
    }

    if (targetUserId === req.user.id && !roles.includes('super_admin')) {
      return res.status(400).json({ success: false, message: 'Super admin cannot remove own super_admin role' })
    }

    const { data: roleRows, error: roleError } = await supabase
      .from('roles')
      .select('id, name')
      .in('name', roles)

    if (roleError) {
      const fallbackRole = roles.includes('super_admin') ? 'super_admin' : roles.length > 0 ? 'admin' : 'user'
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ role: fallbackRole })
        .eq('id', targetUserId)

      if (profileError) throw profileError

      await logAdminAction(req, 'roles_updated', 'user', targetUserId, { roles, fallback: true })
      return res.json({ success: true, message: 'Roles updated (fallback)' })
    }

    const roleIds = (roleRows || []).map((role) => role.id)

    await supabase.from('user_roles').delete().eq('user_id', targetUserId)

    if (roleIds.length > 0) {
      const inserts = roleIds.map((roleId) => ({ user_id: targetUserId, role_id: roleId }))
      const { error: insertError } = await supabase.from('user_roles').insert(inserts)
      if (insertError) throw insertError
    }

    await logAdminAction(req, 'roles_updated', 'user', targetUserId, { roles })
    res.json({ success: true, message: 'Roles updated' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// Audit logs
router.get('/audit-logs', requireRoles(ROLE_AUDIT), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('admin_audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      return res.json({ success: true, data: [] })
    }

    res.json({ success: true, data: data || [] })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

export default router
