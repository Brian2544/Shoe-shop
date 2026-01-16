import express from 'express'
import { supabase } from '../config/supabase.js'

const router = express.Router()

// Get product reviews (supports query param or path param)
router.get('/', async (req, res) => {
  try {
    const productId = req.query.productId
    if (!productId) {
      return res.status(400).json({ success: false, message: 'productId is required' })
    }

    const { data, error } = await supabase
      .from('reviews')
      .select('*, profiles(*)')
      .eq('product_id', productId)
      .order('created_at', { ascending: false })

    if (error) throw error

    res.json({ success: true, data: data || [] })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// Get product reviews (path param for backward compatibility)
router.get('/product/:productId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, profiles(*)')
      .eq('product_id', req.params.productId)
      .order('created_at', { ascending: false })

    if (error) throw error

    res.json({ success: true, data: data || [] })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// Create review
router.post('/', async (req, res) => {
  try {
    const { product_id, user_id, rating, comment, photos } = req.body

    const { data, error } = await supabase
      .from('reviews')
      .insert({
        product_id,
        user_id,
        rating,
        comment,
        photos: photos || [],
      })
      .select()
      .single()

    if (error) throw error

    // Update product rating
    const { data: reviews } = await supabase
      .from('reviews')
      .select('rating')
      .eq('product_id', product_id)

    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length

    await supabase
      .from('products')
      .update({ rating: avgRating, review_count: reviews.length })
      .eq('id', product_id)

    res.json({ success: true, data })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

export default router
