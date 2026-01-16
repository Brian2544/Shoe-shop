import { useParams } from 'react-router-dom'
import { useQuery } from 'react-query'
import { supabase } from '../lib/supabase'
import { Star } from 'lucide-react'

const Reviews = () => {
  const { productId } = useParams()

  const { data: reviews = [] } = useQuery(
    ['reviews', productId],
    async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*, profiles(*)')
        .eq('product_id', productId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data || []
    }
  )

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Product Reviews</h1>
        
        {reviews.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-gray-500">No reviews yet</p>
            <p className="text-gray-400 mt-2">Be the first to review this product!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold">
                      {review.profiles?.first_name || 'Anonymous'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {new Date(review.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < review.rating
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-gray-700 mb-4">{review.comment}</p>
                {review.photos && review.photos.length > 0 && (
                  <div className="flex gap-2">
                    {review.photos.map((photo, idx) => (
                      <img
                        key={idx}
                        src={photo}
                        alt={`Review photo ${idx + 1}`}
                        className="w-20 h-20 object-cover rounded"
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Reviews
