import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/store'
import { CreditCard, Lock, Truck, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'

const Checkout = () => {
  const { cart, clearCart, user } = useStore()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [deliveryMethod, setDeliveryMethod] = useState('home')
  const [formData, setFormData] = useState({
    email: user?.email || '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
  })

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = deliveryMethod === 'pickup' ? 0 : subtotal > 100 ? 0 : 10
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (step === 1) {
      // Validate shipping info
      if (!formData.firstName || !formData.lastName || !formData.address || !formData.city || !formData.zipCode) {
        toast.error('Please fill in all required fields')
        return
      }
      setStep(2)
    } else if (step === 2) {
      // Process payment
      try {
        const orderData = {
          items: cart,
          shipping: {
            method: deliveryMethod,
            address: deliveryMethod === 'home' ? {
              ...formData,
            } : null,
          },
          payment: {
            method: paymentMethod,
            ...(paymentMethod === 'card' && {
              cardNumber: formData.cardNumber,
              expiryDate: formData.expiryDate,
              cvv: formData.cvv,
            }),
          },
          total,
          subtotal,
          shippingCost: shipping,
          tax,
        }

        const response = await api.post('/orders', orderData)
        
        if (response.data.success) {
          clearCart()
          toast.success('Order placed successfully!')
          navigate(`/order-tracking?orderId=${response.data.orderId}`)
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to place order')
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
              step >= 1 ? 'bg-primary-orange text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              1
            </div>
            <div className={`w-24 h-1 ${step >= 2 ? 'bg-primary-orange' : 'bg-gray-300'}`}></div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
              step >= 2 ? 'bg-primary-orange text-white' : 'bg-gray-300 text-gray-600'
            }`}>
              2
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
              {step === 1 && (
                <>
                  <h2 className="text-2xl font-bold mb-6">Shipping Information</h2>
                  
                  {/* Delivery Method */}
                  <div className="mb-6">
                    <h3 className="font-semibold mb-4">Delivery Method</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setDeliveryMethod('home')}
                        className={`p-4 border-2 rounded-lg text-left transition-all ${
                          deliveryMethod === 'home'
                            ? 'border-primary-orange bg-primary-orange bg-opacity-10'
                            : 'border-gray-300 hover:border-primary-orange'
                        }`}
                      >
                        <Truck className="w-6 h-6 mb-2 text-primary-orange" />
                        <p className="font-semibold">Home Delivery</p>
                        <p className="text-sm text-gray-600">2-5 business days</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeliveryMethod('pickup')}
                        className={`p-4 border-2 rounded-lg text-left transition-all ${
                          deliveryMethod === 'pickup'
                            ? 'border-primary-orange bg-primary-orange bg-opacity-10'
                            : 'border-gray-300 hover:border-primary-orange'
                        }`}
                      >
                        <MapPin className="w-6 h-6 mb-2 text-primary-orange" />
                        <p className="font-semibold">Store Pickup</p>
                        <p className="text-sm text-gray-600">Pick up in store</p>
                      </button>
                    </div>
                  </div>

                  {deliveryMethod === 'home' && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold mb-2">First Name *</label>
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            required
                            className="input-field"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-2">Last Name *</label>
                          <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            required
                            className="input-field"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-2">Email *</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="input-field"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-2">Phone *</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                          className="input-field"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold mb-2">Address *</label>
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          required
                          className="input-field"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-semibold mb-2">City *</label>
                          <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            required
                            className="input-field"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-2">State *</label>
                          <input
                            type="text"
                            name="state"
                            value={formData.state}
                            onChange={handleInputChange}
                            required
                            className="input-field"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-2">Zip Code *</label>
                          <input
                            type="text"
                            name="zipCode"
                            value={formData.zipCode}
                            onChange={handleInputChange}
                            required
                            className="input-field"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div className="flex justify-end gap-4 pt-6">
                    <button
                      type="button"
                      onClick={() => navigate('/cart')}
                      className="btn-outline"
                    >
                      Back to Cart
                    </button>
                    <button type="submit" className="btn-primary">
                      Continue to Payment
                    </button>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <h2 className="text-2xl font-bold mb-6">Payment Information</h2>

                  {/* Payment Method */}
                  <div className="mb-6">
                    <h3 className="font-semibold mb-4">Payment Method</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('card')}
                        className={`p-4 border-2 rounded-lg transition-all ${
                          paymentMethod === 'card'
                            ? 'border-primary-orange bg-primary-orange bg-opacity-10'
                            : 'border-gray-300 hover:border-primary-orange'
                        }`}
                      >
                        <CreditCard className="w-6 h-6 mx-auto mb-2 text-primary-orange" />
                        <p className="font-semibold text-sm">Credit Card</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('paypal')}
                        className={`p-4 border-2 rounded-lg transition-all ${
                          paymentMethod === 'paypal'
                            ? 'border-primary-orange bg-primary-orange bg-opacity-10'
                            : 'border-gray-300 hover:border-primary-orange'
                        }`}
                      >
                        <span className="text-2xl font-bold text-blue-600">PayPal</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('mpesa')}
                        className={`p-4 border-2 rounded-lg transition-all ${
                          paymentMethod === 'mpesa'
                            ? 'border-primary-orange bg-primary-orange bg-opacity-10'
                            : 'border-gray-300 hover:border-primary-orange'
                        }`}
                      >
                        <span className="text-lg font-semibold text-green-600">M-Pesa</span>
                      </button>
                    </div>
                  </div>

                  {paymentMethod === 'card' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2">Cardholder Name *</label>
                        <input
                          type="text"
                          name="cardName"
                          value={formData.cardName}
                          onChange={handleInputChange}
                          required
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2">Card Number *</label>
                        <input
                          type="text"
                          name="cardNumber"
                          value={formData.cardNumber}
                          onChange={handleInputChange}
                          required
                          maxLength={19}
                          placeholder="1234 5678 9012 3456"
                          className="input-field"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold mb-2">Expiry Date *</label>
                          <input
                            type="text"
                            name="expiryDate"
                            value={formData.expiryDate}
                            onChange={handleInputChange}
                            required
                            placeholder="MM/YY"
                            maxLength={5}
                            className="input-field"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold mb-2">CVV *</label>
                          <input
                            type="text"
                            name="cvv"
                            value={formData.cvv}
                            onChange={handleInputChange}
                            required
                            maxLength={4}
                            className="input-field"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm text-gray-600 pt-4">
                    <Lock className="w-4 h-4" />
                    <span>Your payment information is secure and encrypted</span>
                  </div>

                  <div className="flex justify-end gap-4 pt-6">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="btn-outline"
                    >
                      Back
                    </button>
                    <button type="submit" className="btn-primary">
                      Place Order
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                {cart.map((item) => (
                  <div key={`${item.id}-${item.size}`} className="flex gap-3">
                    <img
                      src={item.image || '/placeholder-shoe.jpg'}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{item.name}</p>
                      <p className="text-xs text-gray-600">Size: {item.size} x {item.quantity}</p>
                      <p className="text-sm font-semibold text-primary-orange">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold">
                    {shipping === 0 ? (
                      <span className="text-secondary-green">Free</span>
                    ) : (
                      `$${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-semibold">${tax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary-orange">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout
