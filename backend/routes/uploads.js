import express from 'express'
import multer from 'multer'
import { verifyAdmin } from '../middleware/auth.js'
import { getCloudinary, getCloudinaryConfig } from '../config/cloudinary.js'
import { supabase } from '../config/supabase.js'

const router = express.Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!['image/jpeg', 'image/png'].includes(file.mimetype)) {
      return cb(new Error('Only JPEG or PNG images are allowed'))
    }
    return cb(null, true)
  },
})

router.post('/cloudinary-signature', verifyAdmin, async (req, res) => {
  try {
    const cloudinary = getCloudinary()
    const config = getCloudinaryConfig()

    if (!cloudinary || !config.isConfigured) {
      return res.status(500).json({
        success: false,
        message: 'Cloudinary is not configured on the server',
        missing: config.missing || [],
      })
    }

    const timestamp = Math.round(Date.now() / 1000)
    const productId = req.body?.productId || ''
    const folder = productId ? `products/${productId}` : 'products'

    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      config.apiSecret
    )

    res.json({
      success: true,
      data: {
        timestamp,
        signature,
        apiKey: config.apiKey,
        cloudName: config.cloudName,
        folder,
      },
    })
  } catch (error) {
    console.error('Cloudinary signature error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to generate upload signature',
      details: error.message,
    })
  }
})

router.post('/product-image/:productId', verifyAdmin, upload.single('file'), async (req, res) => {
  try {
    const cloudinary = getCloudinary()
    const config = getCloudinaryConfig()

    if (!cloudinary || !config.isConfigured) {
      return res.status(500).json({
        success: false,
        message: 'Cloudinary is not configured on the server',
        missing: config.missing || [],
      })
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Image file is required' })
    }

    const { productId } = req.params
    const altText = req.body?.alt_text || null
    const position = Number.isFinite(Number(req.body?.position))
      ? Math.max(0, parseInt(req.body.position, 10))
      : 0

    const folder = productId ? `products/${productId}` : 'products'

    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder, resource_type: 'image' },
        (error, result) => {
          if (error) return reject(error)
          return resolve(result)
        }
      )
      stream.end(req.file.buffer)
    })

    const payload = {
      product_id: productId,
      url: uploadResult.secure_url || uploadResult.url,
      public_id: uploadResult.public_id,
      width: uploadResult.width || null,
      height: uploadResult.height || null,
      format: uploadResult.format || null,
      alt_text: altText,
      position,
    }

    const { data, error } = await supabase
      .from('product_images')
      .insert(payload)
      .select()
      .single()

    if (error) {
      return res.status(500).json({ success: false, message: error.message })
    }

    try {
      const { data: product } = await supabase
        .from('products')
        .select('images')
        .eq('id', productId)
        .single()

      const existing = Array.isArray(product?.images) ? product.images : []
      if (!existing.includes(payload.url)) {
        await supabase
          .from('products')
          .update({ images: [...existing, payload.url] })
          .eq('id', productId)
      }
    } catch (syncError) {
      console.warn('Product image sync failed:', syncError.message)
    }

    res.json({ success: true, data })
  } catch (error) {
    const message = error?.message || 'Image upload failed'
    res.status(400).json({ success: false, message })
  }
})

router.use((err, req, res, next) => {
  if (err) {
    const message = err.message || 'Upload failed'
    return res.status(400).json({ success: false, message })
  }
  return next()
})

export default router
