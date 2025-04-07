'use client'
import React, { useEffect, useState, useRef } from 'react'

// Import your global styles or variables
import './globals.css'
import styles from './styles'
import Helper from '../utils/Helper'
import AlbumBubble from '../components/AlbumBubble'
import AlbumModal from '../components/AlbumModal'
import MessageBubble from '../components/MessageBubble'
import { Message } from '@/types/Message'

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
      // Set recording state immediately for UI feedback
      setIsRecording(true)
      
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
      mediaRecorder.onstop = async () => {
        console.log('MediaRecorder onstop, chunk count:', chunksRef.current.length)
        if (chunksRef.current.length > 0) {
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
          const url = URL.createObjectURL(blob)
          await sendVoiceMessage(url, blob)
          
          // Clean up the stream tracks
          stream.getTracks().forEach(track => track.stop())
        }
      }
      mediaRecorder.onerror = (err) => {
        console.error('MediaRecorder error:', err)
        setIsRecording(false)
      }

      // Start recording immediately
      mediaRecorder.start()
      setRecorder(mediaRecorder)
    } catch (err) {
      console.error('Error accessing microphone:', err)
      setIsRecording(false)
    }
  }

  const handleStopRecording = () => {
    console.log('handleStopRecording invoked')
    setIsRecording(false)
    if (recorder) {
      recorder.stop()
      setRecorder(null)
      console.log('Stopped recording.')
    } else {
      console.log('No recorder to stop.')
    }
  }

  // Update the getAudioDuration function
  const getAudioDuration = async (blob: Blob): Promise<number> => {
    return new Promise((resolve) => {
      const audio = new Audio()
      const url = URL.createObjectURL(blob)
      
      const timeoutId = setTimeout(() => {
        URL.revokeObjectURL(url)
        resolve(0) // Resolve with 0 if loading takes too long
      }, 3000) // 3 second timeout
      
      audio.addEventListener('loadedmetadata', () => {
        clearTimeout(timeoutId)
        const duration = isNaN(audio.duration) ? 0 : audio.duration
        URL.revokeObjectURL(url)
        resolve(Math.round(duration))
      })
      
      audio.addEventListener('error', () => {
        clearTimeout(timeoutId)
        URL.revokeObjectURL(url)
        resolve(0)
      })
      
      audio.src = url
    })
  }

  // Update the sendVoiceMessage function
  const sendVoiceMessage = async (audioUrl: string, audioBlob: Blob) => {
    console.log('sendVoiceMessage with audio:', audioUrl)
    
    // 1) Get audio duration
    const duration = await getAudioDuration(audioBlob)
    let durationText = '0:00'
    
    if (duration > 0 && !isNaN(duration)) {
      const minutes = Math.floor(duration / 60)
      const seconds = Math.floor(duration % 60)
      durationText = `${minutes}:${String(seconds).padStart(2, '0')}`
    }
    
    // 2) Create user voice message
    const voiceMsg: Message = {
      id: Helper.getNextId(),
      type: 'voice',
      content: audioUrl,
      duration: durationText,
      sender: 'user',
    }
    setMessages((prev) => [...prev, voiceMsg])

    // 3) Prepare form data for API
    const formData = new FormData()
    formData.append('phone_number', phoneNumber)
    formData.append('client_id', clientId)
    formData.append('platform', 'website')
    formData.append('file', audioBlob, 'voice.webm')

    // 4) Send to API
    try {
      const response = await fetch('https://api.lenaai.net/voice_process', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      console.log('Voice process response:', data)

      // 5) Build new server messages (same logic as handleSendText)
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
      console.error('Error sending voice to API:', err)
      // Optionally add error message to chat
      setMessages((prev) => [...prev, {
        id: Helper.getNextId(),
        type: 'text',
        content: 'Failed to process voice message. Please try again.',
        sender: 'server',
      }])
    }
  }

  // ==============================
  //   RENDER
  // ==============================
  return (
    <div style={styles.container}>
     

      {/* Header */}
      <header style={{
        ...styles.header,
        backgroundColor: '#6F49FF',
        color: '#FFFFFF',
      }}>
        <div>LenaAI Chat</div>
        <button
          
          onClick={() => (window.location.href = 'tel:+201016080323')}
        >
          &#128222;
        </button>
      </header>
 {/* Development Mode Header View */}
 {process.env.NODE_ENV === 'development' && headerView()}
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
          // Send button
          <button style={{
            ...styles.sendButton,
            backgroundColor: '#6F49FF',
            color: '#FFFFFF',
          }} onClick={handleSendText}>
            ➤
          </button>
        ) : (
          // Record button
          <div
            style={{
              ...styles.recordIconContainer,
              backgroundColor: isRecording ? 'red' : '#6F49FF',
              width: isRecording ? '100px' : '40px',
              height: isRecording ? '100px' : '40px',
              transition: 'all 0.3s ease-in-out',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              cursor: 'pointer'
            }}
            onPointerDown={handleStartRecording}
            onPointerUp={handleStopRecording}
            onTouchStart={handleStartRecording}
            onTouchEnd={handleStopRecording}
          >
            <div style={{
              ...styles.recordIcon,
              color: '#FFFFFF',
              fontSize: isRecording ? '24px' : '20px',
              transition: 'font-size 0.3s ease-in-out'
            }}>
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