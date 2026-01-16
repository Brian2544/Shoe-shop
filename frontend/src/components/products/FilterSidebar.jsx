import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useStore } from '../../store/store'
import { useQuery } from 'react-query'
import api from '../../services/api'

const FilterSidebar = ({ isOpen, onClose }) => {
  const { filters, setFilters, clearFilters } = useStore()

  // Fetch unique values for filters
  const { data: brands = [] } = useQuery('brands', async () => {
    try {
      const response = await api.get('/products?limit=1000')
      const products = response.data.data || []
      const uniqueBrands = [...new Set(products.map(p => p.brand).filter(Boolean))]
      return uniqueBrands
    } catch (error) {
      return []
    }
  })

  const { data: materials = [] } = useQuery('materials', async () => {
    try {
      const response = await api.get('/products?limit=1000')
      const products = response.data.data || []
      const uniqueMaterials = [...new Set(products.map(p => p.material).filter(Boolean))]
      return uniqueMaterials
    } catch (error) {
      return []
    }
  })

  const priceRanges = [
    { label: 'Under $50', value: '0-50' },
    { label: '$50 - $100', value: '50-100' },
    { label: '$100 - $200', value: '100-200' },
    { label: '$200 - $300', value: '200-300' },
    { label: 'Over $300', value: '300-' },
  ]

  const colors = ['Black', 'White', 'Red', 'Blue', 'Green', 'Brown', 'Gray', 'Pink', 'Yellow']

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: filters[key] === value ? null : value })
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 flex-shrink-0">
        <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Filters</h2>
            <button
              onClick={clearFilters}
              className="text-sm text-primary-orange hover:text-primary-orange-dark"
            >
              Clear All
            </button>
          </div>

          <div className="space-y-6">
            {/* Gender */}
            <div>
              <h3 className="font-semibold mb-3">Gender</h3>
              <div className="space-y-2">
                {['male', 'female', 'kids', 'unisex'].map((gender) => (
                  <label key={gender} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      checked={filters.gender === gender}
                      onChange={() => handleFilterChange('gender', gender)}
                      className="w-4 h-4 text-primary-orange focus:ring-primary-orange"
                    />
                    <span className="capitalize">{gender}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="font-semibold mb-3">Price Range</h3>
              <div className="space-y-2">
                {priceRanges.map((range) => (
                  <label key={range.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="priceRange"
                      checked={filters.priceRange === range.value}
                      onChange={() => handleFilterChange('priceRange', range.value)}
                      className="w-4 h-4 text-primary-orange focus:ring-primary-orange"
                    />
                    <span>{range.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Brand */}
            <div>
              <h3 className="font-semibold mb-3">Brand</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {brands.map((brand) => (
                  <label key={brand} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.brand === brand}
                      onChange={() => handleFilterChange('brand', brand)}
                      className="w-4 h-4 text-primary-orange focus:ring-primary-orange rounded"
                    />
                    <span>{brand}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Color */}
            <div>
              <h3 className="font-semibold mb-3">Color</h3>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleFilterChange('color', color)}
                    className={`px-3 py-1 rounded-full text-sm border-2 transition-colors ${
                      filters.color === color
                        ? 'border-primary-orange bg-primary-orange text-white'
                        : 'border-gray-300 hover:border-primary-orange'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Material */}
            <div>
              <h3 className="font-semibold mb-3">Material</h3>
              <div className="space-y-2">
                {materials.map((material) => (
                  <label key={material} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.material === material}
                      onChange={() => handleFilterChange('material', material)}
                      className="w-4 h-4 text-primary-orange focus:ring-primary-orange rounded"
                    />
                    <span className="capitalize">{material}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed left-0 top-0 h-full w-80 bg-white shadow-xl z-50 lg:hidden overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Filters</h2>
                  <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                {/* Same filter content as desktop */}
                <div className="space-y-6">
                  {/* Gender */}
                  <div>
                    <h3 className="font-semibold mb-3">Gender</h3>
                    <div className="space-y-2">
                      {['male', 'female', 'kids', 'unisex'].map((gender) => (
                        <label key={gender} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="gender"
                            checked={filters.gender === gender}
                            onChange={() => handleFilterChange('gender', gender)}
                            className="w-4 h-4 text-primary-orange focus:ring-primary-orange"
                          />
                          <span className="capitalize">{gender}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div>
                    <h3 className="font-semibold mb-3">Price Range</h3>
                    <div className="space-y-2">
                      {priceRanges.map((range) => (
                        <label key={range.value} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="priceRange"
                            checked={filters.priceRange === range.value}
                            onChange={() => handleFilterChange('priceRange', range.value)}
                            className="w-4 h-4 text-primary-orange focus:ring-primary-orange"
                          />
                          <span>{range.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Brand */}
                  <div>
                    <h3 className="font-semibold mb-3">Brand</h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {brands.map((brand) => (
                        <label key={brand} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.brand === brand}
                            onChange={() => handleFilterChange('brand', brand)}
                            className="w-4 h-4 text-primary-orange focus:ring-primary-orange rounded"
                          />
                          <span>{brand}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Color */}
                  <div>
                    <h3 className="font-semibold mb-3">Color</h3>
                    <div className="flex flex-wrap gap-2">
                      {colors.map((color) => (
                        <button
                          key={color}
                          onClick={() => handleFilterChange('color', color)}
                          className={`px-3 py-1 rounded-full text-sm border-2 transition-colors ${
                            filters.color === color
                              ? 'border-primary-orange bg-primary-orange text-white'
                              : 'border-gray-300 hover:border-primary-orange'
                          }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Material */}
                  <div>
                    <h3 className="font-semibold mb-3">Material</h3>
                    <div className="space-y-2">
                      {materials.map((material) => (
                        <label key={material} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.material === material}
                            onChange={() => handleFilterChange('material', material)}
                            className="w-4 h-4 text-primary-orange focus:ring-primary-orange rounded"
                          />
                          <span className="capitalize">{material}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <button
                  onClick={clearFilters}
                  className="mt-6 w-full btn-outline"
                >
                  Clear All Filters
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

export default FilterSidebar
