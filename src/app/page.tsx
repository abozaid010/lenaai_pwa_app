'use client'
import React, { useEffect, useState } from 'react'
import './globals.css'

// Import Next.js Image
import Image from 'next/image'

import AlbumBubble from '../components/AlbumBubble'
import AlbumModal from '../components/AlbumModal'

type Message = {
  id: number
  type: 'text' | 'voice' | 'imageAlbum'
  // content can be string, string[], or array of { url, full }
  content: string | string[] | Array<{ url: string; full: string }>
  sender: 'user' | 'server'
}

// For phone number generation
function getRandomEgyptPhoneNumber(): string {
  const prefixes = ['010', '011', '012', '015']
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
  let rest = ''
  for (let i = 0; i < 8; i++) {
    rest += Math.floor(Math.random() * 10)
  }
  return prefix + rest
}

/**
 * Simple ID generator to avoid duplicate keys.
 * We'll increment for each new message.
 */
let globalMessageId = 1
function getNextId() {
  return globalMessageId++
}

export default function ChatPage() {
  // Chat
  const [messages, setMessages] = useState<Message[]>([])
  // Input
  const [newMessage, setNewMessage] = useState('')
  // Album
  const [selectedAlbum, setSelectedAlbum] = useState<Array<{ url: string; full: string }> | null>(null)
  // Phone
  const [phoneNumber, setPhoneNumber] = useState('')
  
  const clientId = 'DREAM_HOMES'
  const STORAGE_KEY = phoneNumber ? `chat_${phoneNumber}` : 'myChatMessages'

  // 1) On load, get or set phone_number
  useEffect(() => {
    const storedNumber = localStorage.getItem('phone_number')
    if (storedNumber) {
      setPhoneNumber(storedNumber)
    } else {
      const newNumber = getRandomEgyptPhoneNumber()
      setPhoneNumber(newNumber)
      localStorage.setItem('phone_number', newNumber)
    }
  }, [])

  // 2) Load messages from localStorage
  useEffect(() => {
    if (!phoneNumber) return
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Message[]
        if (Array.isArray(parsed)) {
          setMessages(parsed)
          // Also update globalMessageId so new messages don’t overlap
          const maxId = parsed.reduce((acc, msg) => Math.max(acc, msg.id), 0)
          globalMessageId = maxId + 1
        }
      } catch (err) {
        console.error('Failed to parse saved messages:', err)
      }
    }
  }, [phoneNumber])

  // 3) Persist to localStorage whenever messages changes
  useEffect(() => {
    if (!phoneNumber) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
  }, [messages, phoneNumber])

  // Clear chat
  const handleClearChat = () => {
    setMessages([])
    localStorage.removeItem(STORAGE_KEY)
    globalMessageId = 1
  }

  // Album
  const handleOpenAlbum = (images: Array<{ url: string; full: string }>) => {
    setSelectedAlbum(images)
  }
  const handleCloseAlbum = () => setSelectedAlbum(null)
  const handleLikeIt = () => {
    console.log('User clicked "Like it"')
    setSelectedAlbum(null)
  }
  const handleFindSomethingElse = () => {
    console.log('User clicked "Find something else"')
    setSelectedAlbum(null)
  }

  // Send message
  const handleSend = async () => {
    if (!newMessage.trim()) return

    // a) user message
    const userMsg: Message = {
      id: getNextId(),
      type: 'text',
      content: newMessage,
      sender: 'user',
    }
    setMessages((prev) => [...prev, userMsg])

    // b) payload
    const payload = {
      phone_number: phoneNumber,
      query: newMessage,
      client_id: clientId,
      platform: 'website',
    }
    // d) Clear text field
    setNewMessage('')
    try {
      const response = await fetch('https://api.lenaai.net/langgraph_chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        console.error('Server returned error:', response.status)
      }

      const data = await response.json()
      console.log('Server data:', data)

      // c) server messages
      const newMessages: Message[] = []

      // Main server text
      newMessages.push({
        id: getNextId(),
        type: 'text',
        content: data.message || '(No message received)',
        sender: 'server',
      })

      // If properties is array
      if (Array.isArray(data.properties)) {
        data.properties.forEach((prop: any) => {
          const description = prop.description || ''
          const images = prop.metadata?.images || []

          // description bubble
          if (description) {
            newMessages.push({
              id: getNextId(),
              type: 'text',
              content: description,
              sender: 'server',
            })
          }

          // image album
          if (Array.isArray(images) && images.length > 0) {
            const albumItems = images.map((imgObj: any) => ({
              url: imgObj.url,
              full: imgObj.url,
            }))
            newMessages.push({
              id: getNextId(),
              type: 'imageAlbum',
              content: albumItems,
              sender: 'server',
            })
          }
        })
      }

      // Add them to state
      setMessages((prev) => [...prev, ...newMessages])
    } catch (err) {
      console.error('Error calling API:', err)
    }


  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>LenaAI Chat</div>
        <button
          style={styles.callButton}
          onClick={() => (window.location.href = 'tel:+201020914828')}
        >
          Call
        </button>
      </header>

      <div style={{ padding: '0 10px', fontStyle: 'italic' }}>
        Your Phone Number: {phoneNumber || 'loading...'}
      </div>

      <button style={styles.clearButton} onClick={handleClearChat}>
        Clear Chat
      </button>

      <div style={styles.chatArea}>
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id} // now guaranteed unique
            message={msg}
            onOpenAlbum={handleOpenAlbum}
          />
        ))}
      </div>

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
        images={(selectedAlbum || []).map((item) => item.url)}
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
  onOpenAlbum: (imgs: Array<{ url: string; full: string }>) => void
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
        // e.g. [{ url, full }, ...]
        return (
          <div style={bubbleStyle}>
            <AlbumBubble
              images={(message.content as Array<{ url: string; full: string }>).map(item => item.url)}
              onOpenAlbum={() =>
                onOpenAlbum(message.content as Array<{ url: string; full: string }>)
              }
            />
          </div>
        )
      }
      return null

    default:
      return null
  }
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    border: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    maxWidth: '600px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px',
    backgroundColor: 'var(--header-bg)',
    borderBottom: '1px solid var(--border-color)',
  },
  callButton: {
    cursor: 'pointer',
    border: 'none',
    backgroundColor: '#0084ff',
    color: '#fff',
    padding: '5px 10px',
    borderRadius: '4px',
  },
  clearButton: {
    margin: '5px 10px',
    padding: '5px 10px',
    border: '1px solid var(--border-color)',
    backgroundColor: '#f0f0f0',
    cursor: 'pointer',
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
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: 'var(--user-bubble-bg)',
    color: 'var(--user-bubble-text)',
    padding: '10px',
    borderRadius: '8px',
    maxWidth: '60%',
    whiteSpace: 'pre-wrap',
  },
  serverBubble: {
    alignSelf: 'flex-start',
    backgroundColor: 'var(--server-bubble-bg)',
    color: 'var(--server-bubble-text)',
    border: '1px solid var(--border-color)',
    padding: '10px',
    borderRadius: '8px',
    maxWidth: '60%',
    whiteSpace: 'pre-wrap',
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
}