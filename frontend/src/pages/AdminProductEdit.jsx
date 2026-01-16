import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from 'react-query'
import toast from 'react-hot-toast'
import api from '../services/api'
import { uploadProductImage } from '../services/uploads'
import { ArrowLeft, RefreshCw, Trash2, UploadCloud } from 'lucide-react'

const AdminProductEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const replaceInputRef = useRef(null)
  const uploadInputRef = useRef(null)
  const [images, setImages] = useState([])
  const [altText, setAltText] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(null)
  const [replaceTarget, setReplaceTarget] = useState(null)

  const { data: productData, isLoading } = useQuery(
    ['admin-product', id],
    async () => {
      const response = await api.get(`/products/${id}`)
      return response.data.data
    },
    {
      enabled: !!id,
      onError: () => {
        toast.error('Failed to load product')
      },
    }
  )

  useEffect(() => {
    if (!productData) return
    if (productData.imageRecords?.length) {
      setImages(productData.imageRecords)
      return
    }
    if (productData.images?.length) {
      setImages(
        productData.images.map((url, index) => ({
          id: `legacy-${index}`,
          url,
          public_id: 'legacy',
          alt_text: null,
          position: index,
        }))
      )
    }
  }, [productData])

  const handleUpload = async (file) => {
    if (!file) return
    setIsUploading(true)
    try {
      const record = await uploadProductImage(file, id, {
        altText,
        position: images.length,
      })
      setImages((prev) => [...prev, record])
      setAltText('')
      toast.success('Image uploaded')
    } catch (error) {
      toast.error(error.message || 'Failed to upload image')
    } finally {
      setIsUploading(false)
      if (uploadInputRef.current) {
        uploadInputRef.current.value = ''
      }
    }
  }

  const handleDelete = async (imageId) => {
    if (!confirm('Delete this image?')) return
    setIsDeleting(imageId)
    try {
      const response = await api.delete(`/admin/products/${id}/images/${imageId}`)
      if (response.data.success) {
        setImages((prev) => prev.filter((img) => img.id !== imageId))
        toast.success('Image deleted')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete image')
    } finally {
      setIsDeleting(null)
    }
  }

  const handleReplace = (image) => {
    setReplaceTarget(image)
    replaceInputRef.current?.click()
  }

  const handleReplaceUpload = async (file) => {
    if (!file || !replaceTarget) return
    setIsUploading(true)
    try {
      const record = await uploadProductImage(file, id, {
        altText: replaceTarget.alt_text,
        position: replaceTarget.position || 0,
      })
      const deleteResponse = await api.delete(
        `/admin/products/${id}/images/${replaceTarget.id}`
      )
      if (deleteResponse.data.success) {
        setImages((prev) => {
          const withoutOld = prev.filter((img) => img.id !== replaceTarget.id)
          return [...withoutOld, record].sort((a, b) => (a.position || 0) - (b.position || 0))
        })
      } else {
        setImages((prev) => [...prev, record])
      }
      toast.success('Image replaced')
    } catch (error) {
      toast.error(error.message || 'Failed to replace image')
    } finally {
      setReplaceTarget(null)
      setIsUploading(false)
      if (replaceInputRef.current) {
        replaceInputRef.current.value = ''
      }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-orange border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    )
  }

  if (!productData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Product not found</p>
          <button onClick={() => navigate('/admin/dashboard')} className="btn-primary">
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100"
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{productData.name}</h1>
              <p className="text-sm text-gray-600">Manage product images</p>
            </div>
          </div>
          <button
            onClick={() => navigate(`/products/${productData.id}`)}
            className="btn-outline"
          >
            View Product
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload New Image</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Alt text (optional)
              </label>
              <input
                type="text"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                className="input-field w-full"
                placeholder="e.g. Side view of the sneaker"
              />
            </div>
            <div className="flex flex-col gap-2">
              <input
                ref={uploadInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleUpload(e.target.files?.[0])}
                className="hidden"
              />
              <button
                onClick={() => uploadInputRef.current?.click()}
                disabled={isUploading}
                className="btn-primary flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <UploadCloud className="w-4 h-4" />
                {isUploading ? 'Uploading...' : 'Select Image'}
              </button>
              <p className="text-xs text-gray-500">
                JPEG/PNG recommended. Max 10MB.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Product Gallery</h2>
            <span className="text-sm text-gray-500">{images.length} images</span>
          </div>

          {images.length === 0 ? (
            <div className="border border-dashed border-gray-300 rounded-lg p-10 text-center">
              <p className="text-gray-600 mb-2">No images uploaded yet</p>
              <p className="text-sm text-gray-400">Upload the first image to show on the storefront.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {images
                .slice()
                .sort((a, b) => (a.position || 0) - (b.position || 0))
                .map((image) => {
                  const isLegacy = String(image.id).startsWith('legacy-')
                  return (
                  <div key={image.id} className="border rounded-lg overflow-hidden">
                    <div className="aspect-square bg-gray-100">
                      <img
                        src={image.url}
                        alt={image.alt_text || productData.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4 space-y-2">
                      <p className="text-xs text-gray-500 truncate">{image.public_id}</p>
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => handleReplace(image)}
                          className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          disabled={isUploading || isLegacy}
                        >
                          <RefreshCw className="w-4 h-4" />
                          Replace
                        </button>
                        <button
                          onClick={() => handleDelete(image.id)}
                          className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1"
                          disabled={isDeleting === image.id || isLegacy}
                        >
                          <Trash2 className="w-4 h-4" />
                          {isDeleting === image.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                      {isLegacy && (
                        <p className="text-xs text-amber-600">
                          Legacy image. Upload a new image to replace it.
                        </p>
                      )}
                    </div>
                  </div>
                )})}
            </div>
          )}
        </div>
      </div>

      <input
        ref={replaceInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleReplaceUpload(e.target.files?.[0])}
        className="hidden"
      />
    </div>
  )
}

export default AdminProductEdit
