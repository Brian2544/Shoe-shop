import express from 'express'
import { supabase } from '../config/supabase.js'

const router = express.Router()

const attachProductImages = (products, imageRows) => {
  const grouped = (imageRows || []).reduce((acc, image) => {
    const key = image.product_id
    if (!acc[key]) acc[key] = []
    acc[key].push(image)
    return acc
  }, {})

  return products.map((product) => {
    const images = grouped[product.id] || []
    const imageUrls = images.length > 0 ? images.map((img) => img.url) : (product.images || [])

    return {
      ...product,
      images: imageUrls,
      imageRecords: images,
    }
  })
}

// Get all products with filters
router.get('/', async (req, res) => {
  try {
    console.log('📦 GET /api/products - Request received', {
      query: req.query,
      timestamp: new Date().toISOString(),
    })
    
    let query = supabase.from('products').select('*')

    // Exclude archived products by default
    if (req.query.includeArchived !== 'true') {
      query = query.neq('status', 'archived')
    }

    // Apply filters
    if (req.query.gender) {
      query = query.eq('gender', req.query.gender)
    }
    if (req.query.shoeType) {
      query = query.eq('shoe_type', req.query.shoeType)
    }
    if (req.query.brand) {
      query = query.eq('brand', req.query.brand)
    }
    if (req.query.minPrice) {
      query = query.gte('price', req.query.minPrice)
    }
    if (req.query.maxPrice) {
      query = query.lte('price', req.query.maxPrice)
    }
    if (req.query.search) {
      query = query.or(`name.ilike.%${req.query.search}%,brand.ilike.%${req.query.search}%,description.ilike.%${req.query.search}%`)
    }

    // Sorting
    const sortBy = req.query.sortBy || 'created_at'
    const sortOrder = req.query.sortOrder || 'desc'
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    // Pagination
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const from = (page - 1) * limit
    const to = from + limit - 1

    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      console.error('❌ Products query error:', {
        message: error.message,
        code: error.code,
        details: error.details,
      })
      throw error
    }

    console.log('✅ Products query successful:', {
      count: data?.length || 0,
      total: count || data?.length || 0,
      page,
      limit,
    })

    const productIds = (data || []).map((product) => product.id)
    let imageRows = []

    if (productIds.length > 0) {
      const { data: imagesData, error: imagesError } = await supabase
        .from('product_images')
        .select('*')
        .in('product_id', productIds)
        .order('position', { ascending: true })

      if (!imagesError) {
        imageRows = imagesData || []
      }
    }

    const enrichedProducts = attachProductImages(data || [], imageRows)

    res.json({
      success: true,
      data: enrichedProducts,
      pagination: {
        page,
        limit,
        total: count || data?.length || 0,
      },
    })
  } catch (error) {
    console.error('❌ Products route error:', {
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    })
    res.status(500).json({ 
      success: false, 
      message: error.message,
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    })
  }
})

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', req.params.id)
      .single()

    if (error) throw error

    if (!data || data.status === 'archived') {
      return res.status(404).json({ success: false, message: 'Product not found' })
    }

    const { data: imagesData, error: imagesError } = await supabase
      .from('product_images')
      .select('*')
      .eq('product_id', req.params.id)
      .order('position', { ascending: true })

    const imageRecords = imagesError ? [] : (imagesData || [])
    const imageUrls = imageRecords.length > 0 ? imageRecords.map((img) => img.url) : (data.images || [])

    res.json({
      success: true,
      data: {
        ...data,
        images: imageUrls,
        imageRecords,
      },
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

// Get product recommendations
router.get('/:id/recommendations', async (req, res) => {
  try {
    const { data: product } = await supabase
      .from('products')
      .select('*')
      .eq('id', req.params.id)
      .single()

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' })
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('gender', product.gender)
      .eq('shoe_type', product.shoe_type)
      .neq('id', req.params.id)
      .limit(4)

    if (error) throw error

    res.json({ success: true, data: data || [] })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
})

export default router
