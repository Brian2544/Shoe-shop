import { Link, useLocation } from 'react-router-dom'

const contentByPath = {
  '/terms': {
    title: 'Terms & Conditions',
    body: 'Please review our terms for purchasing and using the ShoeStore platform.',
  },
  '/privacy': {
    title: 'Privacy Policy',
    body: 'We respect your privacy and outline how data is handled on ShoeStore.',
  },
  '/cookies': {
    title: 'Cookie Policy',
    body: 'Learn how we use cookies to improve your shopping experience.',
  },
  '/returns': {
    title: 'Returns & Exchanges',
    body: 'Start a return by contacting support@shoestore.com with your order details.',
  },
  '/shipping': {
    title: 'Shipping Information',
    body: 'Shipping timelines vary by location. Reach out for expedited options.',
  },
  '/forgot-password': {
    title: 'Forgot Password',
    body: 'Reset links are handled by support. Email support@shoestore.com for assistance.',
  },
  '/size-guide': {
    title: 'Size Guide',
    body: 'Use your usual EU/US size. Contact support@shoestore.com for specific fit guidance.',
  },
}

const InfoPage = () => {
  const location = useLocation()
  const content = contentByPath[location.pathname] || {
    title: 'Information',
    body: 'Details will be available soon.',
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold mb-4">{content.title}</h1>
          <p className="text-gray-600 mb-6">{content.body}</p>
          <Link to="/" className="btn-primary inline-block">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default InfoPage
