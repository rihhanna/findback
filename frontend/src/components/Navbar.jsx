import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Search, Home, PlusCircle, MessageCircle, User, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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
                <NavLink to="/chat" className="block py-2 px-3 hover:bg-gray-50 rounded-lg">
                  💬 Messages
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