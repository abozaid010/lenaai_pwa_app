'use client'
import React, { useEffect, useState, useRef } from 'react'

// Import your global styles or variables
import './globals.css'
import styles from './styles'

// Import external helpers & types
import Helper from '../utils/Helper'
import Message from '../types/Message'

// Import external components
import AlbumBubble from '../components/AlbumBubble'
import AlbumModal from '../components/AlbumModal'
import MessageBubble from '../components/MessageBubble'
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
  const clientId = 'ALL'
  const STORAGE_KEY = phoneNumber ? `chat_${phoneNumber}` : 'myChatMessages'

  // ==============================
  //   1) On Load: phone number
  // ==============================
  useEffect(() => {
    const storedNumber = localStorage.getItem('phone_number')
    if (storedNumber) {
      setPhoneNumber(storedNumber)
    } else {
      const newNumber = Helper.getRandomEgyptPhoneNumber()
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
          Helper.globalMessageId = maxId + 1
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
    Helper.globalMessageId = 1
  }
  function headerView() {
    return <div>
  
        {/* Info: phone number */}
        <div style={{ padding: '0 10px', fontStyle: 'italic' }}>
          Your Phone Number: {phoneNumber || 'loading...'}
        </div>
  
        {/* Clear Chat */}
        <button style={styles.clearButton} onClick={handleClearChat}>
          Clear Chat
        </button>
    </div>
  
  }
  
  // ==============================
  //   ALBUM MODAL HANDLERS
  // ==============================
  const handleOpenAlbum = (images: Array<{ url: string; full: string }>) => {
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

  // ==============================
  //   SEND TEXT -> API
  // ==============================
  const handleSendText = async () => {
    if (!newMessage.trim()) return

    // 1) Local user message
    const userMsg: Message = {
      id: Helper.getNextId(),
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
        id: Helper.getNextId(),
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
              id: Helper.getNextId(),
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
              id: Helper.getNextId(),
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
      alert('MediaRecorder not supported in this browser or environment.')
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
        // If chunk count is 0, typically means no data was captured
        if (chunksRef.current.length > 0) {
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
          const url = URL.createObjectURL(blob)
          sendVoiceMessage(url)
        } else {
          console.warn('No audio data captured. Possibly pressed mic too briefly or Safari lacks support.')
        }
      }
      mediaRecorder.onerror = (err) => {
        console.error('MediaRecorder error:', err)
      }

      mediaRecorder.start()
      setRecorder(mediaRecorder)
      setIsRecording(true)
      console.log('Recording started (hold at least 1s).')
    } catch (err) {
      console.error('Error accessing microphone:', err)
    }
  }

  const handleStopRecording = () => {
    console.log('handleStopRecording invoked')
    if (recorder) {
      // give it a short delay to ensure data is captured
      setTimeout(() => {
        recorder.stop()
        setRecorder(null)
        setIsRecording(false)
        console.log('Stopped recording (after short delay).')
      }, 100)
    } else {
      console.log('No recorder to stop.')
    }
  }

  // Called when we finalize an audio message
  const sendVoiceMessage = (audioUrl: string) => {
    console.log('sendVoiceMessage with audio:', audioUrl)
    // 1) user voice message
    const voiceMsg: Message = {
      id: Helper.getNextId(),
      type: 'voice',
      content: audioUrl, // we store the blob URL
      sender: 'user',
    }
    setMessages((prev) => [...prev, voiceMsg])

    // 2) Optionally send to server if needed
    // e.g., to handle voice server-side, do a fetch here
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
          onClick={() => (window.location.href = 'tel:+201016080323')}
        >
          📞
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