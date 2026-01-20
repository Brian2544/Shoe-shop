import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from 'react-query'
import { Package, CheckCircle, Truck, MapPin } from 'lucide-react'
import api from '../services/api'
import { io } from 'socket.io-client'
import { config } from '../config'
import { formatCurrency } from '../lib/currency'

const OrderTracking = () => {
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('orderId')
  const [socket, setSocket] = useState(null)

  const queryClient = useQueryClient()

  const { data: orderData, isLoading } = useQuery(
    ['order', orderId],
    async () => {
      const response = await api.get(`/orders/${orderId}`)
      return response.data.data
    },
    { enabled: !!orderId }
  )

  const order = orderData

  useEffect(() => {
    if (orderId) {
      const newSocket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000')
      setSocket(newSocket)

      newSocket.emit('subscribe-order', orderId)

      newSocket.on('order-update', (updatedOrder) => {
        // Update order in cache
        queryClient.setQueryData(['order', orderId], updatedOrder)
      })

      return () => {
        newSocket.disconnect()
      }
    }
  }, [orderId, queryClient])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-orange"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Order not found</h2>
        </div>
      </div>
    )
  }

  const statusSteps = [
    { key: 'pending', label: 'Order Placed', icon: Package },
    { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
    { key: 'processing', label: 'Processing', icon: Package },
    { key: 'shipped', label: 'Shipped', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: MapPin },
  ]

  const currentStepIndex = statusSteps.findIndex(step => step.key === order.status) || 0

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Order Tracking</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Status */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold mb-6">Order Status</h2>
            
            <div className="space-y-4">
              {statusSteps.map((step, index) => {
                const StepIcon = step.icon
                const isCompleted = index <= currentStepIndex
                const isCurrent = index === currentStepIndex

                return (
                  <div key={step.key} className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                      isCompleted ? 'bg-primary-orange text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      <StepIcon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className={`font-semibold ${isCurrent ? 'text-primary-orange' : ''}`}>
                        {step.label}
                      </h3>
                      {isCurrent && order.tracking_number && (
                        <p className="text-sm text-gray-600 mt-1">
                          Tracking: {order.tracking_number}
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Order Details */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-6">Order Details</h2>
              
              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600">Order ID</p>
                  <p className="font-semibold">{order.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Order Date</p>
                  <p className="font-semibold">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <p className="font-semibold text-primary-orange capitalize">{order.status}</p>
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold">{formatCurrency(order.shipping_cost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-semibold">{formatCurrency(order.tax)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary-orange">{formatCurrency(order.total)}</span>
                </div>
              </div>

              {order.items && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-semibold mb-4">Items</h3>
                  <div className="space-y-3">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex gap-3">
                        <img
                          src={item.image || '/placeholder-shoe.jpg'}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-sm">{item.name}</p>
                          <p className="text-xs text-gray-600">Size: {item.size} x {item.quantity}</p>
                          <p className="text-sm font-semibold text-primary-orange">
                            {formatCurrency(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderTracking
