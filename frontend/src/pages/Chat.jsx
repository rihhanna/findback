import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../services/supabase'

export default function Chat() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState([])
  const [selected, setSelected] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchConversations()
    }
  }, [user])

  useEffect(() => {
    if (selected) {
      fetchMessages(selected.id)
    }
  }, [selected])

  const fetchConversations = async () => {
    const { data } = await supabase
      .from('messages')
      .select(`
        *,
        item:item_id (title),
        sender:sender_id (name),
        receiver:receiver_id (name)
      `)
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false })

    // Group by conversation
    const conversationsMap = {}
    data?.forEach(msg => {
      const key = [msg.item_id, Math.min(msg.sender_id, msg.receiver_id), Math.max(msg.sender_id, msg.receiver_id)].join('-')
      if (!conversationsMap[key]) {
        conversationsMap[key] = {
          id: key,
          item_id: msg.item_id,
          item_title: msg.item.title,
          other_user: msg.sender_id === user.id ? msg.receiver : msg.sender,
          last_message: msg.message_text,
          last_time: msg.created_at
        }
      }
    })

    setConversations(Object.values(conversationsMap))
    setLoading(false)
  }

  const fetchMessages = async (conversationId) => {
    // Simplified - in production, query by item_id and both users
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('item_id', conversationId)
      .order('created_at', { ascending: true })

    setMessages(data || [])
  }

  const sendMessage = async () => {
    if (!newMessage.trim()) return

    const { error } = await supabase
      .from('messages')
      .insert([{
        item_id: selected.item_id,
        sender_id: user.id,
        receiver_id: selected.other_user.id,
        message_text: newMessage
      }])

    if (!error) {
      setNewMessage('')
      fetchMessages(selected.item_id)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-heading font-bold text-primary-600 mb-6">
          Messages
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Conversations List */}
          <div className="border-r border-gray-200 max-h-96 overflow-y-auto">
            {conversations.length === 0 ? (
              <p className="p-4 text-gray-500">No conversations yet</p>
            ) : (
              conversations.map(conv => (
                <div
                  key={conv.id}
                  onClick={() => setSelected(conv)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition ${
                    selected?.id === conv.id ? 'bg-gray-100' : ''
                  }`}
                >
                  <p className="font-semibold">{conv.item_title}</p>
                  <p className="text-sm text-gray-600 truncate">
                    {conv.other_user?.name || 'Unknown'}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{conv.last_message}</p>
                </div>
              ))
            )}
          </div>

          {/* Chat Window */}
          <div className="col-span-2 flex flex-col h-96">
            {selected ? (
              <>
                <div className="border-b border-gray-200 p-4">
                  <p className="font-semibold">{selected.item_title}</p>
                  <p className="text-sm text-gray-600">Chat with {selected.other_user?.name || 'User'}</p>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                  {messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`p-3 rounded-lg max-w-[70%] ${
                        msg.sender_id === user.id
                          ? 'bg-primary-500 text-white ml-auto'
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      {msg.message_text}
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 p-4 flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <button
                    onClick={sendMessage}
                    className="bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition"
                  >
                    Send
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                Select a conversation to start chatting
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}