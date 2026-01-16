import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useStore } from '../../store/store'
import { supabase } from '../../lib/supabase'
import { 
  ShoppingCart, 
  Heart, 
  User, 
  Search, 
  Menu, 
  X,
  GitCompareArrows
} from 'lucide-react'

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Safely get store values with fallbacks
  let store
  try {
    store = useStore()
  } catch (error) {
    console.warn('Error accessing store:', error)
    store = { cart: [], wishlist: [], compareList: [], user: null }
  }
  
  const cart = store?.cart || []
  const wishlist = store?.wishlist || []
  const compareList = store?.compareList || []
  const user = store?.user || null
  
  const navigate = useNavigate()

  const cartCount = cart ? cart.reduce((sum, item) => sum + (item.quantity || 0), 0) : 0
  const wishlistCount = wishlist ? wishlist.length : 0
  const compareCount = compareList ? compareList.length : 0

  const handleLogout = async () => {
    try {
      if (supabase && supabase.auth) {
        await supabase.auth.signOut()
      }
      navigate('/')
    } catch (error) {
      console.error('Logout error:', error)
      navigate('/')
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`)
      setSearchQuery('')
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="container mx-auto px-4">
        {/* Top Bar */}
        <div className="hidden md:flex items-center justify-between py-2 text-sm text-gray-600 border-b">
          <div className="flex items-center gap-4">
            <span>Free shipping on orders over $100</span>
            <span>•</span>
            <span>30-day return policy</span>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link to="/profile" className="hover:text-primary-orange">My Account</Link>
                <button onClick={handleLogout} className="hover:text-primary-orange">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-primary-orange">Login</Link>
                <Link to="/register" className="hover:text-primary-orange">Register</Link>
              </>
            )}
          </div>
        </div>

        {/* Main Header */}
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary-orange rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <span className="text-2xl font-bold text-gray-900">ShoeStore</span>
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-2xl mx-8">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for shoes, brands, colors..."
                className="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-orange"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
          </form>

          {/* Right Icons */}
          <div className="flex items-center gap-4">
            {/* Search Icon - Mobile */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 hover:text-primary-orange"
            >
              <Search className="w-6 h-6" />
            </button>

            {/* Compare */}
            <Link to="/compare" className="relative p-2 hover:text-primary-orange transition-colors">
              <GitCompareArrows className="w-6 h-6" />
              {compareCount > 0 && (
                <span className="absolute top-0 right-0 bg-secondary-green text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {compareCount}
                </span>
              )}
            </Link>

            {/* Wishlist */}
            <Link to="/wishlist" className="relative p-2 hover:text-primary-orange transition-colors">
              <Heart className="w-6 h-6" />
              {wishlistCount > 0 && (
                <span className="absolute top-0 right-0 bg-secondary-green text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link to="/cart" className="relative p-2 hover:text-primary-orange transition-colors">
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-primary-orange text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User */}
            <Link to={user ? "/profile" : "/login"} className="p-2 hover:text-primary-orange transition-colors">
              <User className="w-6 h-6" />
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 hover:text-primary-orange"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        {isMenuOpen && (
          <div className="lg:hidden pb-4">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for shoes..."
                className="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-orange"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </form>
          </div>
        )}

        {/* Navigation */}
        <nav className="hidden lg:flex items-center gap-6 py-4 border-t">
          <Link to="/products" className="text-gray-700 hover:text-primary-orange font-medium transition-colors">
            All Products
          </Link>
          <Link to="/products?gender=male" className="text-gray-700 hover:text-primary-orange font-medium transition-colors">
            Men's
          </Link>
          <Link to="/products?gender=female" className="text-gray-700 hover:text-primary-orange font-medium transition-colors">
            Women's
          </Link>
          <Link to="/products?gender=kids" className="text-gray-700 hover:text-primary-orange font-medium transition-colors">
            Kids
          </Link>
          <Link to="/products?shoeType=sneakers" className="text-gray-700 hover:text-primary-orange font-medium transition-colors">
            Sneakers
          </Link>
          <Link to="/products?shoeType=boots" className="text-gray-700 hover:text-primary-orange font-medium transition-colors">
            Boots
          </Link>
          <Link to="/products?shoeType=sandals" className="text-gray-700 hover:text-primary-orange font-medium transition-colors">
            Sandals
          </Link>
        </nav>
      </div>
    </header>
  )
}

export default Header
