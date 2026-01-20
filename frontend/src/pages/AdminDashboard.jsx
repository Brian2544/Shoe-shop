import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import api from '../services/api'
import { formatCurrency } from '../lib/currency'
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  LogOut,
  Edit,
  Trash2,
  ShieldCheck,
  ClipboardList,
  UserPlus,
} from 'lucide-react'

const AdminDashboard = () => {
  const [user, setUser] = useState(null)
  const [roles, setRoles] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0,
  })
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [usersList, setUsersList] = useState([])
  const [auditLogs, setAuditLogs] = useState([])
  const [availableRoles, setAvailableRoles] = useState([])
  const [selectedUserOrders, setSelectedUserOrders] = useState([])
  const [selectedUserEmail, setSelectedUserEmail] = useState('')
  const [isLoadingUserOrders, setIsLoadingUserOrders] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [isSaving, setIsSaving] = useState(false)
  const [productForm, setProductForm] = useState({
    id: '',
    name: '',
    brand: '',
    price: '',
    stock_quantity: '',
    status: 'active',
    category_id: '',
    description: '',
  })
  const [categoryForm, setCategoryForm] = useState({ name: '', slug: '' })
  const navigate = useNavigate()

  const can = useMemo(() => {
    return (requiredRoles) => {
      if (roles.includes('super_admin')) return true
      return requiredRoles.some((role) => roles.includes(role))
    }
  }, [roles])

  useEffect(() => {
    loadAdminSession()
  }, [])

  const loadAdminSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        navigate('/login')
        return
      }

      const response = await api.get('/admin/me')
      if (!response.data?.success) {
        toast.error('Access denied. Admin privileges required.')
        navigate('/')
        return
      }

      const fetchedRoles = response.data.data.roles || []
      setUser({ id: response.data.data.user.id, email: response.data.data.user.email })
      setRoles(fetchedRoles)
      await loadDashboardData(fetchedRoles)
      setIsLoading(false)
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error loading admin session:', error)
      }
      toast.error(error.response?.data?.message || 'Failed to load admin session')
      navigate('/')
    }
  }

  const loadDashboardData = async (currentRoles = roles) => {
    try {
      const canRole = (requiredRoles) => {
        if (currentRoles.includes('super_admin')) return true
        return requiredRoles.some((role) => currentRoles.includes(role))
      }

      const dashboardRes = await api.get('/admin/dashboard')
      if (import.meta.env.DEV) {
        console.log('Admin dashboard response:', dashboardRes.status, dashboardRes.data)
      }
      if (dashboardRes.data.success) {
        setStats(dashboardRes.data.data.stats)
        setOrders(dashboardRes.data.data.recentOrders || [])
        setTopProducts(dashboardRes.data.data.topProducts || [])
      }

      if (canRole(['super_admin', 'admin_manager', 'product_manager'])) {
        const productsRes = await api.get('/admin/products')
        setProducts(productsRes.data.data || [])
      }

      if (canRole(['super_admin', 'admin_manager', 'order_manager', 'support_agent'])) {
        const ordersRes = await api.get('/admin/orders')
        setOrders(ordersRes.data.data || [])
      }

      if (canRole(['super_admin', 'admin_manager', 'product_manager'])) {
        const categoriesRes = await api.get('/admin/categories')
        setCategories(categoriesRes.data.data || [])
      }

      if (canRole(['super_admin', 'admin_manager', 'support_agent'])) {
        const usersRes = await api.get('/admin/users')
        setUsersList(usersRes.data.data || [])
      }

      if (canRole(['super_admin'])) {
        const rolesRes = await api.get('/admin/roles')
        setAvailableRoles(rolesRes.data.data || [])
      }

      if (canRole(['super_admin', 'admin_manager'])) {
        const logsRes = await api.get('/admin/audit-logs')
        setAuditLogs(logsRes.data.data || [])
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error loading dashboard:', error)
      }
      if (import.meta.env.DEV) {
        console.log('Admin dashboard error details:', {
          url: error.config?.url,
          status: error.response?.status,
          response: error.response?.data,
        })
      }
      toast.error(error.response?.data?.message || 'Failed to load dashboard data')
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/admin/login')
  }

  const handleProductSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      if (!productForm.name.trim()) {
        toast.error('Product name is required')
        return
      }
      if (!productForm.price || Number.isNaN(Number(productForm.price)) || Number(productForm.price) <= 0) {
        toast.error('Valid price is required')
        return
      }
      if (productForm.description && productForm.description.length > 1000) {
        toast.error('Description is long (over 1000 characters). Consider shortening it.')
      }

      const payload = {
        name: productForm.name.trim(),
        brand: productForm.brand?.trim() || null,
        price: parseFloat(productForm.price),
        stock_quantity: productForm.stock_quantity === '' ? 0 : parseInt(productForm.stock_quantity || 0, 10),
        status: productForm.status,
        category_id: productForm.category_id || null,
        description: productForm.description?.trim() || null,
      }

      if (productForm.id) {
        const res = await api.patch(`/admin/products/${productForm.id}`, payload)
        if (res.data.success) {
          toast.success('Product updated')
        }
      } else {
        const res = await api.post('/admin/products', payload)
        if (res.data.success) {
          toast.success('Product created')
        }
      }

      setProductForm({ id: '', name: '', brand: '', price: '', stock_quantity: '', status: 'active', category_id: '', description: '' })
      await loadDashboardData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save product')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteProduct = async (productId) => {
    if (!confirm('Archive this product?')) return

    try {
      const res = await api.delete(`/admin/products/${productId}`)
      if (res.data.success) {
        toast.success('Product archived')
        await loadDashboardData()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to archive product')
    }
  }

  const handleCategorySubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const res = await api.post('/admin/categories', categoryForm)
      if (res.data.success) {
        toast.success('Category created')
        setCategoryForm({ name: '', slug: '' })
        await loadDashboardData()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create category')
    } finally {
      setIsSaving(false)
    }
  }

  const handleOrderStatusUpdate = async (orderId, status) => {
    try {
      const res = await api.patch(`/admin/orders/${orderId}`, { status })
      if (res.data.success) {
        toast.success('Order updated')
        await loadDashboardData()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update order')
    }
  }

  const handleRoleToggle = (userId, roleName) => {
    setUsersList((prev) =>
      prev.map((userItem) => {
        if (userItem.id !== userId) return userItem
        const rolesSet = new Set(userItem.roles || [])
        if (rolesSet.has(roleName)) {
          rolesSet.delete(roleName)
        } else {
          rolesSet.add(roleName)
        }
        return { ...userItem, roles: Array.from(rolesSet) }
      })
    )
  }

  const handleViewUserOrders = async (userItem) => {
    setIsLoadingUserOrders(true)
    setSelectedUserEmail(userItem.email)
    try {
      const response = await api.get(`/admin/users/${userItem.id}/orders`)
      setSelectedUserOrders(response.data.data || [])
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load user orders')
    } finally {
      setIsLoadingUserOrders(false)
    }
  }

  const handleSaveRoles = async (userId, rolesToSave) => {
    try {
      const res = await api.put(`/admin/users/${userId}/roles`, { roles: rolesToSave })
      if (res.data.success) {
        toast.success('Roles updated')
        await loadDashboardData()
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update roles')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', label: 'Overview', visible: true },
    { id: 'orders', label: 'Orders', visible: can(['super_admin', 'admin_manager', 'order_manager', 'support_agent']) },
    { id: 'products', label: 'Products', visible: can(['super_admin', 'admin_manager', 'product_manager']) },
    { id: 'categories', label: 'Categories', visible: can(['super_admin', 'admin_manager', 'product_manager']) },
    { id: 'users', label: 'Customers', visible: can(['super_admin', 'admin_manager', 'support_agent']) },
    { id: 'admins', label: 'Admins & Roles', visible: can(['super_admin']) },
    { id: 'audit', label: 'Audit Log', visible: can(['super_admin', 'admin_manager']) },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome back, {user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Products</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalProducts}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex flex-wrap -mb-px">
              {tabs.filter((tab) => tab.visible).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 text-sm font-medium border-b-2 ${
                    activeTab === tab.id
                      ? 'border-primary-orange text-primary-orange'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6 space-y-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold mb-4">Recent Orders</h3>
                  {orders.length === 0 ? (
                    <p className="text-gray-500">No orders yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {orders.slice(0, 5).map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                          <div>
                            <p className="font-medium text-sm">Order #{order.id.substring(0, 8)}</p>
                            <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                          </div>
                          <p className="font-semibold">{formatCurrency(order.total || 0)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold mb-4">Top Products</h3>
                  {topProducts.length === 0 ? (
                    <p className="text-gray-500">No products yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {topProducts.slice(0, 5).map((product) => (
                        <div key={product.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                          <div>
                            <p className="font-medium text-sm">{product.name}</p>
                            <p className="text-xs text-gray-500">{product.brand}</p>
                          </div>
                          <p className="font-semibold">{formatCurrency(product.price || 0)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div>
                <h2 className="text-xl font-bold mb-4">Orders</h2>
                {orders.length === 0 ? (
                  <p className="text-gray-500">No orders available.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {orders.map((order) => (
                          <tr key={order.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              #{order.id.substring(0, 8)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatCurrency(order.total || 0)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <select
                                value={order.status || 'pending'}
                                onChange={(e) => handleOrderStatusUpdate(order.id, e.target.value)}
                                className="input-field w-40"
                              >
                                <option value="pending">Pending</option>
                                <option value="paid">Paid</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(order.created_at).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Products Tab */}
            {activeTab === 'products' && (
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h2 className="text-lg font-semibold mb-4">{productForm.id ? 'Edit Product' : 'Add Product'}</h2>
                  <form onSubmit={handleProductSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <input
                      type="text"
                      value={productForm.name}
                      onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                      placeholder="Name"
                      className="input-field md:col-span-2"
                      required
                    />
                    <input
                      type="text"
                      value={productForm.brand}
                      onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                      placeholder="Brand"
                      className="input-field"
                    />
                    <input
                      type="number"
                      step="0.01"
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      placeholder="Price"
                      className="input-field"
                      required
                    />
                    <input
                      type="number"
                      value={productForm.stock_quantity}
                      onChange={(e) => setProductForm({ ...productForm, stock_quantity: e.target.value })}
                      placeholder="Stock"
                      className="input-field"
                    />
                    <select
                      value={productForm.status}
                      onChange={(e) => setProductForm({ ...productForm, status: e.target.value })}
                      className="input-field"
                    >
                      <option value="active">Active</option>
                      <option value="draft">Draft</option>
                      <option value="archived">Archived</option>
                    </select>
                    <select
                      value={productForm.category_id}
                      onChange={(e) => setProductForm({ ...productForm, category_id: e.target.value })}
                      className="input-field md:col-span-2"
                    >
                      <option value="">Select category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    <textarea
                      value={productForm.description}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                      placeholder="Product description (optional)"
                      className="input-field md:col-span-6 min-h-[120px]"
                    />
                    <div className="md:col-span-6 flex gap-3">
                      <button type="submit" className="btn-primary" disabled={isSaving}>
                        {isSaving ? 'Saving...' : productForm.id ? 'Update' : 'Create'}
                      </button>
                      {productForm.id && (
                        <button
                          type="button"
                          onClick={() => setProductForm({ id: '', name: '', brand: '', price: '', stock_quantity: '', status: 'active', category_id: '', description: '' })}
                          className="btn-outline"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Brand</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {products.map((product) => (
                        <tr key={product.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {product.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {product.brand}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(product.price || 0)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {product.stock_quantity || 0}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {product.status || 'active'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setProductForm({
                                  id: product.id,
                                  name: product.name || '',
                                  brand: product.brand || '',
                                  price: product.price || '',
                                  stock_quantity: product.stock_quantity || '',
                                  status: product.status || 'active',
                                  category_id: product.category_id || '',
                                  description: product.description || '',
                                })}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => navigate(`/admin/products/${product.id}`)}
                                className="text-gray-600 hover:text-gray-900"
                              >
                                <ShieldCheck className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Categories Tab */}
            {activeTab === 'categories' && (
              <div className="space-y-6">
                <form onSubmit={handleCategorySubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input
                    type="text"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    placeholder="Category name"
                    className="input-field"
                    required
                  />
                  <input
                    type="text"
                    value={categoryForm.slug}
                    onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                    placeholder="Slug"
                    className="input-field"
                    required
                  />
                  <button type="submit" className="btn-primary" disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Add Category'}
                  </button>
                </form>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {categories.map((category) => (
                        <tr key={category.id}>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{category.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-500">{category.slug}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div>
                <h2 className="text-xl font-bold mb-4">Customers</h2>
                {usersList.length === 0 ? (
                  <p className="text-gray-500">No users found.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roles</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {usersList.map((userItem) => (
                          <tr key={userItem.id}>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{userItem.email}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">{(userItem.roles || []).join(', ') || 'Customer'}</td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {userItem.created_at ? new Date(userItem.created_at).toLocaleDateString() : '-'}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <button
                                onClick={() => handleViewUserOrders(userItem)}
                                className="text-primary-orange hover:underline"
                              >
                                View Orders
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <div className="mt-6 bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">Order History</h3>
                    {selectedUserEmail && (
                      <span className="text-xs text-gray-500">User: {selectedUserEmail}</span>
                    )}
                  </div>
                  {isLoadingUserOrders ? (
                    <p className="text-gray-500">Loading orders...</p>
                  ) : selectedUserOrders.length === 0 ? (
                    <p className="text-gray-500">Select a user to view orders.</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedUserOrders.map((order) => (
                        <div key={order.id} className="flex items-center justify-between bg-white p-3 rounded-lg">
                          <span className="text-sm font-medium">#{order.id.substring(0, 8)}</span>
                          <span className="text-sm text-gray-600">{order.status}</span>
                          <span className="text-sm font-semibold">{formatCurrency(order.total || 0)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Admins & Roles Tab */}
            {activeTab === 'admins' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <UserPlus className="w-4 h-4" />
                  Assign roles to existing users to grant admin access.
                </div>
                {usersList.length === 0 ? (
                  <p className="text-gray-500">No users available.</p>
                ) : (
                  <div className="space-y-4">
                    {usersList.map((userItem) => (
                      <div key={userItem.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                          <div>
                            <p className="font-semibold">{userItem.email}</p>
                            <p className="text-xs text-gray-500">User ID: {userItem.id}</p>
                          </div>
                          <button
                            onClick={() => handleSaveRoles(userItem.id, userItem.roles || [])}
                            className="btn-primary"
                          >
                            Save Roles
                          </button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-4">
                          {availableRoles.map((role) => (
                            <label key={role.id} className="flex items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                checked={(userItem.roles || []).includes(role.name)}
                                onChange={() => handleRoleToggle(userItem.id, role.name)}
                              />
                              {role.name}
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Audit Log Tab */}
            {activeTab === 'audit' && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <ClipboardList className="w-5 h-5" />
                  <h2 className="text-xl font-bold">Audit Log</h2>
                </div>
                {auditLogs.length === 0 ? (
                  <p className="text-gray-500">No audit logs yet.</p>
                ) : (
                  <div className="space-y-3">
                    {auditLogs.map((log) => (
                      <div key={log.id} className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm font-semibold">{log.action}</p>
                        <p className="text-xs text-gray-500">
                          {log.entity} {log.entity_id || ''} • {new Date(log.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
