import { Link } from 'react-router-dom'
import { useStore } from '../store/store'
import { X, ShoppingCart, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

const Compare = () => {
  const { compareList, removeFromCompare, addToCart } = useStore()

  if (compareList.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">No products to compare</h2>
            <p className="text-gray-600 mb-8">Add products to compare their features and prices</p>
            <Link to="/products" className="btn-primary inline-block">
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const features = ['price', 'brand', 'material', 'rating', 'stock_quantity']

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Compare Products</h1>
          <button
            onClick={() => {
              compareList.forEach((item) => removeFromCompare(item.id))
              toast.success('Comparison cleared')
            }}
            className="text-red-500 hover:text-red-700 font-semibold flex items-center gap-2"
          >
            <Trash2 className="w-5 h-5" />
            Clear All
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="p-4 text-left">Features</th>
                {compareList.map((product) => (
                  <th key={product.id} className="p-4 text-center min-w-[250px]">
                    <button
                      onClick={() => removeFromCompare(product.id)}
                      className="float-right p-1 hover:bg-gray-100 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <img
                      src={product.images?.[0] || product.image || '/placeholder-shoe.jpg'}
                      alt={product.name}
                      className="w-32 h-32 object-cover mx-auto mb-2 rounded"
                    />
                    <h3 className="font-semibold">{product.name}</h3>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-4 font-semibold">Price</td>
                {compareList.map((product) => (
                  <td key={product.id} className="p-4 text-center">
                    <span className="text-xl font-bold text-primary-orange">${product.price}</span>
                    {product.original_price && (
                      <span className="text-sm text-gray-400 line-through ml-2">
                        ${product.original_price}
                      </span>
                    )}
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="p-4 font-semibold">Brand</td>
                {compareList.map((product) => (
                  <td key={product.id} className="p-4 text-center">{product.brand || 'N/A'}</td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="p-4 font-semibold">Material</td>
                {compareList.map((product) => (
                  <td key={product.id} className="p-4 text-center">{product.material || 'N/A'}</td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="p-4 font-semibold">Rating</td>
                {compareList.map((product) => (
                  <td key={product.id} className="p-4 text-center">
                    {product.rating ? `${product.rating} ⭐` : 'N/A'}
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="p-4 font-semibold">Stock</td>
                {compareList.map((product) => (
                  <td key={product.id} className="p-4 text-center">
                    {product.stock_quantity > 0 ? (
                      <span className="text-secondary-green">In Stock ({product.stock_quantity})</span>
                    ) : (
                      <span className="text-red-500">Out of Stock</span>
                    )}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-semibold">Actions</td>
                {compareList.map((product) => (
                  <td key={product.id} className="p-4 text-center">
                    <div className="flex flex-col gap-2">
                      <Link
                        to={`/products/${product.id}`}
                        className="btn-outline text-sm"
                      >
                        View Details
                      </Link>
                      <button
                        onClick={() => {
                          addToCart({
                            id: product.id,
                            name: product.name,
                            price: product.price,
                            image: product.images?.[0] || product.image,
                            size: product.sizes?.[0] || 'M',
                          })
                          toast.success('Added to cart!')
                        }}
                        className="btn-primary text-sm flex items-center justify-center gap-2 w-full"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        Add to Cart
                      </button>
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Compare
