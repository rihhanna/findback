import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabase'
import { Link, useNavigate } from 'react-router-dom'
import { 
  User, 
  Mail, 
  Phone, 
  Edit2, 
  Save, 
  X, 
  Camera,
  Package,
  CheckCircle,
  Clock,
  ArrowRight,
  LogOut,
  Loader2,
  MapPin,
  Calendar,
  AlertCircle
} from 'lucide-react'

export default function Profile() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', phone: '' })
  const [saving, setSaving] = useState(false)
  const [activeItems, setActiveItems] = useState([])
  const [returnedItems, setReturnedItems] = useState([])
  const [loadingItems, setLoadingItems] = useState(true)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const fileInputRef = useRef(null)
  const [stats, setStats] = useState({
    totalPosts: 0,
    activePosts: 0,
    returnedPosts: 0,
    messagesReceived: 0
  })

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetchProfile()
    fetchUserItems()
    fetchStats()
  }, [user])

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error

      setProfile(data)
      setEditForm({
        name: data?.name || '',
        phone: data?.phone || ''
      })
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserItems = async () => {
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      const active = data?.filter(item => item.status === 'active') || []
      const returned = data?.filter(item => item.status === 'returned') || []

      setActiveItems(active)
      setReturnedItems(returned)
    } catch (error) {
      console.error('Error fetching items:', error)
    } finally {
      setLoadingItems(false)
    }
  }

  const fetchStats = async () => {
    try {
      // Get total items
      const { count: totalItems } = await supabase
        .from('items')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      // Get active items
      const { count: activeItems } = await supabase
        .from('items')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'active')

      // Get returned items
      const { count: returnedItems } = await supabase
        .from('items')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'returned')

      // Get messages received
      const { count: messagesReceived } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', user.id)

      setStats({
        totalPosts: totalItems || 0,
        activePosts: activeItems || 0,
        returnedPosts: returnedItems || 0,
        messagesReceived: messagesReceived || 0
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: editForm.name,
          phone: editForm.phone,
          updated_at: new Date()
        })
        .eq('id', user.id)

      if (error) throw error

      setProfile({ ...profile, ...editForm })
      setEditing(false)
      alert('Profile updated successfully! ✅')
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingAvatar(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `avatars/${user.id}.${fileExt}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id)

      if (updateError) throw updateError

      setProfile({ ...profile, avatar_url: publicUrl })
      alert('Profile photo updated! 📸')
    } catch (error) {
      console.error('Error uploading avatar:', error)
      alert('Failed to upload photo. Please try again.')
    } finally {
      setUploadingAvatar(false)
      fileInputRef.current.value = ''
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* ============ PROFILE CARD ============ */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          {/* Cover Photo */}
          <div className="h-32 bg-gradient-to-r from-primary-500 to-primary-700 relative">
            {/* Avatar - centered on the cover */}
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
                      {getInitials(profile?.name || user?.email)}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-primary-500 text-white p-1.5 rounded-full shadow-lg hover:bg-primary-600 transition"
                  disabled={uploadingAvatar}
                >
                  {uploadingAvatar ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Camera size={16} />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </div>
            </div>

            {/* Edit Button */}
            <button
              onClick={() => setEditing(!editing)}
              className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-white/30 transition flex items-center gap-1"
            >
              {editing ? <X size={16} /> : <Edit2 size={16} />}
              {editing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>

          {/* Profile Info */}
          <div className="pt-14 pb-6 px-8">
            {editing ? (
              // Edit Mode
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="+252 6X XXX XXXX"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="bg-primary-500 text-white px-6 py-2 rounded-xl font-semibold hover:bg-primary-600 transition flex items-center gap-2"
                  >
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setEditing(false)
                      setEditForm({ name: profile?.name || '', phone: profile?.phone || '' })
                    }}
                    className="border border-gray-300 text-gray-600 px-6 py-2 rounded-xl font-semibold hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              // View Mode
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{profile?.name || user?.email}</h2>
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Mail size={16} /> {user?.email}
                  </span>
                  {profile?.phone && (
                    <span className="flex items-center gap-1">
                      <Phone size={16} /> {profile.phone}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock size={16} /> Member since {new Date(user?.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ============ STATS ============ */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-primary-500">{stats.totalPosts}</div>
            <div className="text-xs text-gray-500">Total Posts</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-amber-500">{stats.activePosts}</div>
            <div className="text-xs text-gray-500">Active</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-green-500">{stats.returnedPosts}</div>
            <div className="text-xs text-gray-500">Returned</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-primary-500">{stats.messagesReceived}</div>
            <div className="text-xs text-gray-500">Messages</div>
          </div>
        </div>

        {/* ============ ITEMS SECTION ============ */}
        <div className="space-y-6">
          {/* Active Items */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package size={20} className="text-amber-500" />
                <h3 className="font-semibold text-gray-800">Active Items</h3>
                <span className="text-xs bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full">{activeItems.length}</span>
              </div>
              <Link to="/browse?filter=mine" className="text-xs text-primary-500 hover:underline">
                View all →
              </Link>
            </div>
            <div className="p-4">
              {loadingItems ? (
                <div className="text-center py-8 text-gray-400">Loading...</div>
              ) : activeItems.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Package size={40} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No active items</p>
                  <Link to="/post" className="text-xs text-primary-500 hover:underline">
                    Post your first item →
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeItems.slice(0, 5).map((item) => (
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
                      <ArrowRight size={18} className="text-gray-300 group-hover:text-primary-500 transition" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Returned Items */}
          {returnedItems.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle size={20} className="text-green-500" />
                  <h3 className="font-semibold text-gray-800">Returned Items</h3>
                  <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">{returnedItems.length}</span>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {returnedItems.slice(0, 5).map((item) => (
                    <Link
                      key={item.id}
                      to={`/item/${item.id}`}
                      className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition group opacity-70 hover:opacity-100"
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
                          <span className="text-sm font-medium text-gray-600 truncate">{item.title}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                          {item.location && (
                            <span className="flex items-center gap-1">
                              <MapPin size={12} /> {item.location}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <CheckCircle size={12} /> Returned
                          </span>
                        </div>
                      </div>
                      <ArrowRight size={18} className="text-gray-300 group-hover:text-primary-500 transition" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ============ SIGN OUT ============ */}
        <div className="mt-8">
          <button
            onClick={signOut}
            className="w-full bg-white border border-red-200 text-red-500 py-3 rounded-xl font-semibold hover:bg-red-50 transition flex items-center justify-center gap-2"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>

      </div>
    </div>
  )
}