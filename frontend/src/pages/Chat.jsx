import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabase'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Send, 
  ArrowLeft, 
  Clock, 
  CheckCheck,
  Loader2,
  MessageCircle,
  Search,
  Users,
  Package
} from 'lucide-react'

export default function Chat() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const messagesEndRef = useRef(null)
  const chatContainerRef = useRef(null)

  // Fetch all conversations
  useEffect(() => {
    if (user) {
      fetchConversations()
    }
  }, [user])

  // Fetch messages when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation)
    }
  }, [selectedConversation])

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // ✅ FIXED: Subscribe to new messages - Listen to ALL messages for this conversation
  useEffect(() => {
    if (!selectedConversation || !user) return

    const channel = supabase
      .channel(`messages_${selectedConversation.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          // ✅ Filter by item_id instead of sender_id
          filter: `item_id=eq.${selectedConversation.items?.[0]?.id || selectedConversation.item_id}`
        },
        (payload) => {
          console.log('📩 New message received:', payload.new)
          // Add new message to state
          setMessages(prev => {
            // Avoid duplicates
            if (prev.some(m => m.id === payload.new.id)) return prev
            return [...prev, payload.new]
          })
          // Update last message in conversation list
          updateConversationLastMessage(payload.new)
        }
      )
      .subscribe((status) => {
        console.log('📡 Subscription status:', status)
      })

    return () => {
      channel.unsubscribe()
    }
  }, [selectedConversation, user])

  const fetchConversations = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          item:item_id (id, title, photo_urls, type, status),
          sender:sender_id (id, name, avatar_url),
          receiver:receiver_id (id, name, avatar_url)
        `)
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: false })

      if (error) throw error

      const conversationMap = new Map()

      data?.forEach(msg => {
        const otherUser = msg.sender_id === user.id ? msg.receiver : msg.sender
        const key = otherUser?.id

        if (!conversationMap.has(key)) {
          conversationMap.set(key, {
            id: key,
            other_user: otherUser,
            last_message: msg.message_text,
            last_time: msg.created_at,
            unread: msg.sender_id !== user.id && !msg.read_status,
            items: new Set(),
            messages: []
          })
        }

        const conv = conversationMap.get(key)
        if (msg.item_id) {
          conv.items.add(msg.item_id)
        }
      })

      const conversationArray = await Promise.all(
        Array.from(conversationMap.values()).map(async (conv) => {
          const itemIds = Array.from(conv.items)
          let itemDetails = []
          
          if (itemIds.length > 0) {
            const { data: items } = await supabase
              .from('items')
              .select('id, title, type, photo_urls, status')
              .in('id', itemIds)
            itemDetails = items || []
          }

          return {
            ...conv,
            items: itemDetails,
            itemCount: itemDetails.length,
            item_id: itemDetails[0]?.id // Store first item ID for subscription
          }
        })
      )

      conversationArray.sort((a, b) => 
        new Date(b.last_time) - new Date(a.last_time)
      )

      setConversations(conversationArray)
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (conversation) => {
    try {
      // Get all messages between these two users
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .or(`sender_id.eq.${conversation.other_user.id},receiver_id.eq.${conversation.other_user.id}`)
        .order('created_at', { ascending: true })

      if (error) throw error

      setMessages(data || [])
      
      // Mark messages as read
      const unreadMessages = data?.filter(
        msg => msg.sender_id !== user.id && !msg.read_status
      )

      if (unreadMessages?.length > 0) {
        await supabase
          .from('messages')
          .update({ read_status: true })
          .in('id', unreadMessages.map(m => m.id))
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  // ✅ FIXED: Send message - Add to state immediately
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    setSending(true)
    try {
      const itemId = selectedConversation.items?.[0]?.id

      if (!itemId) {
        alert('No item associated with this conversation')
        setSending(false)
        return
      }

      // Create temp message for optimistic update
      const tempMessage = {
        id: `temp-${Date.now()}`,
        item_id: itemId,
        sender_id: user.id,
        receiver_id: selectedConversation.other_user.id,
        message_text: newMessage.trim(),
        created_at: new Date().toISOString(),
        read_status: false
      }

      // ✅ Add to messages immediately (optimistic update)
      setMessages(prev => [...prev, tempMessage])

      // Clear input
      const messageText = newMessage.trim()
      setNewMessage('')

      // Send to database
      const { error } = await supabase
        .from('messages')
        .insert([{
          item_id: itemId,
          sender_id: user.id,
          receiver_id: selectedConversation.other_user.id,
          message_text: messageText
        }])

      if (error) {
        console.error('Send error:', error)
        // Remove temp message on error
        setMessages(prev => prev.filter(m => m.id !== tempMessage.id))
        alert('Failed to send message. Please try again.')
      }

    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const scrollToBottom = () => {
    setTimeout(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
      }
    }, 100)
  }

  const updateConversationLastMessage = (newMsg) => {
    setConversations(prev => {
      const updated = [...prev]
      const index = updated.findIndex(c => 
        c.other_user?.id === newMsg.sender_id || 
        c.other_user?.id === newMsg.receiver_id
      )
      if (index !== -1) {
        updated[index] = {
          ...updated[index],
          last_message: newMsg.message_text,
          last_time: newMsg.created_at,
          unread: newMsg.sender_id !== user.id && !newMsg.read_status
        }
      }
      return updated
    })
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date
    
    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago'
    if (diff < 86400000) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    return date.toLocaleDateString()
  }

  const getOtherUserName = (conversation) => {
    return conversation.other_user?.name || 'Unknown User'
  }

  const getInitials = (name) => {
    return name?.charAt(0)?.toUpperCase() || '?'
  }

  const filteredConversations = conversations.filter(conv =>
    getOtherUserName(conv).toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto" />
          <p className="mt-4 text-gray-500">Loading conversations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto h-screen max-h-[calc(100vh-4rem)]">
        <div className="bg-white shadow-lg h-full rounded-xl overflow-hidden flex flex-col md:flex-row">
          
          {/* ============ CONVERSATIONS SIDEBAR ============ */}
          <div className={`w-full md:w-80 lg:w-96 border-r border-gray-200 flex flex-col ${
            selectedConversation ? 'hidden md:flex' : 'flex'
          }`}>
            <div className="p-4 border-b border-gray-200 bg-primary-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white">
                  <MessageCircle size={20} />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-800">Messages</h2>
                  <p className="text-xs text-gray-500">{conversations.length} conversations</p>
                </div>
              </div>
            </div>

            <div className="p-3 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                  <MessageCircle size={48} className="mb-3 opacity-50" />
                  <p className="text-sm font-medium">No conversations</p>
                  <p className="text-xs">Start by contacting someone about an item</p>
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-all duration-200 border-b border-gray-50 ${
                      selectedConversation?.id === conv.id ? 'bg-primary-50 border-l-4 border-l-primary-500' : ''
                    }`}
                  >
                    <div 
                      className="relative flex-shrink-0 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/profile/${conv.other_user?.id}`)
                      }}
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-lg">
                        {getInitials(getOtherUserName(conv))}
                      </div>
                      {conv.unread && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/profile/${conv.other_user?.id}`)
                          }}
                          className="font-semibold text-gray-800 truncate cursor-pointer hover:text-primary-500 transition"
                        >
                          {getOtherUserName(conv)}
                        </h3>
                        <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                          {formatTime(conv.last_time)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {conv.last_message}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Package size={12} />
                          {conv.itemCount} {conv.itemCount === 1 ? 'item' : 'items'}
                        </span>
                        {conv.unread && (
                          <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ============ CHAT WINDOW ============ */}
          {selectedConversation ? (
            <div className="flex-1 flex flex-col h-full">
              <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="md:hidden text-gray-600 hover:text-primary-500 transition"
                  >
                    <ArrowLeft size={24} />
                  </button>

                  <div 
                    onClick={() => navigate(`/profile/${selectedConversation.other_user?.id}`)}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-primary-300 transition"
                  >
                    {getInitials(getOtherUserName(selectedConversation))}
                  </div>

                  <div>
                    <h3 
                      onClick={() => navigate(`/profile/${selectedConversation.other_user?.id}`)}
                      className="font-semibold text-gray-800 cursor-pointer hover:text-primary-500 transition"
                    >
                      {getOtherUserName(selectedConversation)}
                    </h3>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                      {selectedConversation.itemCount} {selectedConversation.itemCount === 1 ? 'item' : 'items'} in conversation
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {selectedConversation.items?.slice(0, 2).map((item, idx) => (
                    <Link
                      key={idx}
                      to={`/item/${item.id}`}
                      className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-lg text-gray-600 transition"
                      title={item.title}
                    >
                      {item.type === 'lost' ? '🔴' : '🟢'} {item.title?.substring(0, 12)}...
                    </Link>
                  ))}
                  {selectedConversation.itemCount > 2 && (
                    <span className="text-xs text-gray-400">+{selectedConversation.itemCount - 2} more</span>
                  )}
                </div>
              </div>

              <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-4 bg-gray-50"
              >
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <MessageCircle size={48} className="mb-3 opacity-30" />
                    <p className="text-sm font-medium">No messages yet</p>
                    <p className="text-xs">Start the conversation!</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {messages.map((msg, index) => {
                      const isOwn = msg.sender_id === user.id
                      const showTime = index === 0 || 
                        new Date(msg.created_at).toDateString() !== 
                        new Date(messages[index - 1]?.created_at).toDateString()

                      return (
                        <div key={msg.id}>
                          {showTime && (
                            <div className="flex justify-center my-3">
                              <span className="text-xs text-gray-400 bg-gray-200 px-3 py-1 rounded-full">
                                {new Date(msg.created_at).toLocaleDateString('en-US', { 
                                  weekday: 'long', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}
                              </span>
                            </div>
                          )}
                          <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] md:max-w-[60%] ${isOwn ? 'order-2' : 'order-1'}`}>
                              <div className={`px-4 py-2.5 rounded-2xl ${
                                isOwn
                                  ? 'bg-primary-500 text-white rounded-br-sm'
                                  : 'bg-white text-gray-800 rounded-bl-sm shadow-sm'
                              }`}>
                                <p className="text-sm break-words">{msg.message_text}</p>
                              </div>
                              <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                <span className="text-xs text-gray-400">
                                  {formatTime(msg.created_at)}
                                </span>
                                {isOwn && (
                                  <CheckCheck size={14} className="text-gray-400" />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2.5 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition text-sm"
                    disabled={sending}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={sending || !newMessage.trim()}
                    className="p-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {sending ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <Send size={20} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 hidden md:flex flex-col items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users size={40} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700">Your Messages</h3>
                <p className="text-sm text-gray-400 mt-1 max-w-sm">
                  Select a conversation from the sidebar to start chatting
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}