import express from 'express'
import { verifyAdmin } from '../middleware/auth.js'
import { getCloudinary, getCloudinaryConfig } from '../config/cloudinary.js'

const router = express.Router()

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
    })
  }
})

export default router
