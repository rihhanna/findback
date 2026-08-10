import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabase'
import { useNavigate } from 'react-router-dom'

export default function PostItem() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [error, setError] = useState('')
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)
  const categoryRef = useRef(null)
  
  const [formData, setFormData] = useState({
    type: 'lost',
    title: '',
    category: '',
    description: '',
    location: '',
    date_lost_or_found: '',
    status: 'active'
  })
  const [photos, setPhotos] = useState([])
  const [uploading, setUploading] = useState(false)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setIsCategoryOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name')
        
        if (error) {
          console.error('Error:', error)
          setError('Error loading categories')
          // Fallback
          setCategories([
            { id: 1, name: 'Phone', icon: '📱' },
            { id: 2, name: 'Wallet', icon: '👛' },
            { id: 3, name: 'ID Card', icon: '🪪' },
            { id: 4, name: 'Keys', icon: '🔑' },
            { id: 5, name: 'Bag', icon: '👜' },
            { id: 6, name: 'Document', icon: '📄' },
            { id: 7, name: 'Pet', icon: '🐾' },
            { id: 8, name: 'Clothing', icon: '👕' },
            { id: 9, name: 'Jewelry', icon: '💍' },
            { id: 10, name: 'Other', icon: '📦' },
          ])
        } else {
          if (data && data.length > 0) {
            setCategories(data)
          } else {
            // No data in table, use fallback
            setCategories([
              { id: 1, name: 'Phone', icon: '📱' },
              { id: 2, name: 'Wallet', icon: '👛' },
              { id: 3, name: 'ID Card', icon: '🪪' },
              { id: 4, name: 'Keys', icon: '🔑' },
              { id: 5, name: 'Bag', icon: '👜' },
              { id: 6, name: 'Document', icon: '📄' },
              { id: 7, name: 'Pet', icon: '🐾' },
              { id: 8, name: 'Clothing', icon: '👕' },
              { id: 9, name: 'Jewelry', icon: '💍' },
              { id: 10, name: 'Other', icon: '📦' },
            ])
          }
        }
        setCategoriesLoading(false)
      } catch (err) {
        console.error('Error:', err)
        setError('Error loading categories')
        setCategoriesLoading(false)
      }
    }
    
    fetchCategories()
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (!user) {
      alert('Please login first')
      return
    }
    
    setUploading(true)
    const uploadedUrls = []
    
    for (const file of files) {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`
      
      const { data, error } = await supabase.storage
        .from('item-photos')
        .upload(fileName, file)

      if (error) {
        console.error('Upload error:', error)
        continue
      }

      const { data: { publicUrl } } = supabase.storage
        .from('item-photos')
        .getPublicUrl(fileName)

      uploadedUrls.push(publicUrl)
    }

    setPhotos([...photos, ...uploadedUrls])
    setUploading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) {
      alert('Please login first')
      return
    }

    if (!formData.category) {
      alert('Please select a category')
      return
    }

    setLoading(true)

    const itemData = {
      ...formData,
      user_id: user.id,
      photo_urls: photos
    }

    const { error } = await supabase
      .from('items')
      .insert([itemData])

    if (error) {
      alert('Error: ' + error.message)
      console.error('Submit error:', error)
    } else {
      alert('Item posted successfully! 🎉')
      navigate('/browse')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-heading font-bold text-primary-500 mb-6">
          Report {formData.type === 'lost' ? 'Lost' : 'Found'} Item
        </h1>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-xl mb-4 text-sm">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-lg">
          {/* Item Type */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2 font-semibold">I am reporting a...</label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'lost' })}
                className={`px-6 py-2 rounded-lg transition ${
                  formData.type === 'lost'
                    ? 'bg-coral text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Lost Item
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'found' })}
                className={`px-6 py-2 rounded-lg transition ${
                  formData.type === 'found'
                    ? 'bg-green text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Found Item
              </button>
            </div>
          </div>

          {/* Title */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2 font-semibold">Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g. Black iPhone 13"
              required
            />
          </div>

          {/* Category - CUSTOM DROPDOWN THAT OPENS DOWNWARD */}
          <div className="mb-4 relative" ref={categoryRef}>
            <label className="block text-gray-700 mb-2 font-semibold">Category *</label>
            
            {/* Dropdown Trigger */}
            <div
              onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              className="input-field bg-white cursor-pointer flex items-center justify-between"
            >
              <span className={formData.category ? 'text-gray-800' : 'text-gray-400'}>
                {formData.category || 'Select a category'}
              </span>
              <svg 
                className={`w-5 h-5 text-primary-500 transition-transform duration-200 ${isCategoryOpen ? 'rotate-180' : ''}`}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            
            {/* Dropdown Menu - OPENS DOWNWARD */}
            {isCategoryOpen && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                {categoriesLoading ? (
                  <div className="p-4 text-center text-gray-500">Loading categories...</div>
                ) : (
                  categories.map((cat) => (
                    <div
                      key={cat.id}
                      onClick={() => {
                        setFormData({ ...formData, category: cat.name })
                        setIsCategoryOpen(false)
                      }}
                      className={`px-4 py-3 cursor-pointer hover:bg-primary-50 transition-colors flex items-center gap-2 ${
                        formData.category === cat.name ? 'bg-primary-50 text-primary-600 font-semibold' : ''
                      }`}
                    >
                      <span>{cat.icon || '📦'}</span>
                      <span>{cat.name}</span>
                      {formData.category === cat.name && (
                        <svg className="w-4 h-4 text-primary-500 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2 font-semibold">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input-field"
              rows="3"
              placeholder="Describe the item in detail..."
            />
          </div>

          {/* Location */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2 font-semibold">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g. Bakara Market, Mogadishu"
            />
          </div>

          {/* Date */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2 font-semibold">Date Lost/Found</label>
            <input
              type="date"
              name="date_lost_or_found"
              value={formData.date_lost_or_found}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          {/* Photos */}
          <div className="mb-4">
            <label className="block text-gray-700 mb-2 font-semibold">Photos</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handlePhotoUpload}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl"
            />
            {uploading && <p className="text-sm text-gray-500 mt-1">Uploading...</p>}
            {photos.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {photos.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`Upload ${i + 1}`}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || uploading}
            className="w-full btn-primary"
          >
            {loading ? 'Posting...' : `Post ${formData.type === 'lost' ? 'Lost' : 'Found'} Item`}
          </button>
        </form>
      </div>
    </div>
  )
}