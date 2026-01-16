import { useState } from 'react'
import { useStore } from '../store/store'
import { useQuery } from 'react-query'
import { supabase } from '../lib/supabase'
import { User, Package, Heart, MapPin, CreditCard } from 'lucide-react'
import toast from 'react-hot-toast'

const Profile = () => {
  const { user } = useStore()
  const [activeTab, setActiveTab] = useState('profile')

  const { data: profile } = useQuery(
    ['profile', user?.id],
    async () => {
      if (!user) return null
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      if (error) throw error
      return data
    },
    { enabled: !!user }
  )

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please login to view your profile</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">My Account</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-primary-orange rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {profile?.first_name?.[0] || user.email?.[0] || 'U'}
                </div>
                <div>
                  <p className="font-semibold">
                    {profile?.first_name && profile?.last_name
                      ? `${profile.first_name} ${profile.last_name}`
                      : user.email}
                  </p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
              </div>

              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    activeTab === 'profile'
                      ? 'bg-primary-orange text-white'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span>Profile</span>
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    activeTab === 'orders'
                      ? 'bg-primary-orange text-white'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <Package className="w-5 h-5" />
                  <span>Orders</span>
                </button>
                <button
                  onClick={() => setActiveTab('wishlist')}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    activeTab === 'wishlist'
                      ? 'bg-primary-orange text-white'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <Heart className="w-5 h-5" />
                  <span>Wishlist</span>
                </button>
                <button
                  onClick={() => setActiveTab('addresses')}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    activeTab === 'addresses'
                      ? 'bg-primary-orange text-white'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <MapPin className="w-5 h-5" />
                  <span>Addresses</span>
                </button>
                <button
                  onClick={() => setActiveTab('payment')}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    activeTab === 'payment'
                      ? 'bg-primary-orange text-white'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  <span>Payment Methods</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Profile Information</h2>
                  <p className="text-gray-600">Profile management coming soon...</p>
                </div>
              )}
              {activeTab === 'orders' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Order History</h2>
                  <p className="text-gray-600">Order history coming soon...</p>
                </div>
              )}
              {activeTab === 'wishlist' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Wishlist</h2>
                  <p className="text-gray-600">Wishlist management coming soon...</p>
                </div>
              )}
              {activeTab === 'addresses' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Saved Addresses</h2>
                  <p className="text-gray-600">Address management coming soon...</p>
                </div>
              )}
              {activeTab === 'payment' && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Payment Methods</h2>
                  <p className="text-gray-600">Payment methods coming soon...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
