import { v2 as cloudinary } from 'cloudinary'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const loadCloudinaryEnv = () => {
  const hasCloudinaryEnv =
    process.env.CLOUDINARY_URL ||
    process.env.CLOUDINARY_CLOUD_NAME ||
    process.env.CLOUDINARY_API_KEY ||
    process.env.CLOUDINARY_API_SECRET ||
    process.env.CLOUDINARY_SECRET

  if (hasCloudinaryEnv) return

  dotenv.config({ path: path.resolve(__dirname, '..', '.env') })
  dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') })
}

const parseCloudinaryUrl = (url) => {
  try {
    const parsed = new URL(url)
    const [apiKey, apiSecret] = parsed.username
      ? [parsed.username, parsed.password]
      : parsed.auth?.split(':') || []
    const cloudName = parsed.hostname
    return { cloudName, apiKey, apiSecret }
  } catch {
    return { cloudName: '', apiKey: '', apiSecret: '' }
  }
}

const getCloudinaryEnv = () => {
  loadCloudinaryEnv()
  const cloudinaryUrl = process.env.CLOUDINARY_URL || ''
  const parsedUrl = cloudinaryUrl ? parseCloudinaryUrl(cloudinaryUrl) : { cloudName: '', apiKey: '', apiSecret: '' }

  const cloudName =
    process.env.CLOUDINARY_CLOUD_NAME ||
    process.env.CLOUDINARY_CLOUD ||
    process.env.CLOUDINARY_CLOUDNAME ||
    parsedUrl.cloudName ||
    ''
  const apiKey =
    process.env.CLOUDINARY_API_KEY ||
    process.env.CLOUDINARY_KEY ||
    parsedUrl.apiKey ||
    ''
  const apiSecret =
    process.env.CLOUDINARY_API_SECRET ||
    process.env.CLOUDINARY_SECRET ||
    parsedUrl.apiSecret ||
    ''

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
