import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import { useAuth } from './AuthContext'

const NotificationContext = createContext()

export function NotificationProvider({ children }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  // Fetch notifications
  useEffect(() => {
    if (user) {
      fetchNotifications()
      subscribeToNotifications()
    } else {
      setNotifications([])
      setUnreadCount(0)
    }
  }, [user])

  const fetchNotifications = async () => {
    try {
      // Fetch unread messages
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id (id, name, avatar_url),
          item:item_id (id, title, type)
        `)
        .eq('receiver_id', user.id)
        .eq('read_status', false)
        .order('created_at', { ascending: false })

      if (messagesError) throw messagesError

      const formattedNotifications = messages?.map(msg => ({
        id: msg.id,
        type: 'message',
        title: `New message from ${msg.sender?.name || 'Someone'}`,
        message: msg.message_text,
        link: `/chat`,
        created_at: msg.created_at,
        read: msg.read_status,
        data: msg
      })) || []

      setNotifications(formattedNotifications)
      setUnreadCount(formattedNotifications.filter(n => !n.read).length)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const subscribeToNotifications = () => {
    if (!user) return

    // Subscribe to new messages
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`
        },
        (payload) => {
          const newMsg = payload.new
          
          // Fetch sender info
          supabase
            .from('profiles')
            .select('name, avatar_url')
            .eq('id', newMsg.sender_id)
            .single()
            .then(({ data: sender }) => {
              const notification = {
                id: newMsg.id,
                type: 'message',
                title: `💬 New message from ${sender?.name || 'Someone'}`,
                message: newMsg.message_text,
                link: `/chat`,
                created_at: newMsg.created_at,
                read: false,
                data: newMsg
              }

              setNotifications(prev => [notification, ...prev])
              setUnreadCount(prev => prev + 1)

              // Show browser notification if permitted
              showBrowserNotification(`New message from ${sender?.name || 'Someone'}`, newMsg.message_text)
            })
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }

  // Browser Notification
  const showBrowserNotification = (title, body) => {
    if (!('Notification' in window)) return
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body: body,
        icon: '/favicon.ico'
      })
    }
  }

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))

    try {
      await supabase
        .from('messages')
        .update({ read_status: true })
        .eq('id', notificationId)
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  // Mark all as read
  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id)
    
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    )
    setUnreadCount(0)

    if (unreadIds.length > 0) {
      try {
        await supabase
          .from('messages')
          .update({ read_status: true })
          .in('id', unreadIds)
      } catch (error) {
        console.error('Error marking all as read:', error)
      }
    }
  }

  // Request browser notification permission
  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }

  const value = {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    requestNotificationPermission
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}