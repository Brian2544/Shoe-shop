import api from './api'

export const uploadProductImage = async (file, productId, options = {}) => {
  if (!file) {
    throw new Error('No file selected')
  }

  const signatureResponse = await api.post('/uploads/cloudinary-signature', {
    productId,
  })

  if (!signatureResponse.data?.success) {
    throw new Error(signatureResponse.data?.message || 'Failed to get upload signature')
  }

  const { timestamp, signature, apiKey, cloudName, folder } = signatureResponse.data.data

  const formData = new FormData()
  formData.append('file', file)
  formData.append('api_key', apiKey)
  formData.append('timestamp', timestamp)
  formData.append('signature', signature)
  formData.append('folder', folder)

  const uploadResponse = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  )

  const uploadData = await uploadResponse.json()

  if (!uploadResponse.ok) {
    throw new Error(uploadData?.error?.message || 'Cloudinary upload failed')
  }

  const payload = {
    url: uploadData.secure_url || uploadData.url,
    public_id: uploadData.public_id,
    width: uploadData.width || null,
    height: uploadData.height || null,
    format: uploadData.format || null,
    alt_text: options.altText || null,
    position: typeof options.position === 'number' ? options.position : 0,
  }

  const saveResponse = await api.post(`/admin/products/${productId}/images`, payload)

  if (!saveResponse.data?.success) {
    throw new Error(saveResponse.data?.message || 'Failed to save image metadata')
  }

  return saveResponse.data.data
}
