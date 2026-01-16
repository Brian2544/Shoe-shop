import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Truck, Shield, HeadphonesIcon, Star, TrendingUp } from 'lucide-react'

const Home = () => {
  console.log('🏠 Home component rendering...')
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [loading, setLoading] = useState(false)

  const features = [
    {
      icon: Truck,
      title: 'Free Shipping',
      description: 'On orders over $100',
      color: 'bg-primary-orange'
    },
    {
      icon: Shield,
      title: 'Secure Payment',
      description: '100% secure checkout',
      color: 'bg-secondary-green'
    },
    {
      icon: HeadphonesIcon,
      title: '24/7 Support',
      description: 'Always here to help',
      color: 'bg-primary-orange'
    },
    {
      icon: Star,
      title: 'Quality Guarantee',
      description: 'Premium quality products',
      color: 'bg-secondary-green'
    },
  ]

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>
      {/* Hero Section */}
      <section style={{ 
        backgroundColor: '#FF6B35', 
        color: '#ffffff', 
        padding: '80px 20px', 
        minHeight: '300px' 
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
          <div style={{ maxWidth: '600px' }}>
            <h1 style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '24px', color: '#ffffff' }}>
              Step Into Style
            </h1>
            <p style={{ fontSize: '24px', marginBottom: '32px', color: '#ffffff', opacity: 0.9 }}>
              Discover premium footwear that combines comfort, quality, and the latest fashion trends.
            </p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <Link
                to="/products"
                style={{ 
                  backgroundColor: '#4CAF50', 
                  color: '#ffffff', 
                  padding: '12px 24px', 
                  borderRadius: '8px', 
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontWeight: 'bold'
                }}
              >
                Shop Now
                <ArrowRight style={{ width: '20px', height: '20px' }} />
              </Link>
              <Link
                to="/products?shoeType=sneakers"
                style={{ 
                  border: '2px solid #ffffff', 
                  color: '#ffffff', 
                  padding: '12px 24px', 
                  borderRadius: '8px', 
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  fontWeight: 'bold'
                }}
              >
                Explore Sneakers
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ backgroundColor: '#F9FAFB', padding: '48px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '24px' 
          }}>
            {features.map((feature, index) => (
              <div key={index} style={{ textAlign: 'center' }}>
                <div style={{ 
                  width: '64px', 
                  height: '64px', 
                  backgroundColor: feature.color === 'bg-primary-orange' ? '#FF6B35' : '#4CAF50',
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  margin: '0 auto 16px' 
                }}>
                  <feature.icon style={{ width: '32px', height: '32px', color: '#ffffff' }} />
                </div>
                <h3 style={{ fontWeight: 'bold', marginBottom: '8px', color: '#1F2937' }}>
                  {feature.title}
                </h3>
                <p style={{ fontSize: '14px', color: '#6B7280' }}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section style={{ backgroundColor: '#ffffff', padding: '64px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '32px',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1F2937', marginBottom: '8px' }}>
                Featured Products
              </h2>
              <p style={{ color: '#6B7280' }}>Handpicked selections just for you</p>
            </div>
            <Link
              to="/products"
              style={{ 
                color: '#FF6B35', 
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: 'bold'
              }}
            >
              View All
              <ArrowRight style={{ width: '20px', height: '20px' }} />
            </Link>
          </div>

          <div style={{ 
            textAlign: 'center', 
            padding: '48px 20px', 
            backgroundColor: '#F9FAFB', 
            borderRadius: '8px' 
          }}>
            <TrendingUp style={{ width: '64px', height: '64px', color: '#9CA3AF', margin: '0 auto 16px' }} />
            <p style={{ fontSize: '18px', color: '#6B7280', marginBottom: '16px' }}>
              No featured products available
            </p>
            <p style={{ fontSize: '14px', color: '#9CA3AF', marginBottom: '24px' }}>
              Check back soon for new arrivals!
            </p>
            <Link 
              to="/products" 
              style={{ 
                backgroundColor: '#FF6B35', 
                color: '#ffffff', 
                padding: '12px 24px', 
                borderRadius: '8px', 
                textDecoration: 'none',
                display: 'inline-block',
                fontWeight: 'bold'
              }}
            >
              Browse All Products
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ 
        backgroundColor: '#FF6B35', 
        color: '#ffffff', 
        padding: '64px 20px' 
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '16px', color: '#ffffff' }}>
            Join Our Loyalty Program
          </h2>
          <p style={{ fontSize: '20px', marginBottom: '32px', color: '#ffffff', opacity: 0.9 }}>
            Earn points with every purchase and redeem them for exclusive discounts
          </p>
          <Link
            to="/register"
            style={{ 
              backgroundColor: '#ffffff', 
              color: '#FF6B35', 
              padding: '12px 32px', 
              borderRadius: '8px', 
              textDecoration: 'none',
              display: 'inline-block',
              fontWeight: 'bold'
            }}
          >
            Sign Up Now
          </Link>
        </div>
      </section>
    </div>
  )
}

export default Home
