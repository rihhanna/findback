import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { useAuth } from '../context/AuthContext'
import { 
  User, 
  Mail, 
  Phone, 
  Package,
  CheckCircle,
  Clock,
  ArrowLeft,
  Loader2,
  MapPin,
  Calendar,
  MessageCircle
} from 'lucide-react'

export default function PublicProfile() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    returned: 0
  })
  const [isOwnProfile, setIsOwnProfile] = useState(false)

  useEffect(() => {
    if (userId) {
      fetchProfile()
      fetchUserItems()
    }
  }, [userId])

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error

      setProfile(data)
      setIsOwnProfile(user?.id === userId)
    } catch (error) {
      console.error('Error fetching profile:', error)
      navigate('/browse')
    } finally {
      setLoading(false)
    }
  }

  const fetchUserItems = async () => {
    try {
      // Get all items
      const { data: itemsData, error: itemsError } = await supabase
        .from('items')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (itemsError) throw itemsError

      setItems(itemsData || [])

      // Calculate stats
      const active = itemsData?.filter(item => item.status === 'active') || []
      const returned = itemsData?.filter(item => item.status === 'returned') || []

      setStats({
        total: itemsData?.length || 0,
        active: active.length,
        returned: returned.length
      })
    } catch (error) {
      console.error('Error fetching items:', error)
    }
  }

  const getInitials = (name) => {
    return name?.charAt(0)?.toUpperCase() || '?'
  }

  const getStatusBadge = (type, status) => {
    if (status === 'returned') {
      return <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-medium">✅ Returned</span>
    }
    return (
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
        type === 'lost' 
          ? 'bg-red-100 text-red-600' 
          : 'bg-green-100 text-green-600'
      }`}>
        {type === 'lost' ? '🔴 Lost' : '🟢 Found'}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-xl text-gray-500">User not found</p>
          <Link to="/browse" className="text-primary-500 hover:underline mt-2 block">
            ← Back to browse
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Back Button */}
        <Link 
          to="/browse" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-500 transition-colors mb-4 text-sm"
        >
          <ArrowLeft size={18} />
          Back to browse
        </Link>

        {/* ============ PROFILE CARD ============ */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          {/* Cover Photo */}
          <div className="h-32 bg-gradient-to-r from-primary-500 to-primary-700 relative">
            {/* Avatar */}
            <div className="absolute -bottom-12 left-8">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-white p-1 shadow-xl">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile?.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-3xl font-bold">
                      {getInitials(profile?.name || 'User')}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Button */}
            {!isOwnProfile && user && (
              <Link
                to={`/chat?user=${userId}`}
                className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/30 transition flex items-center gap-2"
              >
                <MessageCircle size={16} />
                Contact
              </Link>
            )}
          </div>

          {/* Profile Info */}
          <div className="pt-14 pb-6 px-8">
            <h2 className="text-2xl font-bold text-gray-800">{profile?.name || 'Anonymous User'}</h2>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
              {profile?.phone && (
                <span className="flex items-center gap-1">
                  <Phone size={16} /> {profile.phone}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock size={16} /> Member since {new Date(profile?.created_at).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <Package size={16} /> {stats.total} items posted
              </span>
            </div>
          </div>
        </div>

        {/* ============ STATS ============ */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-primary-500">{stats.total}</div>
            <div className="text-xs text-gray-500">Total Posts</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-amber-500">{stats.active}</div>
            <div className="text-xs text-gray-500">Active</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-green-500">{stats.returned}</div>
            <div className="text-xs text-gray-500">Returned</div>
          </div>
        </div>

        {/* ============ USER'S ITEMS ============ */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package size={20} className="text-primary-500" />
              <h3 className="font-semibold text-gray-800">
                {profile?.name || 'User'}'s Items
              </h3>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{items.length}</span>
            </div>
          </div>
          <div className="p-4">
            {items.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Package size={40} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No items posted yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <Link
                    key={item.id}
                    to={`/item/${item.id}`}
                    className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition group"
                  >
                    <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                      {item.photo_urls && item.photo_urls.length > 0 ? (
                        <img
                          src={item.photo_urls[0]}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <Package size={24} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(item.type, item.status)}
                        <span className="text-sm font-medium text-gray-800 truncate">{item.title}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                        {item.location && (
                          <span className="flex items-center gap-1">
                            <MapPin size={12} /> {item.location}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar size={12} /> {new Date(item.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}