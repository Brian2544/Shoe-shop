import { Link } from 'react-router-dom'
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react'

const Footer = () => {
  return (
    <footer style={{ backgroundColor: '#111827', color: '#D1D5DB', marginTop: 'auto' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 16px' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '32px',
          marginBottom: '32px'
        }}>
          {/* About */}
          <div>
            <h3 style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '18px', marginBottom: '16px' }}>
              About ShoeStore
            </h3>
            <p style={{ fontSize: '14px', marginBottom: '16px', color: '#D1D5DB' }}>
              Your premier destination for quality footwear. We offer the latest trends in comfort and style.
            </p>
            <div style={{ display: 'flex', gap: '16px' }}>
              <a href="https://www.facebook.com" target="_blank" rel="noreferrer" style={{ color: '#D1D5DB' }}>
                <Facebook style={{ width: '20px', height: '20px' }} />
              </a>
              <a href="https://www.x.com" target="_blank" rel="noreferrer" style={{ color: '#D1D5DB' }}>
                <Twitter style={{ width: '20px', height: '20px' }} />
              </a>
              <a href="https://www.instagram.com" target="_blank" rel="noreferrer" style={{ color: '#D1D5DB' }}>
                <Instagram style={{ width: '20px', height: '20px' }} />
              </a>
              <a href="https://www.youtube.com" target="_blank" rel="noreferrer" style={{ color: '#D1D5DB' }}>
                <Youtube style={{ width: '20px', height: '20px' }} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '18px', marginBottom: '16px' }}>
              Quick Links
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>
                <Link to="/products" style={{ color: '#D1D5DB', textDecoration: 'none', fontSize: '14px' }}>
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/products?gender=male" style={{ color: '#D1D5DB', textDecoration: 'none', fontSize: '14px' }}>
                  Men's Shoes
                </Link>
              </li>
              <li>
                <Link to="/products?gender=female" style={{ color: '#D1D5DB', textDecoration: 'none', fontSize: '14px' }}>
                  Women's Shoes
                </Link>
              </li>
              <li>
                <Link to="/products?gender=kids" style={{ color: '#D1D5DB', textDecoration: 'none', fontSize: '14px' }}>
                  Kids' Shoes
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '18px', marginBottom: '16px' }}>
              Customer Service
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>
                <Link to="/order-tracking" style={{ color: '#D1D5DB', textDecoration: 'none', fontSize: '14px' }}>
                  Track Order
                </Link>
              </li>
              <li>
                <Link to="/returns" style={{ color: '#D1D5DB', textDecoration: 'none', fontSize: '14px' }}>
                  Returns & Exchanges
                </Link>
              </li>
              <li>
                <Link to="/shipping" style={{ color: '#D1D5DB', textDecoration: 'none', fontSize: '14px' }}>
                  Shipping Info
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '18px', marginBottom: '16px' }}>
              Contact Us
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                <Phone style={{ width: '16px', height: '16px' }} />
                <span>+254 712345678</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                <Mail style={{ width: '16px', height: '16px' }} />
                <span>support@shoestore.com</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'start', gap: '8px', fontSize: '14px' }}>
                <MapPin style={{ width: '16px', height: '16px', marginTop: '2px' }} />
                <span>123 Shoe Street, Mombasa City, FC 12345</span>
              </li>
            </ul>
          </div>
        </div>

        <div style={{ 
          borderTop: '1px solid #374151', 
          paddingTop: '32px', 
          display: 'flex', 
          flexDirection: 'column',
          gap: '16px',
          alignItems: 'center',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '14px', color: '#D1D5DB' }}>
            &copy; {new Date().getFullYear()} ShoeStore. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link to="/privacy" style={{ color: '#D1D5DB', textDecoration: 'none', fontSize: '14px' }}>
              Privacy Policy
            </Link>
            <Link to="/terms" style={{ color: '#D1D5DB', textDecoration: 'none', fontSize: '14px' }}>
              Terms of Service
            </Link>
            <Link to="/cookies" style={{ color: '#D1D5DB', textDecoration: 'none', fontSize: '14px' }}>
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
