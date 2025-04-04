'use client'

// app/page.tsx
import React, { useState } from 'react'
import AlbumBubble from '@/components/AlbumBubble'     // Adjust the path to match your folder structure
import AlbumModal from '@/components/AlbumModal'       // Same as above

// Message Type
type Message = {
  id: number
  type: 'text' | 'voice' | 'imageAlbum'
  content: string | string[]
  sender: 'user' | 'server'
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [selectedAlbum, setSelectedAlbum] = useState<string[] | null>(null)

  // Hardcode or load from user config
  const phoneNumber = '01010109999912'
  const clientId = 'DREAM_HOMES'

  // Handlers for the Album Modal
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

  // Send user message to LenaAI endpoint
  const handleSend = async () => {
    if (!newMessage.trim()) return

    // (1) Show user's message immediately
    const userMsgId = messages.length + 1
    const userMsg: Message = {
      id: userMsgId,
      type: 'text',
      content: newMessage,
      sender: 'user',
    }
    setMessages((prev) => [...prev, userMsg])

    // (2) Prepare payload
    const payload = {
      phone_number: phoneNumber,
      query: newMessage,
      client_id: clientId,
      platform: 'website',
    }

    try {
      // (3) POST to the API
      console.log('Sending payload:', payload)
      const response = await fetch('https://api.lenaai.net/langgraph_chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        console.error('Server returned error status:', response.status)
      }

      // (4) Parse server response
      const data = await response.json()
      console.log('API Response:', data)

      // (5) Build new server messages
      const newMessages: Message[] = []

      // a) Main text message
      const serverMsgId = userMsgId + 1
      newMessages.push({
        id: serverMsgId,
        type: 'text',
        content: data.message || '(No message received)',
        sender: 'server',
      })

      // b) Check if `properties` is an array
      if (Array.isArray(data.properties)) {
        data.properties.forEach((prop: any) => {
          const description = prop.description || ''
          const images = prop.metadata?.images || []

          // b1) Add property description (text)
          if (description) {
            const descMsgId = messages.length + newMessages.length + 1
            newMessages.push({
              id: descMsgId,
              type: 'text',
              content: description,
              sender: 'server',
            })
          }

          // b2) Add album bubble if images exist
          if (Array.isArray(images) && images.length > 0) {
            const albumMsgId = messages.length + newMessages.length + 1
            const imageUrls = images.map((imgObj: { url: string }) => imgObj.url)
            newMessages.push({
              id: albumMsgId,
              type: 'imageAlbum',
              content: imageUrls,
              sender: 'server',
            })
          }
        })
      }

      // (6) Append new server messages to state
      setMessages((prev) => [...prev, ...newMessages])
    } catch (error) {
      console.error('Error calling the API:', error)
    }

    // (7) Clear input
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

// Renders each message bubble in the chat
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

// Inline styles (quick prototype)
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