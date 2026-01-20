import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'
import AdminRoute from './components/AdminRoute'
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import Wishlist from './pages/Wishlist'
import Compare from './pages/Compare'
import OrderTracking from './pages/OrderTracking'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import AdminProductEdit from './pages/AdminProductEdit'
import Debug from './pages/Debug'
import NotFound from './pages/NotFound'
import InfoPage from './pages/InfoPage'
import { Toaster } from 'react-hot-toast'

function App() {
  if (import.meta.env.DEV) {
    console.log('📱 App component rendering...')
  }
  
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff' }}>
      <Toaster position="top-right" />
      <Header />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/order-tracking" element={<OrderTracking />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route 
            path="/admin/dashboard" 
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/products/:id" 
            element={
              <AdminRoute>
                <AdminProductEdit />
              </AdminRoute>
            } 
          />
          <Route path="/terms" element={<InfoPage />} />
          <Route path="/privacy" element={<InfoPage />} />
          <Route path="/cookies" element={<InfoPage />} />
          <Route path="/returns" element={<InfoPage />} />
          <Route path="/shipping" element={<InfoPage />} />
          <Route path="/forgot-password" element={<InfoPage />} />
          <Route path="/size-guide" element={<InfoPage />} />
          <Route path="/debug" element={<Debug />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
