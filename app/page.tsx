// app/page.tsx
'use client' // we need client-side interactivity (e.g., for input, scrolling)

import React, { useState } from 'react'

export default function ChatPage() {
  // Sample message state
  const [messages, setMessages] = useState([
    { id: 1, type: 'text', content: 'Hello! How can I help you today?' },
    {
      id: 2,
      type: 'imageAlbum',
      content: [
        'https://via.placeholder.com/150?text=Photo+1',
        'https://via.placeholder.com/150?text=Photo+2',
      ],
    },
    { id: 3, type: 'voice', content: 'Voice message placeholder' },
  ])
  const [newMessage, setNewMessage] = useState('')

  const handleSend = () => {
    if (!newMessage.trim()) return
    // For now, just push the new text message into local state
    const newId = messages.length + 1
    setMessages([...messages, { id: newId, type: 'text', content: newMessage }])
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

// A child component for each message bubble
function MessageBubble({ message }: { message: any }) {
  // Different rendering based on message.type
  switch (message.type) {
    case 'text':
      return (
        <div style={styles.textBubble}>
          {message.content}
        </div>
      )
    case 'voice':
      return (
        <div style={styles.voiceBubble}>
          <span>🎤 Voice Message:</span> {message.content}
        </div>
      )
    case 'imageAlbum':
      return (
        <div style={styles.imageAlbum}>
          {message.content.map((imgUrl: string, idx: number) => (
            <img key={idx} src={imgUrl} alt={`Album image ${idx}`} style={styles.albumImage} />
          ))}
        </div>
      )
    default:
      return null
  }
}

// Inline styles for quick prototyping (you can replace with Tailwind, CSS Modules, or styled-components)
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
  textBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#e1ffc7',
    padding: '10px',
    borderRadius: '8px',
    maxWidth: '60%',
  },
  voiceBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff3c7',
    padding: '10px',
    borderRadius: '8px',
    maxWidth: '60%',
    border: '1px dashed #888',
  },
  imageAlbum: {
    alignSelf: 'flex-start',
    display: 'flex',
    gap: '5px',
  },
  albumImage: {
    width: '80px',
    height: '80px',
    objectFit: 'cover',
    borderRadius: '4px',
  },
}