import { v2 as cloudinary } from 'cloudinary'

const getCloudinaryEnv = () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || ''
  const apiKey = process.env.CLOUDINARY_API_KEY || ''
  const apiSecret = process.env.CLOUDINARY_API_SECRET || ''

  const missing = []
  if (!cloudName) missing.push('CLOUDINARY_CLOUD_NAME')
  if (!apiKey) missing.push('CLOUDINARY_API_KEY')
  if (!apiSecret) missing.push('CLOUDINARY_API_SECRET')

  return {
    cloudName,
    apiKey,
    apiSecret,
    isConfigured: missing.length === 0,
    missing,
  }
}

let isConfigured = false

export const getCloudinaryConfig = () => getCloudinaryEnv()

export const getCloudinary = () => {
  const config = getCloudinaryEnv()
  if (!config.isConfigured) {
    return null
  }

  if (!isConfigured) {
    cloudinary.config({
      cloud_name: config.cloudName,
      api_key: config.apiKey,
      api_secret: config.apiSecret,
      secure: true,
    })
    isConfigured = true
  }

  return cloudinary
}
