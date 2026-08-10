import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import { Link } from 'react-router-dom'

export default function Browse() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [type, setType] = useState('all')
  const [categories, setCategories] = useState([])

  useEffect(() => {
    fetchCategories()
    fetchItems()
  }, [])

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*')
    setCategories(data || [])
  }

  const fetchItems = async () => {
    setLoading(true)
    let query = supabase
      .from('items')
      .select(`
        *,
        profiles:user_id (name, avatar_url)
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (type !== 'all') {
      query = query.eq('type', type)
    }

    if (category) {
      query = query.eq('category', category)
    }

    if (search) {
      query = query.ilike('title', `%${search}%`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching items:', error)
    } else {
      setItems(data || [])
    }
    setLoading(false)
  }

  const handleFilter = () => {
    fetchItems()
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-heading font-bold text-primary-600 mb-6">
          Browse Items
        </h1>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.icon} {cat.name}</option>
              ))}
            </select>

            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="all">All Types</option>
              <option value="lost">Lost</option>
              <option value="found">Found</option>
            </select>

            <button
              onClick={handleFilter}
              className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition"
            >
              Apply Filters
            </button>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-500">No items found</p>
            <Link to="/post" className="text-primary-500 hover:underline mt-2 block">
              Be the first to post!
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {items.map(item => (
              <Link to={`/item/${item.id}`} key={item.id}>
                <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition overflow-hidden">
                  {item.photo_urls && item.photo_urls.length > 0 && (
                    <img
                      src={item.photo_urls[0]}
                      alt={item.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        item.type === 'lost' 
                          ? 'bg-red-100 text-red-600' 
                          : 'bg-green-100 text-green-600'
                      }`}>
                        {item.type === 'lost' ? '🔴 Lost' : '🟢 Found'}
                      </span>
                      <span className="text-sm text-gray-500">
                        {item.category}
                      </span>
                    </div>
                    <h3 className="font-semibold text-lg mt-2 truncate">{item.title}</h3>
                    <p className="text-gray-600 text-sm truncate">{item.location}</p>
                    <p className="text-gray-400 text-xs mt-2">
                      {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}