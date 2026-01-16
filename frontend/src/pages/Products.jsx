import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from 'react-query'
import api from '../services/api'
import { useStore } from '../store/store'
import ProductCard from '../components/products/ProductCard'
import FilterSidebar from '../components/products/FilterSidebar'
import { SlidersHorizontal, Grid, List } from 'lucide-react'

const Products = () => {
  const [searchParams] = useSearchParams()
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState('grid')
  const [sortBy, setSortBy] = useState('newest')
  const { filters, setFilters } = useStore()

  const searchQuery = searchParams.get('search') || ''
  const genderFilter = searchParams.get('gender') || filters.gender
  const shoeTypeFilter = searchParams.get('shoeType') || filters.shoeType

  // Build query params
  const queryParams = new URLSearchParams()
  if (searchQuery) queryParams.append('search', searchQuery)
  if (genderFilter) queryParams.append('gender', genderFilter)
  if (shoeTypeFilter) queryParams.append('shoeType', shoeTypeFilter)
  if (filters.brand) queryParams.append('brand', filters.brand)
  if (filters.priceRange) {
    const [min, max] = filters.priceRange.split('-').map(Number)
    if (min) queryParams.append('minPrice', min)
    if (max) queryParams.append('maxPrice', max)
  }
  queryParams.append('sortBy', sortBy === 'newest' ? 'created_at' : sortBy === 'price-low' ? 'price' : sortBy === 'price-high' ? 'price' : sortBy === 'rating' ? 'rating' : 'sales_count')
  queryParams.append('sortOrder', sortBy === 'price-low' ? 'asc' : 'desc')

  const { data: productsData, isLoading } = useQuery(
    ['products', filters, searchQuery, sortBy],
    async () => {
      const response = await api.get(`/products?${queryParams.toString()}`)
      return response.data
    },
    {
      retry: 1,
      refetchOnWindowFocus: false,
    }
  )

  const products = productsData?.data || []

  useEffect(() => {
    if (genderFilter) setFilters({ ...filters, gender: genderFilter })
    if (shoeTypeFilter) setFilters({ ...filters, shoeType: shoeTypeFilter })
  }, [genderFilter, shoeTypeFilter])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-600 mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2">
            <li><a href="/" className="hover:text-primary-orange">Home</a></li>
            <li>/</li>
            <li className="text-gray-900">Products</li>
            {searchQuery && (
              <>
                <li>/</li>
                <li className="text-gray-900">Search: {searchQuery}</li>
              </>
            )}
          </ol>
        </nav>

        <div className="flex gap-6">
          {/* Filter Sidebar */}
          <FilterSidebar 
            isOpen={showFilters} 
            onClose={() => setShowFilters(false)} 
          />

          {/* Main Content */}
          <div className="flex-1">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden btn-outline flex items-center gap-2"
                    aria-label="Toggle filters"
                  >
                    <SlidersHorizontal className="w-5 h-5" />
                    Filters
                  </button>
                  <h1 className="text-2xl font-bold">
                    {searchQuery ? `Search: ${searchQuery}` : 'All Products'}
                  </h1>
                  <span className="text-gray-500">({products.length} products)</span>
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="input-field w-auto"
                    aria-label="Sort products"
                  >
                    <option value="newest">Newest</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                    <option value="trending">Trending</option>
                  </select>
                  <div className="flex border rounded-lg overflow-hidden" role="group" aria-label="View mode">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 ${viewMode === 'grid' ? 'bg-primary-orange text-white' : 'bg-white text-gray-700'}`}
                      aria-label="Grid view"
                    >
                      <Grid className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 ${viewMode === 'list' ? 'bg-primary-orange text-white' : 'bg-white text-gray-700'}`}
                      aria-label="List view"
                    >
                      <List className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="card animate-pulse">
                    <div className="aspect-square bg-gray-200"></div>
                    <div className="p-4 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-lg">
                <p className="text-xl text-gray-500 mb-4">No products found</p>
                <p className="text-gray-400 mb-6">Try adjusting your filters</p>
                <button
                  onClick={() => {
                    setFilters({
                      gender: null,
                      priceRange: null,
                      material: null,
                      shoeType: null,
                      brand: null,
                      color: null,
                      size: null,
                    })
                  }}
                  className="btn-outline"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'
                : 'space-y-4'
              }>
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Products
