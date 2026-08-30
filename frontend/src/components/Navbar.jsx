import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useNotifications } from '../context/NotificationContext'
import { 
  Search, 
  Home, 
  PlusCircle, 
  MessageCircle, 
  User, 
  LogOut, 
  Menu, 
  X,
  Bell
} from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const { unreadCount, notifications, markAsRead, markAllAsRead } = useNotifications()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const notificationRef = useRef(null)

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const isActive = (path) => location.pathname === path

  const NavLink = ({ to, children, className = "" }) => (
    <Link
      to={to}
      className={`transition-colors duration-200 ${
        isActive(to) 
          ? 'text-primary-600 font-semibold' 
          : 'text-gray-600 hover:text-primary-500'
      } ${className}`}
      onClick={() => setIsMobileMenuOpen(false)}
    >
      {children}
    </Link>
  )

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date
    
    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago'
    if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago'
    return date.toLocaleDateString()
  }

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-2xl md:text-3xl font-heading font-extrabold text-primary-500 group-hover:text-primary-600 transition-colors">
              Find
            </span>
            <span className="text-2xl md:text-3xl font-heading font-extrabold text-amber-400 group-hover:text-amber-500 transition-colors">
              Back
            </span>
            <span className="text-xs bg-primary-50 text-primary-600 px-2 py-0.5 rounded-full font-semibold hidden sm:inline">
              Beta
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <NavLink to="/">
              <Home size={20} />
            </NavLink>
            <NavLink to="/browse">
              <Search size={20} />
            </NavLink>
            
            {user ? (
              <>
                <NavLink to="/post" className="bg-primary-500 text-white px-4 py-2 rounded-xl hover:bg-primary-600 transition-all duration-200 flex items-center gap-1 text-sm font-semibold shadow-md hover:shadow-lg">
                  <PlusCircle size={16} />
                  Post
                </NavLink>
                <NavLink to="/chat">
                  <MessageCircle size={20} />
                </NavLink>
                
                {/* 🔔 Notification Bell */}
                <div className="relative" ref={notificationRef}>
                  <button
                    onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                    className="relative text-gray-600 hover:text-primary-500 transition-colors p-1"
                  >
                    <Bell size={22} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown */}
                  {isNotificationOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
                        <h3 className="font-semibold text-gray-800 text-sm">Notifications</h3>
                        {unreadCount > 0 && (
                          <button
                            onClick={() => {
                              markAllAsRead()
                              setIsNotificationOpen(false)
                            }}
                            className="text-xs text-primary-500 hover:underline"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>

                      <div className="max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="text-center py-8 text-gray-400">
                            <Bell size={32} className="mx-auto mb-2 opacity-30" />
                            <p className="text-sm">No notifications</p>
                          </div>
                        ) : (
                          notifications.slice(0, 10).map((notification) => (
                            <Link
                              key={notification.id}
                              to={notification.link}
                              onClick={() => {
                                markAsRead(notification.id)
                                setIsNotificationOpen(false)
                              }}
                              className={`block px-4 py-3 hover:bg-gray-50 transition border-b border-gray-50 last:border-0 ${
                                !notification.read ? 'bg-primary-50' : ''
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                                  !notification.read ? 'bg-primary-500' : 'bg-gray-300'
                                }`}></div>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm ${!notification.read ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>
                                    {notification.title}
                                  </p>
                                  <p className="text-xs text-gray-400 truncate">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-0.5">
                                    {formatTime(notification.created_at)}
                                  </p>
                                </div>
                              </div>
                            </Link>
                          ))
                        )}
                      </div>

                      {notifications.length > 10 && (
                        <Link
                          to="/chat"
                          onClick={() => setIsNotificationOpen(false)}
                          className="block text-center text-xs text-primary-500 py-2 border-t border-gray-100 hover:bg-gray-50 transition font-medium"
                        >
                          View all notifications
                        </Link>
                      )}
                    </div>
                  )}
                </div>

                <NavLink to="/profile">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold text-sm">
                    {user.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                </NavLink>
                <button
                  onClick={signOut}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <LogOut size={20} />
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className="font-medium">
                  Login
                </NavLink>
                <Link
                  to="/register"
                  className="bg-primary-500 text-white px-5 py-2 rounded-xl hover:bg-primary-600 transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg"
                >
                  Sign Up Free
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden text-gray-600 hover:text-primary-500 transition-colors"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-gray-100 space-y-3">
            <NavLink to="/" className="block py-2 px-3 hover:bg-gray-50 rounded-lg">
              🏠 Home
            </NavLink>
            <NavLink to="/browse" className="block py-2 px-3 hover:bg-gray-50 rounded-lg">
              🔍 Browse
            </NavLink>
            
            {user ? (
              <>
                <NavLink to="/post" className="block py-2 px-3 hover:bg-gray-50 rounded-lg bg-primary-50 text-primary-600 font-semibold">
                  ➕ Post Item
                </NavLink>
                <NavLink to="/chat" className="block py-2 px-3 hover:bg-gray-50 rounded-lg flex items-center justify-between">
                  💬 Messages
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </NavLink>
                <NavLink to="/profile" className="block py-2 px-3 hover:bg-gray-50 rounded-lg">
                  👤 Profile
                </NavLink>
                <button
                  onClick={() => {
                    signOut()
                    setIsMobileMenuOpen(false)
                  }}
                  className="block w-full text-left py-2 px-3 hover:bg-red-50 text-red-500 rounded-lg"
                >
                  🚪 Logout
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className="block py-2 px-3 hover:bg-gray-50 rounded-lg">
                  🔐 Login
                </NavLink>
                <Link
                  to="/register"
                  className="block py-2 px-3 bg-primary-500 text-white rounded-lg text-center font-semibold hover:bg-primary-600 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  🚀 Sign Up Free
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}