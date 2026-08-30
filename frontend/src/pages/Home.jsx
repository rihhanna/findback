import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useNotifications } from '../context/NotificationContext'
import { supabase } from '../services/supabase'
import { FileText, Search, MessageCircle, ArrowRight } from 'lucide-react'

export default function Home() {
  const { user } = useAuth()
  const { requestNotificationPermission } = useNotifications()
  const [recentItems, setRecentItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRecentItems()
  }, [])

  // ✅ Request notification permission when user is logged in
  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => {
        requestNotificationPermission()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [user, requestNotificationPermission])

  const fetchRecentItems = async () => {
    try {
      const { data, error } = await supabase
        .from('items')
        .select(`
          *,
          profiles:user_id (name)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(6)

      if (error) {
        console.error('Error fetching items:', error)
      } else {
        setRecentItems(data || [])
      }
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const truncateText = (text, maxLength = 80) => {
    if (!text) return ''
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400 rounded-full blur-3xl transform translate-x-32 -translate-y-32"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-400 rounded-full blur-3xl transform -translate-x-32 translate-y-32"></div>
        </div>
        
        <div className="relative max-w-6xl mx-auto px-4 py-20 md:py-28 text-center">
          <div className="animate-fade-in-up">
            <div className="inline-block bg-white/10 backdrop-blur-sm px-6 py-2 rounded-full text-sm font-semibold mb-6 border border-white/20">
              🌍 Community-Powered Platform
            </div>
            
            <h1 className="text-4xl md:text-6xl font-heading font-extrabold leading-tight mb-4">
              Lost Something? <br />
              <span className="text-amber-400">Find It Back.</span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-10 opacity-90 max-w-2xl mx-auto">
              Community-powered lost and found platform to reunite people with their belongings
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/post" className="btn-amber inline-flex items-center justify-center gap-2">
                📝 I lost something
                <ArrowRight size={20} />
              </Link>
              <Link to="/post" className="btn-secondary inline-flex items-center justify-center gap-2 text-primary-700">
                🔍 I found something
              </Link>
            </div>
            
            {!user && (
              <p className="mt-6 text-sm opacity-80">
                <Link to="/register" className="underline hover:text-amber-400 transition-colors font-semibold">
                  Sign up
                </Link>
                {' '}to post items and start chatting
              </p>
            )}
          </div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 40L60 50C120 60 240 80 360 80C480 80 600 60 720 50C840 40 960 40 1080 50C1200 60 1320 80 1380 90L1440 100V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V40Z" fill="#F9FAFB"/>
          </svg>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary-600 mb-3">
            How FindBack Works
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Three simple steps to reunite people with their belongings
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="card p-8 text-center group hover:transform hover:-translate-y-2 transition-all duration-300">
            <div className="w-20 h-20 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:bg-primary-100 transition-colors">
              <FileText className="w-10 h-10 text-primary-500" />
            </div>
            <h3 className="text-xl font-heading font-bold text-gray-800 mb-2">Report Quickly</h3>
            <p className="text-gray-600 leading-relaxed">Post lost or found items in seconds with photos, description, and location</p>
          </div>

          <div className="card p-8 text-center group hover:transform hover:-translate-y-2 transition-all duration-300">
            <div className="w-20 h-20 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:bg-amber-100 transition-colors">
              <Search className="w-10 h-10 text-amber-400" />
            </div>
            <h3 className="text-xl font-heading font-bold text-gray-800 mb-2">Smart Search</h3>
            <p className="text-gray-600 leading-relaxed">Find items by category, location, keyword, or date range</p>
          </div>

          <div className="card p-8 text-center group hover:transform hover:-translate-y-2 transition-all duration-300">
            <div className="w-20 h-20 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:bg-green-100 transition-colors">
              <MessageCircle className="w-10 h-10 text-green-500" />
            </div>
            <h3 className="text-xl font-heading font-bold text-gray-800 mb-2">Chat Safely</h3>
            <p className="text-gray-600 leading-relaxed">Connect with finders or owners without exposing personal contact details</p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center">
            <div className="text-3xl font-heading font-bold text-primary-500">500+</div>
            <div className="text-sm text-gray-500">Items Reunited</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-heading font-bold text-amber-400">98%</div>
            <div className="text-sm text-gray-500">Success Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-heading font-bold text-green-500">1,200+</div>
            <div className="text-sm text-gray-500">Active Users</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-heading font-bold text-primary-500">4.8⭐</div>
            <div className="text-sm text-gray-500">User Rating</div>
          </div>
        </div>

        {/* Recent Reports */}
        <div className="mt-16">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-heading font-bold text-gray-800">Recent reports</h2>
              <p className="text-sm text-gray-500">Fresh posts from your community.</p>
            </div>
            <Link to="/browse" className="text-sm text-primary-500 hover:text-primary-600 font-medium hover:underline">View all →</Link>
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading reports...</div>
          ) : recentItems.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-xl shadow-sm border border-gray-100">
              <p className="text-gray-500">No reports yet. Be the first to post!</p>
              <Link to="/post" className="text-primary-500 hover:underline text-sm mt-2 inline-block">Post an item →</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {recentItems.map((item) => (
                <Link key={item.id} to={`/item/${item.id}`} className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-primary-200 transform hover:-translate-y-1">
                  <div className="relative h-48 bg-gray-200 overflow-hidden">
                    {item.photo_urls && item.photo_urls.length > 0 ? (
                      <img src={item.photo_urls[0]} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <span className="text-gray-400 text-sm">No image</span>
                      </div>
                    )}
                    <span className={`absolute top-3 left-3 text-xs font-bold px-3 py-1 rounded-full shadow-md ${item.type === 'lost' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
                      {item.type.toUpperCase()}
                    </span>
                    <span className="absolute top-3 right-3 text-xs font-medium px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-gray-700 shadow-md">
                      {item.category}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="text-md font-semibold text-gray-800 mb-1 line-clamp-1 group-hover:text-primary-500 transition-colors">{item.title}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{truncateText(item.description, 60)}</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
                      {item.location && (
                        <span className="flex items-center gap-1"><span>📍</span> {item.location.length > 15 ? item.location.substring(0, 15) + '...' : item.location}</span>
                      )}
                      {item.date_lost_or_found && (
                        <span className="flex items-center gap-1"><span>📅</span> {item.date_lost_or_found}</span>
                      )}
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <span>👤</span>
                        <Link to={`/profile/${item.user_id}`} className="hover:text-primary-500 hover:underline transition">
                          {item.profiles?.name || 'Anonymous'}
                        </Link>
                      </span>
                      <span className="text-xs text-primary-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">View details →</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="mt-16 bg-gradient-to-r from-primary-500 to-primary-700 rounded-2xl p-8 md:p-12 text-white text-center">
          <h3 className="text-2xl md:text-3xl font-heading font-bold mb-3">Ready to find your lost item?</h3>
          <p className="opacity-90 mb-6 max-w-lg mx-auto">Join thousands of community members helping each other reunite with what matters most</p>
          <Link to={user ? "/post" : "/register"} className="inline-block bg-amber-400 text-primary-900 px-8 py-3 rounded-xl font-bold hover:bg-amber-500 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
            {user ? "Report an Item Now" : "Get Started — It's Free"}
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-8">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xl font-heading font-bold text-primary-500">Find</span>
              <span className="text-xl font-heading font-bold text-amber-400">Back</span>
              <span className="text-xs text-gray-400 ml-1">v1.0</span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <Link to="/" className="text-gray-600 hover:text-primary-500 transition">Home</Link>
              <Link to="/browse" className="text-gray-600 hover:text-primary-500 transition">Browse</Link>
              <Link to="/post" className="text-gray-600 hover:text-primary-500 transition">Post</Link>
              {!user ? (
                <>
                  <Link to="/login" className="text-gray-600 hover:text-primary-500 transition">Login</Link>
                  <Link to="/register" className="bg-primary-500 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-primary-600 transition">Sign Up</Link>
                </>
              ) : (
                <Link to="/profile" className="text-gray-600 hover:text-primary-500 transition">Profile</Link>
              )}
            </div>
            <div className="text-sm text-gray-400">Powered by <span className="text-primary-500 font-medium">Rehana</span> 🚀</div>
          </div>
          <div className="border-t border-gray-100 mt-6 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400">
            <span>© {new Date().getFullYear()} FindBack. All rights reserved.</span>
            <div className="flex gap-4">
              <a href="#" className="hover:text-primary-500 transition">Privacy</a>
              <a href="#" className="hover:text-primary-500 transition">Terms</a>
              <a href="#" className="hover:text-primary-500 transition">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}