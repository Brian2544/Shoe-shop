import express from 'express'
import { supabase } from '../config/supabase.js'
import { verifyAdmin } from '../middleware/auth.js'
import { getCloudinary } from '../config/cloudinary.js'

const router = express.Router()

// All admin routes require authentication
router.use(verifyAdmin)

// Get all orders (admin)
router.get('/orders', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    res.json({ success: true, data: data || [] })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// Create product (admin)
router.post('/products', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .insert(req.body)
      .select()
      .single()

    if (error) throw error

    res.json({ success: true, data })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// Update product (admin)
router.patch('/products/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .update(req.body)
      .eq('id', req.params.id)
      .select()
      .single()

    if (error) throw error

    res.json({ success: true, data })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// Add product image metadata (admin)
router.post('/products/:id/images', async (req, res) => {
  try {
    const {
      url,
      public_id,
      width = null,
      height = null,
      format = null,
      alt_text = null,
      position = 0,
    } = req.body || {}

    if (!url || !public_id) {
      return res.status(400).json({
        success: false,
        message: 'Image url and public_id are required',
      })
    }

    const payload = {
      product_id: req.params.id,
      url,
      public_id,
      width,
      height,
      format,
      alt_text,
      position,
    }

    const { data, error } = await supabase
      .from('product_images')
      .insert(payload)
      .select()
      .single()

    if (error) throw error

    res.json({ success: true, data })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// Delete product image (admin)
router.delete('/products/:id/images/:imageId', async (req, res) => {
  try {
    const { data: image, error: fetchError } = await supabase
      .from('product_images')
      .select('*')
      .eq('id', req.params.imageId)
      .eq('product_id', req.params.id)
      .single()

    if (fetchError || !image) {
      return res.status(404).json({ success: false, message: 'Image not found' })
    }

    const cloudinary = getCloudinary()
    if (!cloudinary) {
      return res.status(500).json({
        success: false,
        message: 'Cloudinary is not configured on the server',
      })
    }

    const deleteResult = await cloudinary.uploader.destroy(image.public_id, {
      invalidate: true,
    })

    if (deleteResult?.result !== 'ok' && deleteResult?.result !== 'not found') {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete image from Cloudinary',
      })
    }

    const { error: deleteError } = await supabase
      .from('product_images')
      .delete()
      .eq('id', req.params.imageId)

    if (deleteError) throw deleteError

    res.json({ success: true, message: 'Image deleted' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// Delete product (admin)
router.delete('/products/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', req.params.id)

    if (error) throw error

    res.json({ success: true, message: 'Product deleted' })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

export default router
