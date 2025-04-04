'use client'

import React, { useEffect, useState, useRef } from 'react'
import './globals.css'
import Image from 'next/image'
import AlbumBubble from '../components/AlbumBubble'
import AlbumModal from '../components/AlbumModal'
// import styles from './styles'
// ------------------ Types ------------------
type Message = {
  id: number
  type: 'text' | 'voice' | 'imageAlbum'
  // content can be a string, string[], or array of { url, full: string }
  // for a voice, we might store a data URL or blob URL
  content: string | string[] | Array<{ url: string; full: string }>
  sender: 'user' | 'server'
}

// ------------- Phone Number Generator -------------
function getRandomEgyptPhoneNumber(): string {
  const prefixes = ['010', '011', '012', '015']
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
  let rest = ''
  for (let i = 0; i < 8; i++) {
    rest += Math.floor(Math.random() * 10)
  }
  return prefix + rest
}

// ------------- ID Generator -------------
let globalMessageId = 1
function getNextId() {
  return globalMessageId++
}

// ------------- Main Chat Component -------------
export default function ChatPage() {
  // ----------- States -----------
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('') // typed text
  const [selectedAlbum, setSelectedAlbum] = useState<Array<{ url: string; full: string }> | null>(null)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isRecording, setIsRecording] = useState(false) // true while user is holding mic
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null)

  // We'll store recorded chunks here
  const chunksRef = useRef<Blob[]>([])

  // Basic config
  const clientId = 'DREAM_HOMES'
  const STORAGE_KEY = phoneNumber ? `chat_${phoneNumber}` : 'myChatMessages'

  // ----------- Load/Init phone number -----------
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

  // ----------- Load messages -----------
  useEffect(() => {
    if (!phoneNumber) return
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Message[]
        if (Array.isArray(parsed)) {
          setMessages(parsed)
          const maxId = parsed.reduce((acc, msg) => Math.max(acc, msg.id), 0)
          globalMessageId = maxId + 1
        }
      } catch (err) {
        console.error('Failed to parse saved messages:', err)
      }
    }
  }, [phoneNumber])

  // ----------- Persist messages -----------
  useEffect(() => {
    if (!phoneNumber) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
  }, [messages, phoneNumber])

  // ----------- Clear chat -----------
  const handleClearChat = () => {
    setMessages([])
    localStorage.removeItem(STORAGE_KEY)
    globalMessageId = 1
  }

  // ----------- Album Handlers -----------
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

  // ----------- Send Text to Server -----------
  const handleSendText = async () => {
    if (!newMessage.trim()) return

    // 1) Local user message
    const userMsg: Message = {
      id: getNextId(),
      type: 'text',
      content: newMessage,
      sender: 'user',
    }
    setMessages((prev) => [...prev, userMsg])

    // 2) Prepare payload
    const payload = {
      phone_number: phoneNumber,
      query: newMessage,
      client_id: clientId,
      platform: 'website',
    }

    // 3) Clear text field immediately
    setNewMessage('')

    // 4) Call API
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

      // 5) Build new server messages
      const newMessages: Message[] = []

      // main text
      newMessages.push({
        id: getNextId(),
        type: 'text',
        content: data.message || '(No message received)',
        sender: 'server',
      })

      // properties
      if (Array.isArray(data.properties)) {
        data.properties.forEach((prop: any) => {
          const description = prop.description || ''
          const images = prop.metadata?.images || []
          if (description) {
            newMessages.push({
              id: getNextId(),
              type: 'text',
              content: description,
              sender: 'server',
            })
          }
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

      // 6) Append
      setMessages((prev) => [...prev, ...newMessages])
    } catch (err) {
      console.error('Error calling API:', err)
    }
  }

  // ----------- Voice Recording Logic -----------
  const handleStartRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('Voice recording not supported in this browser.')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      chunksRef.current = [] // reset

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        // we have all chunks, create final blob
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        // send as voice
        sendVoiceMessage(url)
      }

      mediaRecorder.start()
      setRecorder(mediaRecorder)
      setIsRecording(true)
      console.log('Recording started')
    } catch (err) {
      console.error('Error accessing microphone:', err)
    }
  }

  const handleStopRecording = () => {
    if (recorder) {
      recorder.stop()
      setRecorder(null)
    }
    setIsRecording(false)
    console.log('Recording stopped')
  }

  const sendVoiceMessage = (audioUrl: string) => {
    // 1) Add local user voice message to chat
    const voiceMsg: Message = {
      id: getNextId(),
      type: 'voice',
      content: audioUrl, // store as string
      sender: 'user',
    }
    setMessages((prev) => [...prev, voiceMsg])

    // 2) Optionally, send to server if you want to handle voice server-side
    //   For now, we won't call the server endpoint for voice.
    //   But you could do something similar to handleSendText.
  }

  // ------------- Render -------------
  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div>LenaAI Chat</div>
        <button
          style={styles.callButton}
          onClick={() => (window.location.href = 'tel:+201020914828')}
        >
          Call
        </button>
      </header>

      {/* User phone */}
      <div style={{ padding: '0 10px', fontStyle: 'italic' }}>
        Your Phone Number: {phoneNumber || 'loading...'}
      </div>

      {/* Clear chat */}
      <button style={styles.clearButton} onClick={handleClearChat}>
        Clear Chat
      </button>

      {/* Chat messages */}
      <div style={styles.chatArea}>
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            onOpenAlbum={handleOpenAlbum}
          />
        ))}
      </div>

      {/* Footer */}
      <footer style={styles.footer}>
        <input
          type="text"
          style={styles.input}
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />

        {/* 
          If user has typed something, show "Send" button 
          Otherwise, show mic for voice recording
        */}
        {newMessage.trim().length > 0 ? (
            <button style={styles.sendButton} onClick={handleSendText}>
             ➤
            </button>
        ) : (
          <div
            style={{
              ...styles.recordIconContainer,
              backgroundColor: isRecording ? 'red' : '#25D366',
              width: 40,
              height: 40,
              borderRadius: 20,
            }}
            onPointerDown={handleStartRecording}
            onPointerUp={handleStopRecording}
          >
            <div style={styles.recordIcon}>
              {isRecording ? 'Rec' : '🎤'}
            </div>
          </div>
        )}
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

// ------------------ Bubble Component ------------------
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
      // content is an audio URL
      return (
        <div style={bubbleStyle}>
          🎤 Voice Message:
          <audio controls src={message.content as string} style={{ display: 'block', marginTop: 5 }} />
        </div>
      )

    case 'imageAlbum':
      if (Array.isArray(message.content)) {
        return (
          <div style={bubbleStyle}>
            <AlbumBubble
              images={(message.content as Array<{ url: string; full: string }>).map(
                (item) => item.url
              )}
              onOpenAlbum={() => onOpenAlbum(message.content as Array<{ url: string; full: string }>)}
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
  recordIconContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    // The background color changes to red if isRecording
  },
  recordIcon: {
    color: '#fff',
    fontSize: 14,
  },
}