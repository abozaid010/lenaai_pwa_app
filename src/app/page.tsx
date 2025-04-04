'use client'

import React, { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

// A helper type for message objects
type Message = {
  id: number
  type: 'text' | 'voice' | 'imageAlbum'
  content: string | string[] // for images, we store an array of URLs
  sender: 'user' | 'server'  // helps identify who sent the message
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')

  // Hardcode or load from user config
  const phoneNumber = '01010109999912'
  const clientId = 'DREAM_HOMES'

  const handleSend = async () => {
    if (!newMessage.trim()) return

    // 1) Display user message immediately
    const userMsgId = messages.length + 1
    const userMsg: Message = {
      id: userMsgId,
      type: 'text',
      content: newMessage,
      sender: 'user',
    }
    setMessages((prev) => [...prev, userMsg])

    // 2) Prepare the payload
    const payload = {
      phone_number: phoneNumber,
      query: newMessage,
      client_id: clientId,
      platform: 'website',
    }

    // 3) Make the POST request to the LenaAI endpoint
    try {
      console.log('Sending payload:', payload)
      const response = await fetch('https://api.lenaai.net/langgraph_chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        console.error('Server returned error status:', response.status)
        // You could also handle specific errors, e.g. 400, 401, 500, etc.
      }

      const data = await response.json()
      console.log('API Response:', data)

      // -----------------------------
      // 4) Handle server message
      // -----------------------------
      // a) Server's main 'message' field
      const newMessages: Message[] = []

      const serverMsgId = userMsgId + 1
      const serverMsg: Message = {
        id: serverMsgId,
        type: 'text',
        content: data.message || '(No message received)',
        sender: 'server',
      }
      newMessages.push(serverMsg)

      // b) If 'properties' exist, parse them
      if (data.properties && typeof data.properties === 'object') {
        // Example structure: data.properties = { property_1: { description, metadata }, ... }
        Object.keys(data.properties).forEach((key) => {
          const prop = data.properties[key]
          const description = prop.description || ''
          const images = prop.metadata?.images || []

          // 1. Add a text bubble for the property description
          if (description) {
            const descMsgId = messages.length + newMessages.length + 1
            newMessages.push({
              id: descMsgId,
              type: 'text',
              content: description,
              sender: 'server',
            })
          }

          // 2. Add an imageAlbum bubble if images exist
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

      // Append the new server messages to state
      setMessages((prev) => [...prev, ...newMessages])

    } catch (error) {
      console.error('Error calling the API:', error)
      // Optionally show an error message in the UI
    }

    // 5) Clear input field
    setNewMessage('')
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div>LenaAI Chat</div>
        <button style={styles.callButton} onClick={() => alert('Call clicked!')}>
          Call
        </button>
      </header>

      {/* Chat Area */}
      <div style={styles.chatArea}>
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
      </div>

      {/* Footer (Input) */}
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
    </div>
  )
}

function MessageBubble({ message }: { message: Message }) {
  // Decide alignment or style based on who sent the message
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
      // e.g., content is an array of URLs
      if (Array.isArray(message.content)) {
        return (
          <div style={{ ...bubbleStyle, display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
            {message.content.map((imgUrl, idx) => (
              <img
                key={idx}
                src={imgUrl}
                alt={`Album image ${idx}`}
                style={styles.albumImage}
              />
            ))}
          </div>
        )
      }
      return null
    default:
      return null
  }
}

// Inline styles for quick prototyping
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
  albumImage: {
    width: '80px',
    height: '80px',
    objectFit: 'cover',
    borderRadius: '4px',
  },
}