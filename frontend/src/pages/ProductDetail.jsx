import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery } from 'react-query'
import api from '../services/api'
import { useStore } from '../store/store'
import toast from 'react-hot-toast'
import { 
  Heart, 
  ShoppingCart, 
  Share2, 
  Star, 
  Truck, 
  Shield, 
  RotateCcw,
  Plus,
  Minus,
  GitCompareArrows,
  ZoomIn
} from 'lucide-react'
// ImageZoom can be added later if needed

const ProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart, addToWishlist, wishlist, removeFromWishlist, addToCompare, compareList } = useStore()
  const [selectedSize, setSelectedSize] = useState(null)
  const [selectedColor, setSelectedColor] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [showZoom, setShowZoom] = useState(false)

  const { data: productData, isLoading } = useQuery(
    ['product', id],
    async () => {
      const response = await api.get(`/products/${id}`)
      return response.data.data
    }
  )

  const product = productData

  const { data: reviewsData } = useQuery(
    ['reviews', id],
    async () => {
      try {
        const response = await api.get(`/reviews?productId=${id}`)
        return response.data.data || []
      } catch (error) {
        return []
      }
    },
    { enabled: !!id }
  )

  const reviews = reviewsData || []

  useEffect(() => {
    if (product) {
      if (product.sizes && product.sizes.length > 0) {
        setSelectedSize(product.sizes[0])
      }
      if (product.colors && product.colors.length > 0) {
        setSelectedColor(product.colors[0])
      }
    }
  }, [product])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-orange"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Product not found</h2>
          <Link to="/products" className="btn-primary">Back to Products</Link>
        </div>
      </div>
    )
  }

  const isInWishlist = wishlist.some(item => item.id === product.id)
  const isInCompare = compareList.some(item => item.id === product.id)
  const imageRecords = product.imageRecords || []
  const images = imageRecords.length > 0
    ? imageRecords.map((img) => img.url)
    : (product.images || [product.image].filter(Boolean))
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : product.rating || 0

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error('Please select a size')
      return
    }
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: images[0],
      size: selectedSize,
      color: selectedColor,
      quantity,
    })
    toast.success('Added to cart!')
  }

  const handleWishlistToggle = () => {
    if (isInWishlist) {
      removeFromWishlist(product.id)
      toast.success('Removed from wishlist')
    } else {
      addToWishlist(product)
      toast.success('Added to wishlist!')
    }
  }

  const handleCompareToggle = () => {
    if (isInCompare) {
      toast.error('Product already in comparison')
    } else if (compareList.length >= 4) {
      toast.error('Maximum 4 products can be compared')
    } else {
      addToCompare(product)
      toast.success('Added to comparison')
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: `Check out ${product.name} on ShoeStore`,
          url: window.location.href,
        })
      } catch (err) {
        console.log('Error sharing:', err)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard!')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-600 mb-6">
          <ol className="flex items-center gap-2">
            <li><Link to="/" className="hover:text-primary-orange">Home</Link></li>
            <li>/</li>
            <li><Link to="/products" className="hover:text-primary-orange">Products</Link></li>
            <li>/</li>
            <li className="text-gray-900">{product.name}</li>
          </ol>
        </nav>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 lg:p-12">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group">
                <img
                  src={images[selectedImageIndex] || '/placeholder-shoe.jpg'}
                  alt={imageRecords[selectedImageIndex]?.alt_text || product.name}
                  className="w-full h-full object-cover"
                />
                <Link
                  to={`/products/${product.id}`}
                  className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ZoomIn className="w-5 h-5" />
                </Link>
                {product.stock_quantity === 0 && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="text-white font-semibold text-xl">Out of Stock</span>
                  </div>
                )}
              </div>
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImageIndex === idx
                          ? 'border-primary-orange'
                          : 'border-transparent hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={img}
                        alt={imageRecords[idx]?.alt_text || `${product.name} ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <p className="text-secondary-green font-semibold mb-2">{product.brand}</p>
                <h1 className="text-3xl md:text-4xl font-bold mb-4">{product.name}</h1>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.floor(averageRating)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-gray-600">({reviews.length} reviews)</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-3xl font-bold text-primary-orange">${product.price}</span>
                  {product.original_price && (
                    <>
                      <span className="text-xl text-gray-400 line-through">${product.original_price}</span>
                      <span className="bg-primary-orange text-white px-2 py-1 rounded text-sm font-semibold">
                        {Math.round(((product.original_price - product.price) / product.original_price) * 100)}% OFF
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-gray-600">{product.description}</p>
              </div>

              {/* Size Selection */}
              {product.sizes && product.sizes.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Size</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 border-2 rounded-lg font-semibold transition-all ${
                          selectedSize === size
                            ? 'border-primary-orange bg-primary-orange text-white'
                            : 'border-gray-300 hover:border-primary-orange'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                  <Link to="#" className="text-sm text-primary-orange hover:underline mt-2 inline-block">
                    Size Guide
                  </Link>
                </div>
              )}

              {/* Color Selection */}
              {product.colors && product.colors.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Color</h3>
                  <div className="flex gap-2">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`w-10 h-10 rounded-full border-2 ${
                          selectedColor === color
                            ? 'border-primary-orange scale-110'
                            : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color.toLowerCase() }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div>
                <h3 className="font-semibold mb-3">Quantity</h3>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 border rounded-lg hover:bg-gray-100"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock_quantity || 10, quantity + 1))}
                    className="p-2 border rounded-lg hover:bg-gray-100"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <span className="text-gray-600">({product.stock_quantity} available)</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock_quantity === 0 || !selectedSize}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Add to Cart
                </button>
                <button
                  onClick={() => {
                    handleAddToCart()
                    navigate('/checkout')
                  }}
                  disabled={product.stock_quantity === 0 || !selectedSize}
                  className="flex-1 btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Buy Now
                </button>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleWishlistToggle}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 border-2 rounded-lg font-semibold transition-all ${
                    isInWishlist
                      ? 'border-primary-orange bg-primary-orange text-white'
                      : 'border-gray-300 hover:border-primary-orange'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
                  {isInWishlist ? 'In Wishlist' : 'Add to Wishlist'}
                </button>
                <button
                  onClick={handleCompareToggle}
                  disabled={isInCompare}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-6 border-2 border-gray-300 rounded-lg font-semibold hover:border-primary-orange transition-all disabled:opacity-50"
                >
                  <GitCompareArrows className="w-5 h-5" />
                  Compare
                </button>
                <button
                  onClick={handleShare}
                  className="p-3 border-2 border-gray-300 rounded-lg hover:border-primary-orange transition-all"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 gap-4 pt-6 border-t">
                <div className="flex items-center gap-3">
                  <Truck className="w-6 h-6 text-secondary-green" />
                  <div>
                    <p className="font-semibold">Free Shipping</p>
                    <p className="text-sm text-gray-600">On orders over $100</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <RotateCcw className="w-6 h-6 text-secondary-green" />
                  <div>
                    <p className="font-semibold">30-Day Returns</p>
                    <p className="text-sm text-gray-600">Easy returns</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-secondary-green" />
                  <div>
                    <p className="font-semibold">Secure Payment</p>
                    <p className="text-sm text-gray-600">100% secure</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Truck className="w-6 h-6 text-secondary-green" />
                  <div>
                    <p className="font-semibold">Fast Delivery</p>
                    <p className="text-sm text-gray-600">2-5 business days</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details Tabs */}
          <div className="border-t px-6 lg:px-12 py-8">
            <div className="flex gap-6 border-b mb-6">
              <button className="pb-4 border-b-2 border-primary-orange font-semibold">Details</button>
              <button className="pb-4 text-gray-600 hover:text-gray-900">Reviews ({reviews.length})</button>
              <button className="pb-4 text-gray-600 hover:text-gray-900">Shipping & Returns</button>
            </div>
            <div className="space-y-4">
              {product.material && (
                <div>
                  <h4 className="font-semibold mb-2">Material</h4>
                  <p className="text-gray-600">{product.material}</p>
                </div>
              )}
              {product.care_instructions && (
                <div>
                  <h4 className="font-semibold mb-2">Care Instructions</h4>
                  <p className="text-gray-600">{product.care_instructions}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail
