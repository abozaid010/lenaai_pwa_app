'use client'

import React, { useEffect, useState } from 'react'
import AlbumBubble from '../components/AlbumBubble'
import AlbumModal from '../components/AlbumModal'

// A helper type for message objects
type Message = {
  id: number
  type: 'text' | 'voice' | 'imageAlbum'
  content: string | string[]
  sender: 'user' | 'server'
}

// Utility function to generate a random Egyptian phone number
function getRandomEgyptPhoneNumber(): string {
  const prefixes = ['010', '011', '012', '015']
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]

  let rest = ''
  for (let i = 0; i < 8; i++) {
    rest += Math.floor(Math.random() * 10) // random digit [0..9]
  }

  return prefix + rest // e.g. '01012345678'
}

export default function ChatPage() {
  // Chat messages
  const [messages, setMessages] = useState<Message[]>([])
  // New message text
  const [newMessage, setNewMessage] = useState('')
  // For album modal
  const [selectedAlbum, setSelectedAlbum] = useState<string[] | null>(null)
  // Persisted phone number
  const [phoneNumber, setPhoneNumber] = useState('')

  // Hardcoded client ID (unchanged)
  const clientId = 'DREAM_HOMES'

  // On first load or refresh, check localStorage
  useEffect(() => {
    const storedNumber = localStorage.getItem('phone_number')
    if (storedNumber) {
      // Use existing phone number
      setPhoneNumber(storedNumber)
    } else {
      // Generate a new random number and store it
      const newNumber = getRandomEgyptPhoneNumber()
      setPhoneNumber(newNumber)
      localStorage.setItem('phone_number', newNumber)
    }
  }, [])

  // Handle album modal
  const handleOpenAlbum = (images: string[]) => {
    setSelectedAlbum(images)
  }
  const handleCloseAlbum = () => {
    setSelectedAlbum(null)
  }
  const handleLikeIt = () => {
    console.log('User clicked "Like it"')
    setSelectedAlbum(null)
  }
  const handleFindSomethingElse = () => {
    console.log('User clicked "Find something else"')
    setSelectedAlbum(null)
  }

  // Send message to LenaAI
  const handleSend = async () => {
    if (!newMessage.trim()) return

    // 1) Show user's message immediately
    const userMsgId = messages.length + 1
    const userMsg: Message = {
      id: userMsgId,
      type: 'text',
      content: newMessage,
      sender: 'user',
    }
    setMessages((prev) => [...prev, userMsg])

    // 2) Prepare payload
    const payload = {
      phone_number: phoneNumber, // <--- Using the random/persisted number
      query: newMessage,
      client_id: clientId,
      platform: 'website',
    }

    try {
      console.log('Sending payload:', payload)
      const response = await fetch('https://api.lenaai.net/langgraph_chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        console.error('Server returned error status:', response.status)
      }

      const data = await response.json()
      console.log('API Response:', data)

      // 3) Build new server messages
      const newMessages: Message[] = []
      const serverMsgId = userMsgId + 1
      newMessages.push({
        id: serverMsgId,
        type: 'text',
        content: data.message || '(No message received)',
        sender: 'server',
      })

      // If 'properties' is an array, show descriptions & images
      if (Array.isArray(data.properties)) {
        data.properties.forEach((prop: any) => {
          const description = prop.description || ''
          const images = prop.metadata?.images || []

          if (description) {
            const descId = messages.length + newMessages.length + 1
            newMessages.push({
              id: descId,
              type: 'text',
              content: description,
              sender: 'server',
            })
          }

          if (Array.isArray(images) && images.length > 0) {
            const albumId = messages.length + newMessages.length + 1
            const imageUrls = images.map((imgObj: { url: string }) => imgObj.url)
            newMessages.push({
              id: albumId,
              type: 'imageAlbum',
              content: imageUrls,
              sender: 'server',
            })
          }
        })
      }

      // 4) Update chat state with new messages
      setMessages((prev) => [...prev, ...newMessages])
    } catch (error) {
      console.error('Error calling the API:', error)
    }

    // 5) Clear input
    setNewMessage('')
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div>LenaAI Chat</div>
        <button
          style={styles.callButton}
          onClick={() => alert('Call clicked!')}
        >
          Call
        </button>
      </header>

      {/* (Optional) Display the user's random phone number */}
      <div style={{ padding: '0 10px', fontStyle: 'italic' }}>
        Your Phone Number: {phoneNumber || 'loading...'}
      </div>

      {/* Chat Area */}
      <div style={styles.chatArea}>
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            onOpenAlbum={handleOpenAlbum}
          />
        ))}
      </div>

      {/* Footer Input */}
      <footer style={styles.footer}>
        <input
          type="text"
          style={styles.input}
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button style={styles.sendButton} onClick={handleSend}>
          Send
        </button>
      </footer>

      {/* Album Modal */}
      <AlbumModal
        images={selectedAlbum || []}
        isOpen={!!selectedAlbum}
        onClose={handleCloseAlbum}
        onLike={handleLikeIt}
        onFindSomethingElse={handleFindSomethingElse}
      />
    </div>
  )
}

// Bubble Component
function MessageBubble({
  message,
  onOpenAlbum,
}: {
  message: Message
  onOpenAlbum: (imgs: string[]) => void
}) {
  const bubbleStyle =
    message.sender === 'user' ? styles.userBubble : styles.serverBubble

  switch (message.type) {
    case 'text':
      return <div style={bubbleStyle}>{message.content}</div>
    case 'voice':
      return (
        <div style={bubbleStyle}>
          <span>🎤 Voice Message:</span> {message.content}
        </div>
      )
    case 'imageAlbum':
      if (Array.isArray(message.content)) {
        return (
          <div style={bubbleStyle}>
            <AlbumBubble
              images={message.content}
              onOpenAlbum={() => onOpenAlbum(message.content as string[])}
            />
          </div>
        )
      }
      return null
    default:
      return null
  }
}

// Inline styles
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    maxWidth: '600px',
    margin: '0 auto',
    border: '1px solid #ccc',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px',
    borderBottom: '1px solid #ccc',
    background: '#f5f5f5',
  },
  callButton: {
    cursor: 'pointer',
    border: 'none',
    backgroundColor: '#0084ff',
    color: '#fff',
    padding: '5px 10px',
    borderRadius: '4px',
  },
  chatArea: {
    flex: 1,
    padding: '10px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    backgroundColor: '#fafafa',
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    borderTop: '1px solid #ccc',
    padding: '10px',
    background: '#f5f5f5',
  },
  input: {
    flex: 1,
    padding: '8px',
    fontSize: '16px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    marginRight: '10px',
  },
  sendButton: {
    cursor: 'pointer',
    border: 'none',
    backgroundColor: '#25D366',
    color: '#fff',
    padding: '8px 14px',
    fontSize: '16px',
    borderRadius: '4px',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6',
    padding: '10px',
    borderRadius: '8px',
    maxWidth: '60%',
    whiteSpace: 'pre-wrap',
  },
  serverBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    border: '1px solid #ccc',
    padding: '10px',
    borderRadius: '8px',
    maxWidth: '60%',
    whiteSpace: 'pre-wrap',
  },
}