'use client'

import React, { useEffect, useState, useRef } from 'react'

// If you have global CSS or want to rely on CSS variables (dark mode), do:
import './globals.css'

// Next.js <Image /> for future expansions if you like
import Image from 'next/image'
import AlbumBubble from '../components/AlbumBubble'
import AlbumModal from '../components/AlbumModal'
// import styles from './styles'
// ------------------ Types ------------------
type Message = {
  id: number
  type: 'text' | 'voice' | 'imageAlbum'
  content: string | string[] | Array<{ url: string; full: string }>
  sender: 'user' | 'server'
}

// ---------- Helper Functions ----------
let globalMessageId = 1
function getNextId() {
  return globalMessageId++
}

function getRandomEgyptPhoneNumber(): string {
  const prefixes = ['010', '011', '012', '015']
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
  let rest = ''
  for (let i = 0; i < 8; i++) {
    rest += Math.floor(Math.random() * 10)
  }
  return prefix + rest
}

// ---------- MAIN CHAT PAGE COMPONENT ----------
export default function ChatPage() {
  // -------- Chat State --------
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')  // typed text
  const [phoneNumber, setPhoneNumber] = useState('')

  // -------- Album Modal --------
  const [selectedAlbum, setSelectedAlbum] = useState<Array<{ url: string; full: string }> | null>(null)

  // -------- Voice Recording --------
  const [isRecording, setIsRecording] = useState(false)
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([]) // store audio data here

  // Hardcoded client info
  const clientId = 'DREAM_HOMES'
  const STORAGE_KEY = phoneNumber ? `chat_${phoneNumber}` : 'myChatMessages'

  // ==============================
  //   1) On Load: phone number
  // ==============================
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

  // ==============================
  //   2) Load chat from storage
  // ==============================
  useEffect(() => {
    if (!phoneNumber) return
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Message[]
        if (Array.isArray(parsed)) {
          setMessages(parsed)
          // Update global ID so we don't reuse
          const maxId = parsed.reduce((acc, msg) => Math.max(acc, msg.id), 0)
          globalMessageId = maxId + 1
        }
      } catch (err) {
        console.error('Failed to parse saved messages:', err)
      }
    }
  }, [phoneNumber])

  // ==============================
  //   3) Persist chat changes
  // ==============================
  useEffect(() => {
    if (!phoneNumber) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
  }, [messages, phoneNumber])

  // ==============================
  //   CLEAR chat
  // ==============================
  const handleClearChat = () => {
    setMessages([])
    localStorage.removeItem(STORAGE_KEY)
    globalMessageId = 1
  }

  // ==============================
  //   ALBUM MODAL HANDLERS
  // ==============================
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

  // ==============================
  //   SEND TEXT -> API
  // ==============================
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

    // 2) Clear the input
    setNewMessage('')

    // 3) Prepare payload
    const payload = {
      phone_number: phoneNumber,
      query: userMsg.content,
      client_id: clientId,
      platform: 'website',
    }

    // 4) Call the backend
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

      // a) main text
      newMessages.push({
        id: getNextId(),
        type: 'text',
        content: data.message || '(No message received)',
        sender: 'server',
      })

      // b) properties
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

      // 6) Append server messages
      setMessages((prev) => [...prev, ...newMessages])
    } catch (err) {
      console.error('Error calling API:', err)
    }
  }

  // ==============================
  //   VOICE RECORDING
  // ==============================
  const handleStartRecording = async () => {
    console.log('handleStartRecording invoked')
    if (!navigator.mediaDevices?.getUserMedia) {
      alert('MediaRecorder not supported')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      chunksRef.current = []

      mediaRecorder.onstart = () => {
        console.log('MediaRecorder onstart')
      }
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          console.log('Received audio data:', e.data.size, 'bytes')
          chunksRef.current.push(e.data)
        }
      }
      mediaRecorder.onstop = () => {
        console.log('MediaRecorder onstop, chunk count:', chunksRef.current.length)
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        sendVoiceMessage(url)
      }
      mediaRecorder.onerror = (err) => {
        console.error('MediaRecorder error:', err)
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
    console.log('handleStopRecording invoked')
    if (recorder) {
      recorder.stop()
      setRecorder(null)
    }
    setIsRecording(false)
    console.log('Stopped recording')
  }

  // Called when we finalize an audio message
  const sendVoiceMessage = (audioUrl: string) => {
    console.log('sendVoiceMessage with audio:', audioUrl)
    // 1) user voice message
    const voiceMsg: Message = {
      id: getNextId(),
      type: 'voice',
      content: audioUrl, // we store the blob URL
      sender: 'user',
    }
    setMessages((prev) => [...prev, voiceMsg])

    // 2) Optionally send to server if needed
    // e.g. to handle voice messages server-side, you'd do a fetch here
  }

  // ==============================
  //   RENDER
  // ==============================
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

      {/* Info: phone number */}
      <div style={{ padding: '0 10px', fontStyle: 'italic' }}>
        Your Phone Number: {phoneNumber || 'loading...'}
      </div>

      {/* Clear Chat */}
      <button style={styles.clearButton} onClick={handleClearChat}>
        Clear Chat
      </button>

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

      {/* Footer with text input or record icon */}
      <footer style={styles.footer}>
        <input
          type="text"
          style={styles.input}
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />

        {newMessage.trim().length > 0 ? (
          // If user typed something, show "Send"
            <button style={styles.sendButton} onClick={handleSendText}>
            ➤
            </button>
        ) : (
          // If no text, show the record icon
          <div
            style={{
              ...styles.recordIconContainer,
              backgroundColor: isRecording ? 'red' : '#25D366',
            }}
            onPointerDown={handleStartRecording}
            onPointerUp={handleStopRecording}
            onTouchStart={handleStartRecording}
            onTouchEnd={handleStopRecording}
          >
            <div style={styles.recordIcon}>
              {isRecording ? 'REC' : '🎤'}
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

// =============== MessageBubble Component ===============
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
      return <div style={bubbleStyle}>{message.content as string}</div>

    case 'voice':
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
                (x) => x.url
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


// =============== Styles ===============
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    maxWidth: 600,
    margin: '0 auto',
    border: '1px solid #ccc',
    background: 'radial-gradient(circle, #f5f5f5, #e0e0e0)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px',
    borderBottom: '1px solid #ccc',
    backgroundColor: '#f5f5f5',
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
    border: '1px solid #ccc',
    cursor: 'pointer',
    borderRadius: '4px',
    backgroundColor: '#f0f0f0',
  },
  chatArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    padding: '10px',
    overflowY: 'auto',
    backgroundColor: '#fafafa',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#DCF8C6',
    color: '#000',
    padding: '10px',
    borderRadius: '8px',
    maxWidth: '60%',
    whiteSpace: 'pre-wrap',
  },
  serverBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    color: '#000',
    padding: '10px',
    borderRadius: '8px',
    maxWidth: '60%',
    whiteSpace: 'pre-wrap',
    border: '1px solid #ccc',
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    borderTop: '1px solid #ccc',
    padding: '10px',
    backgroundColor: '#f5f5f5',
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
    width: '40px',
    height: '40px',
    fontSize: '16px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  recordIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  recordIcon: {
    color: '#fff',
    fontSize: 14,
  },
}