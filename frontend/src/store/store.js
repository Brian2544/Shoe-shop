import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export const useStore = create(
  persist(
    (set) => ({
      // User state
      user: null,
      session: null,
      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      
      // Cart state
      cart: [],
      addToCart: (product) => set((state) => {
        const existingItem = state.cart.find(item => item.id === product.id && item.size === product.size)
        if (existingItem) {
          return {
            cart: state.cart.map(item =>
              item.id === product.id && item.size === product.size
                ? { ...item, quantity: item.quantity + (product.quantity || 1) }
                : item
            )
          }
        }
        return { cart: [...state.cart, { ...product, quantity: product.quantity || 1 }] }
      }),
      removeFromCart: (productId, size) => set((state) => ({
        cart: state.cart.filter(item => !(item.id === productId && item.size === size))
      })),
      updateCartItem: (productId, size, quantity) => set((state) => ({
        cart: state.cart.map(item =>
          item.id === productId && item.size === size
            ? { ...item, quantity }
            : item
        )
      })),
      clearCart: () => set({ cart: [] }),
      
      // Wishlist state
      wishlist: [],
      addToWishlist: (product) => set((state) => {
        if (state.wishlist.find(item => item.id === product.id)) {
          return state
        }
        return { wishlist: [...state.wishlist, product] }
      }),
      removeFromWishlist: (productId) => set((state) => ({
        wishlist: state.wishlist.filter(item => item.id !== productId)
      })),
      
      // Comparison state
      compareList: [],
      addToCompare: (product) => set((state) => {
        if (state.compareList.length >= 4) {
          return state
        }
        if (state.compareList.find(item => item.id === product.id)) {
          return state
        }
        return { compareList: [...state.compareList, product] }
      }),
      removeFromCompare: (productId) => set((state) => ({
        compareList: state.compareList.filter(item => item.id !== productId)
      })),
      clearCompare: () => set({ compareList: [] }),
      
      // Filters state
      filters: {
        gender: null,
        priceRange: null,
        material: null,
        shoeType: null,
        brand: null,
        color: null,
        size: null,
      },
      setFilters: (filters) => set({ filters }),
      clearFilters: () => set({
        filters: {
          gender: null,
          priceRange: null,
          material: null,
          shoeType: null,
          brand: null,
          color: null,
          size: null,
        }
      }),
    }),
    {
      name: 'shoe-store-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        cart: state.cart,
        wishlist: state.wishlist,
        compareList: state.compareList,
        filters: state.filters,
      }),
    }
  )
)
