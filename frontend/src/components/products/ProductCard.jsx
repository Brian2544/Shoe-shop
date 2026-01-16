import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, ShoppingCart, Eye } from 'lucide-react'
import { useStore } from '../../store/store'
import { useState } from 'react'
import toast from 'react-hot-toast'

const ProductCard = ({ product }) => {
  const { addToCart, addToWishlist, wishlist, removeFromWishlist } = useStore()
  const [isHovered, setIsHovered] = useState(false)
  const isInWishlist = wishlist.some(item => item.id === product.id)

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || product.image,
      size: product.sizes?.[0] || 'M',
    })
    toast.success('Added to cart!')
  }

  const handleWishlistToggle = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (isInWishlist) {
      removeFromWishlist(product.id)
      toast.success('Removed from wishlist')
    } else {
      addToWishlist(product)
      toast.success('Added to wishlist!')
    }
  }

  const imageUrl = product.imageRecords?.[0]?.url || product.images?.[0] || product.image || '/placeholder-shoe.jpg'
  const discount = product.original_price 
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0

  return (
    <motion.div
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -5 }}
      className="card overflow-hidden group"
    >
      <Link to={`/products/${product.id}`}>
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          {discount > 0 && (
            <span className="absolute top-2 left-2 bg-primary-orange text-white px-2 py-1 rounded text-sm font-semibold">
              -{discount}%
            </span>
          )}
          {product.stock_quantity === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white font-semibold">Out of Stock</span>
            </div>
          )}
          <div className={`absolute top-2 right-2 flex flex-col gap-2 transition-opacity ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <button
              onClick={handleWishlistToggle}
              className={`p-2 rounded-full shadow-lg transition-colors ${
                isInWishlist 
                  ? 'bg-primary-orange text-white' 
                  : 'bg-white text-gray-700 hover:bg-primary-orange hover:text-white'
              }`}
            >
              <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-current' : ''}`} />
            </button>
            <Link
              to={`/products/${product.id}`}
              className="p-2 bg-white rounded-full shadow-lg text-gray-700 hover:bg-secondary-green hover:text-white transition-colors"
            >
              <Eye className="w-4 h-4" />
            </Link>
          </div>
        </div>
        <div className="p-4">
          <p className="text-sm text-gray-500 mb-1">{product.brand || 'Brand'}</p>
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-primary-orange">
                ${product.price}
              </span>
              {product.original_price && (
                <span className="text-sm text-gray-400 line-through">
                  ${product.original_price}
                </span>
              )}
            </div>
            {product.rating && (
              <div className="flex items-center gap-1">
                <span className="text-sm text-gray-600">{product.rating}</span>
                <span className="text-yellow-400">★</span>
              </div>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={product.stock_quantity === 0}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
          </button>
        </div>
      </Link>
    </motion.div>
  )
}

export default ProductCard
