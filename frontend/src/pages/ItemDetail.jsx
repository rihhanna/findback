import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../services/supabase'
import { useAuth } from '../context/AuthContext'

export default function ItemDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [item, setItem] = useState(null)
  const [loading, setLoading] = useState(true)

  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  const [showContactForm, setShowContactForm] = useState(false)

  const [chatMessages, setChatMessages] = useState([])
  const [loadingChat, setLoadingChat] = useState(false)

  /*
  ============================================
  FETCH ITEM
  ============================================
  */

  useEffect(() => {
    fetchItem()
  }, [id])

  const fetchItem = async () => {
    const { data, error } = await supabase
      .from('items')
      .select(`
        *,
        profiles:user_id (
          id,
          name,
          phone,
          avatar_url
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error:', error)
      navigate('/browse')
    } else {
      setItem(data)
    }

    setLoading(false)
  }

  /*
  ============================================
  FETCH CHAT MESSAGES
  ============================================
  */

  const fetchChatMessages = async () => {
    if (!user) return

    setLoadingChat(true)

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('item_id', id)
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', {
        ascending: true
      })

    if (error) {
      console.error('Error fetching messages:', error)
    } else {
      setChatMessages(data || [])
    }

    setLoadingChat(false)
  }

  /*
  ============================================
  SEND MESSAGE
  ============================================
  */

  const handleContact = async () => {
    if (!user) {
      alert('Please login to contact the user')
      navigate('/login')
      return
    }

    if (!message.trim()) {
      alert('Please write a message')
      return
    }

    setSending(true)

    const { error } = await supabase
      .from('messages')
      .insert([
        {
          item_id: item.id,
          sender_id: user.id,
          receiver_id: item.user_id,
          message_text: message.trim()
        }
      ])

    if (error) {
      alert('Error: ' + error.message)
    } else {
      setMessage('')

      await fetchChatMessages()

      setShowContactForm(true)
    }

    setSending(false)
  }

  /*
  ============================================
  MARK AS RETURNED
  ============================================
  */

  const handleReturn = async () => {
    if (!confirm('Mark this item as returned?')) return

    const { error } = await supabase
      .from('items')
      .update({
        status: 'returned'
      })
      .eq('id', id)

    if (error) {
      alert('Error: ' + error.message)
    } else {
      alert('🎉 Item marked as returned!')
      navigate('/browse')
    }
  }

  /*
  ============================================
  CONTACT TOGGLE
  ============================================
  */

  const toggleContactForm = () => {
    if (!user) {
      navigate('/login')
      return
    }

    setShowContactForm(!showContactForm)

    if (!showContactForm) {
      fetchChatMessages()
    }
  }

  /*
  ============================================
  LOADING STATE
  ============================================
  */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center">

        <div className="flex flex-col items-center">

          <div
            className="
              w-10
              h-10
              border-4
              border-gray-200
              border-t-primary-500
              rounded-full
              animate-spin
            "
          />

          <p className="mt-4 text-sm text-gray-500">
            Loading item...
          </p>

        </div>

      </div>
    )
  }

  /*
  ============================================
  ITEM NOT FOUND
  ============================================
  */

  if (!item) {
    return (
      <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center">

        <div className="text-center">

          <div className="text-5xl mb-4">
            🔍
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Item not found
          </h2>

          <Link
            to="/browse"
            className="
              text-primary-600
              hover:text-primary-700
              font-medium
              text-sm
            "
          >
            ← Back to browse
          </Link>

        </div>

      </div>
    )
  }

  /*
  ============================================
  VARIABLES
  ============================================
  */

  const isLost = item.type === 'lost'

  const isOwner =
    user && user.id === item.user_id

  const isActive =
    item.status === 'active'

  const formattedDate =
    item.date_lost_or_found
      ? new Date(
          item.date_lost_or_found
        ).toLocaleDateString(
          'en-US',
          {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }
        )
      : null

  return (

    <div
      className="
        min-h-screen
        bg-[#fafaf8]
        px-4
        sm:px-6
        lg:px-8
        py-8
      "
    >

      <div className="max-w-6xl mx-auto">

        {/* =========================================
            BACK TO BROWSE
        ========================================= */}

        <Link
          to="/browse"
          className="
            inline-flex
            items-center
            gap-2
            mb-6
            text-sm
            font-medium
            text-gray-500
            hover:text-gray-900
            transition
            group
          "
        >

          <span
            className="
              text-xl
              transition-transform
              group-hover:-translate-x-1
            "
          >
            ←
          </span>

          Back to browse

        </Link>


        {/* =========================================
            MAIN CARD
        ========================================= */}

        <div
          className="
            bg-white
            rounded-3xl
            overflow-hidden
            border
            border-gray-100
            shadow-[0_12px_45px_rgba(0,0,0,0.06)]
          "
        >

          <div
            className="
              grid
              grid-cols-1
              lg:grid-cols-[1.12fr_0.88fr]
            "
          >

            {/* =====================================
                IMAGE
            ===================================== */}

            <div
              className="
                relative
                bg-gray-100
                min-h-[360px]
                sm:min-h-[450px]
                lg:min-h-[650px]
              "
            >

              {item.photo_urls &&
              item.photo_urls.length > 0 ? (

                <>

                  <img
                    src={item.photo_urls[0]}
                    alt={item.title}
                    className="
                      absolute
                      inset-0
                      w-full
                      h-full
                      object-cover
                    "
                  />

                  {/* subtle image overlay */}

                  <div
                    className="
                      absolute
                      inset-0
                      bg-gradient-to-t
                      from-black/20
                      via-transparent
                      to-transparent
                      pointer-events-none
                    "
                  />

                  {/* photo count */}

                  {item.photo_urls.length > 1 && (

                    <div
                      className="
                        absolute
                        bottom-5
                        right-5
                        bg-black/60
                        backdrop-blur-md
                        text-white
                        text-xs
                        font-medium
                        px-3
                        py-2
                        rounded-full
                      "
                    >
                      📷 {item.photo_urls.length} photos
                    </div>

                  )}

                </>

              ) : (

                <div
                  className="
                    absolute
                    inset-0
                    flex
                    items-center
                    justify-center
                    bg-gray-100
                  "
                >

                  <div className="text-center">

                    <div className="text-5xl opacity-30 mb-3">
                      📷
                    </div>

                    <p className="text-sm text-gray-400">
                      No image available
                    </p>

                  </div>

                </div>

              )}

            </div>


            {/* =====================================
                INFORMATION
            ===================================== */}

            <div
              className="
                p-6
                sm:p-8
                lg:p-10
                flex
                flex-col
              "
            >

              {/* =================================
                  BADGES
              ================================= */}

              <div
                className="
                  flex
                  flex-wrap
                  items-center
                  gap-2
                  mb-5
                "
              >

                {/* LOST / FOUND */}

                <span
                  className={`
                    inline-flex
                    items-center
                    px-4
                    py-2
                    rounded-full
                    text-xs
                    font-bold
                    tracking-wide
                    border
                    ${
                      isLost
                        ? `
                          bg-red-50
                          text-red-600
                          border-red-100
                        `
                        : `
                          bg-green-50
                          text-green-600
                          border-green-100
                        `
                    }
                  `}
                >

                  <span
                    className={`
                      w-1.5
                      h-1.5
                      rounded-full
                      mr-2
                      ${
                        isLost
                          ? 'bg-red-500'
                          : 'bg-green-500'
                      }
                    `}
                  />

                  {isLost
                    ? 'LOST'
                    : 'FOUND'}

                </span>


                {/* CATEGORY */}

                {item.category && (

                  <span
                    className="
                      px-4
                      py-2
                      rounded-full
                      text-xs
                      font-medium
                      text-gray-600
                      bg-gray-50
                      border
                      border-gray-100
                    "
                  >
                    {item.category}
                  </span>

                )}


                {/* RETURNED */}

                {item.status === 'returned' && (

                  <span
                    className="
                      px-4
                      py-2
                      rounded-full
                      text-xs
                      font-semibold
                      text-green-700
                      bg-green-50
                      border
                      border-green-100
                    "
                  >
                    ✓ Returned
                  </span>

                )}

              </div>


              {/* =================================
                  TITLE
              ================================= */}

              <h1
                className="
                  text-3xl
                  sm:text-4xl
                  font-bold
                  tracking-tight
                  text-gray-950
                  leading-tight
                  mb-4
                "
              >
                {item.title}
              </h1>


              {/* =================================
                  DESCRIPTION
              ================================= */}

              <p
                className="
                  text-gray-600
                  text-base
                  leading-7
                  mb-8
                "
              >
                {item.description ||
                  'No description provided.'}
              </p>


              {/* =================================
                  DETAILS
              ================================= */}

              <div className="space-y-5 mb-8">

                {/* LOCATION */}

                {item.location && (

                  <div
                    className="
                      flex
                      items-center
                      gap-4
                    "
                  >

                    <div
                      className="
                        w-10
                        h-10
                        rounded-xl
                        bg-gray-50
                        border
                        border-gray-100
                        flex
                        items-center
                        justify-center
                        flex-shrink-0
                        text-lg
                      "
                    >
                      📍
                    </div>

                    <div>

                      <p
                        className="
                          text-xs
                          text-gray-400
                          font-medium
                          mb-1
                        "
                      >
                        Location
                      </p>

                      <p
                        className="
                          text-sm
                          font-medium
                          text-gray-800
                        "
                      >
                        {item.location}
                      </p>

                    </div>

                  </div>

                )}


                {/* DATE */}

                {formattedDate && (

                  <div
                    className="
                      flex
                      items-center
                      gap-4
                    "
                  >

                    <div
                      className="
                        w-10
                        h-10
                        rounded-xl
                        bg-gray-50
                        border
                        border-gray-100
                        flex
                        items-center
                        justify-center
                        flex-shrink-0
                        text-lg
                      "
                    >
                      📅
                    </div>

                    <div>

                      <p
                        className="
                          text-xs
                          text-gray-400
                          font-medium
                          mb-1
                        "
                      >
                        {isLost
                          ? 'Lost on'
                          : 'Found on'}
                      </p>

                      <p
                        className="
                          text-sm
                          font-medium
                          text-gray-800
                        "
                      >
                        {formattedDate}
                      </p>

                    </div>

                  </div>

                )}


                {/* POSTED BY */}

                <div
                  className="
                    flex
                    items-center
                    gap-4
                  "
                >

                  <div
                    className="
                      w-10
                      h-10
                      rounded-xl
                      bg-gray-50
                      border
                      border-gray-100
                      flex
                      items-center
                      justify-center
                      flex-shrink-0
                      overflow-hidden
                    "
                  >

                    {item.profiles?.avatar_url ? (

                      <img
                        src={
                          item.profiles.avatar_url
                        }
                        alt={
                          item.profiles.name ||
                          'User'
                        }
                        className="
                          w-full
                          h-full
                          object-cover
                        "
                      />

                    ) : (

                      <span className="text-lg">
                        👤
                      </span>

                    )}

                  </div>


                  <div>

                    <p
                      className="
                        text-xs
                        text-gray-400
                        font-medium
                        mb-1
                      "
                    >
                      Posted by
                    </p>

                    <p
                      className="
                        text-sm
                        font-semibold
                        text-gray-900
                      "
                    >
                      {item.profiles?.name ||
                        'Anonymous'}
                    </p>

                  </div>

                </div>

              </div>


              {/* =================================
                  DIVIDER
              ================================= */}

              <div
                className="
                  border-t
                  border-gray-100
                  mb-7
                "
              />


              {/* =================================
                  ACTION BUTTONS
              ================================= */}

              {isActive && (

                <div className="mb-4">

                  {/*
                    OTHER USER
                  */}

                  {user && !isOwner && (

                    <button
                      onClick={toggleContactForm}
                      className={`
                        w-full
                        flex
                        items-center
                        justify-center
                        gap-2
                        py-3.5
                        px-6
                        rounded-xl
                        font-semibold
                        text-sm
                        transition-all
                        duration-200
                        active:scale-[0.98]
                        ${
                          showContactForm
                            ? `
                              bg-gray-100
                              text-gray-700
                              hover:bg-gray-200
                            `
                            : `
                              bg-primary-500
                              text-white
                              hover:bg-primary-600
                              shadow-sm
                              hover:shadow-md
                            `
                        }
                      `}
                    >

                      <span className="text-lg">

                        {showContactForm
                          ? '×'
                          : '💬'}

                      </span>

                      {showContactForm
                        ? 'Close Chat'
                        : `Contact ${
                            isLost
                              ? 'Finder'
                              : 'Owner'
                          }`}

                    </button>

                  )}


                  {/*
                    NOT LOGGED IN
                  */}

                  {!user && (

                    <Link
                      to="/login"
                      className="
                        w-full
                        flex
                        items-center
                        justify-center
                        gap-2
                        bg-primary-500
                        hover:bg-primary-600
                        text-white
                        py-3.5
                        px-6
                        rounded-xl
                        font-semibold
                        text-sm
                        shadow-sm
                        hover:shadow-md
                        transition-all
                      "
                    >

                      <span className="text-lg">
                        💬
                      </span>

                      Login to Contact

                    </Link>

                  )}


                  {/*
                    ITEM OWNER
                  */}

                  {user && isOwner && (

                    <button
                      onClick={handleReturn}
                      className="
                        w-full
                        flex
                        items-center
                        justify-center
                        gap-2
                        bg-[#f4b41a]
                        hover:bg-[#e5a914]
                        text-gray-950
                        py-3.5
                        px-6
                        rounded-xl
                        font-semibold
                        text-sm
                        shadow-sm
                        hover:shadow-md
                        transition-all
                        active:scale-[0.98]
                      "
                    >

                      <span className="text-lg">
                        ✓
                      </span>

                      Mark as Returned

                    </button>

                  )}

                </div>

              )}


              {/* =================================
                  CHAT BOX
              ================================= */}

              {showContactForm &&
                user &&
                !isOwner && (

                  <div
                    className="
                      bg-gray-50
                      border
                      border-gray-200
                      rounded-2xl
                      p-4
                      mb-4
                    "
                  >

                    {/* Chat Header */}

                    <div
                      className="
                        flex
                        items-center
                        justify-between
                        gap-3
                        mb-4
                      "
                    >

                      <div
                        className="
                          flex
                          items-center
                          gap-3
                        "
                      >

                        <div
                          className="
                            w-9
                            h-9
                            rounded-full
                            bg-white
                            border
                            border-gray-200
                            overflow-hidden
                            flex
                            items-center
                            justify-center
                          "
                        >

                          {item.profiles?.avatar_url ? (

                            <img
                              src={
                                item.profiles
                                  .avatar_url
                              }
                              alt=""
                              className="
                                w-full
                                h-full
                                object-cover
                              "
                            />

                          ) : (

                            <span>
                              👤
                            </span>

                          )}

                        </div>


                        <div>

                          <p
                            className="
                              text-sm
                              font-semibold
                              text-gray-800
                            "
                          >
                            Chat with{' '}
                            {item.profiles?.name ||
                              (isLost
                                ? 'Finder'
                                : 'Owner')}
                          </p>

                          <p
                            className="
                              text-[11px]
                              text-gray-400
                            "
                          >
                            About this item
                          </p>

                        </div>

                      </div>

                    </div>


                    {/* =================================
                        MESSAGES
                    ================================= */}

                    {loadingChat ? (

                      <div
                        className="
                          bg-white
                          rounded-xl
                          py-8
                          text-center
                          text-sm
                          text-gray-400
                          mb-3
                        "
                      >
                        <div
                          className="
                            w-6
                            h-6
                            border-2
                            border-gray-200
                            border-t-primary-500
                            rounded-full
                            animate-spin
                            mx-auto
                            mb-2
                          "
                        />

                        Loading messages...

                      </div>

                    ) : chatMessages.length > 0 ? (

                      <div
                        className="
                          max-h-64
                          overflow-y-auto
                          space-y-3
                          mb-3
                          bg-white
                          rounded-xl
                          p-4
                          border
                          border-gray-100
                        "
                      >

                        {chatMessages.map((msg) => {

                          const isMine =
                            msg.sender_id ===
                            user.id

                          return (

                            <div
                              key={msg.id}
                              className={`
                                flex
                                ${
                                  isMine
                                    ? 'justify-end'
                                    : 'justify-start'
                                }
                              `}
                            >

                              <div
                                className={`
                                  max-w-[82%]
                                  ${
                                    isMine
                                      ? 'text-right'
                                      : 'text-left'
                                  }
                                `}
                              >

                                <div
                                  className={`
                                    inline-block
                                    px-4
                                    py-2.5
                                    rounded-2xl
                                    text-sm
                                    leading-5
                                    ${
                                      isMine
                                        ? `
                                          bg-primary-500
                                          text-white
                                          rounded-br-md
                                        `
                                        : `
                                          bg-gray-100
                                          text-gray-700
                                          rounded-bl-md
                                        `
                                    }
                                  `}
                                >
                                  {msg.message_text}
                                </div>


                                <p
                                  className="
                                    text-[10px]
                                    text-gray-400
                                    mt-1
                                    px-1
                                  "
                                >
                                  {new Date(
                                    msg.created_at
                                  ).toLocaleTimeString(
                                    [],
                                    {
                                      hour: '2-digit',
                                      minute:
                                        '2-digit'
                                    }
                                  )}
                                </p>

                              </div>

                            </div>

                          )

                        })}

                      </div>

                    ) : (

                      <div
                        className="
                          bg-white
                          border
                          border-gray-100
                          rounded-xl
                          p-6
                          text-center
                          mb-3
                        "
                      >

                        <div className="text-2xl mb-2">
                          💬
                        </div>

                        <p
                          className="
                            text-sm
                            font-medium
                            text-gray-600
                          "
                        >
                          Start the conversation
                        </p>

                        <p
                          className="
                            text-xs
                            text-gray-400
                            mt-1
                          "
                        >
                          Send a message about this
                          item.
                        </p>

                      </div>

                    )}


                    {/* =================================
                        MESSAGE INPUT
                    ================================= */}

                    <div
                      className="
                        flex
                        items-center
                        gap-2
                      "
                    >

                      <input
                        type="text"
                        value={message}
                        onChange={(e) =>
                          setMessage(
                            e.target.value
                          )
                        }
                        onKeyDown={(e) => {
                          if (
                            e.key === 'Enter' &&
                            !e.shiftKey
                          ) {
                            e.preventDefault()
                            handleContact()
                          }
                        }}
                        placeholder="Type your message..."
                        className="
                          flex-1
                          min-w-0
                          px-4
                          py-3
                          bg-white
                          border
                          border-gray-200
                          rounded-xl
                          text-sm
                          outline-none
                          placeholder:text-gray-400
                          focus:border-primary-500
                          focus:ring-2
                          focus:ring-primary-500/10
                          transition
                        "
                      />


                      <button
                        onClick={handleContact}
                        disabled={
                          sending ||
                          !message.trim()
                        }
                        className="
                          flex-shrink-0
                          bg-primary-500
                          hover:bg-primary-600
                          disabled:opacity-50
                          disabled:cursor-not-allowed
                          text-white
                          px-5
                          py-3
                          rounded-xl
                          text-sm
                          font-semibold
                          transition
                        "
                      >

                        {sending
                          ? '...'
                          : 'Send'}

                      </button>

                    </div>

                  </div>

                )}


              {/* =================================
                  RETURNED STATUS
              ================================= */}

              {item.status === 'returned' && (

                <div
                  className="
                    bg-green-50
                    border
                    border-green-100
                    rounded-2xl
                    p-5
                    text-center
                    mb-4
                  "
                >

                  <div className="text-2xl mb-2">
                    🎉
                  </div>

                  <p
                    className="
                      text-green-700
                      font-semibold
                      text-sm
                    "
                  >
                    This item has been returned!
                  </p>

                  <p
                    className="
                      text-green-600/70
                      text-xs
                      mt-1
                    "
                  >
                    Thank you for helping reunite
                    this item with its owner.
                  </p>

                </div>

              )}


              {/* =================================
                  REPORT
              ================================= */}

              {isActive && (

                <div
                  className="
                    text-center
                    mt-3
                  "
                >

                  <button
                    onClick={() => {

                      if (
                        confirm(
                          'Report this item as inappropriate?'
                        )
                      ) {
                        alert(
                          'Item reported. We will review it shortly.'
                        )
                      }

                    }}
                    className="
                      inline-flex
                      items-center
                      gap-1.5
                      text-xs
                      text-gray-400
                      hover:text-red-500
                      transition
                    "
                  >

                    <span>
                      ⚑
                    </span>

                    Report this item

                  </button>

                </div>

              )}

            </div>

          </div>

        </div>

      </div>

    </div>
  )
}