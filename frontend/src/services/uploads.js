import api from './api'

const MAX_FILE_SIZE = 10 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png']

export const uploadProductImage = async (file, productId, options = {}) => {
  if (!file) {
    throw new Error('No file selected')
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Only JPEG or PNG images are allowed')
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error('Image must be smaller than 10MB')
  }

  const formData = new FormData()
  formData.append('file', file)
  if (options.altText) {
    formData.append('alt_text', options.altText)
  }
  if (typeof options.position === 'number') {
    formData.append('position', String(options.position))
  }

  const uploadResponse = await api.post(`/uploads/product-image/${productId}`, formData)

  if (!uploadResponse.data?.success) {
    throw new Error(uploadResponse.data?.message || 'Failed to upload image')
  }

  return uploadResponse.data.data
}
