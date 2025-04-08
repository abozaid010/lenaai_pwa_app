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
import { ApiService } from '../services/ApiService'
import { createMessagesFromResponse } from '../utils/MessageHelper'

// Add this function near the top of the file, after the imports
const apiService = ApiService.getInstance()

export default function ChatPage() {
  // -------- Chat State --------
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')  // typed text
  const [phoneNumber, setPhoneNumber] = useState('')

  // -------- Album Modal --------
  const [selectedAlbum, setSelectedAlbum] = useState<Array<{ url: string; full: string }> | null>(null)
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null)

  // -------- Voice Recording --------
  const [isRecording, setIsRecording] = useState(false)
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([]) // store audio data here

  // Hardcoded client info
  const clientId = 'DREAM_HOMES'
  const STORAGE_KEY = phoneNumber ? `chat_${phoneNumber}` : 'myChatMessages'

  // Add this ref near the top of the component
  const chatAreaRef = useRef<HTMLDivElement>(null);

  // Add a scrollToBottom helper function
  const scrollToBottom = () => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  };

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
    const newNumber = Helper.getRandomEgyptPhoneNumber()
    setPhoneNumber(newNumber)
    localStorage.setItem('phone_number', newNumber)
    Helper.globalMessageId = 1
  }
  function headerView() {
    return <div>
  
        {/* Info: phone number */}
        <div style={{ padding: '0 10px', fontStyle: 'italic' }}>
          Your Phone Number: {phoneNumber || 'loading...'}
        </div>
  
        {/* Debug Info */}
        {process.env.NODE_ENV !== 'production' && (
          <div style={{ padding: '0 10px', fontSize: '12px', color: '#666' }}>
            Selected Property ID: {selectedPropertyId || 'none'}
          </div>
        )}

        {/* Clear Chat */}
        <button style={styles.clearButton} onClick={handleClearChat}>
          Clear Chat
        </button>
    </div>
  
  }
  
  // ==============================
  //   ALBUM MODAL HANDLERS
  // ==============================
  const handleOpenAlbum = (images: Array<{ url: string; full: string }>, propertyId?: string) => {
    // Convert undefined/null to empty string for consistency
    const safePropertyId = propertyId || '';
    console.log('handleOpenAlbum called with propertyId:', safePropertyId);
    
    // Store the album and property ID
    setSelectedAlbum(images);
    setSelectedPropertyId(safePropertyId);
    
    // Verify state was updated
    setTimeout(() => {
      console.log('Selected property ID after state update:', selectedPropertyId);
    }, 0);
  }
  const handleCloseAlbum = () => {
    setSelectedAlbum(null)
    setSelectedPropertyId(null)
  }
  const handleLikeIt = async (propertyId?: string) => {
    console.log('User clicked "Like it"', propertyId)
    console.log('Selected property ID state:', selectedPropertyId)
    
    // Use either the passed propertyId or the selectedPropertyId from state
    // Convert empty strings to undefined
    const effectivePropertyId = propertyId || selectedPropertyId || '';
    console.log('Effective property ID used:', effectivePropertyId)
    
    if (!effectivePropertyId) {
      console.error('No property ID available for Like action');
      return; // Exit early if no property ID
    }
    
    // Add user message to indicate they liked the property
    const userMsg: Message = {
      id: Helper.getNextId(),
      type: 'text',
      content: 'I like this property',
      sender: 'user',
    }
    setMessages((prev) => [...prev, userMsg])
    
    console.log('Calling API with property ID:', effectivePropertyId)
    
    try {
      // Call API with the property ID
      const data = await apiService.sendToLanggraphChat('I like this property', effectivePropertyId)
      
      if (data) {
        console.log('API returned data:', data)
        const newMessages = createMessagesFromResponse(data)
        setMessages((prev) => [...prev, ...newMessages])
      } else {
        console.error('API call failed or returned no data')
      }
    } catch (error) {
      console.error('Error in handleLikeIt:', error);
    } finally {
      // Close the modal after API call completes (success or failure)
      setSelectedAlbum(null)
      setSelectedPropertyId(null)
    }
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

    // 3) Call the backend using the helper function
    if (typeof userMsg.content === 'string') {
      const data = await apiService.sendToLanggraphChat(userMsg.content)

      if (data) {
        const newMessages = createMessagesFromResponse(data)
        setMessages((prev) => [...prev, ...newMessages])
      }
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
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
          channelCount: 1
        } 
      })
      
      // Create MediaRecorder with specific MIME type for iOS
      const mimeType = MediaRecorder.isTypeSupported('audio/mp4') 
        ? 'audio/mp4' 
        : 'audio/webm'
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 128000
      })
      
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
          const blob = new Blob(chunksRef.current, { type: mimeType })
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
    try {
      console.log('sendVoiceMessage with audio:', audioUrl)
      
      // 1) Get audio duration
      const duration = await getAudioDuration(audioBlob)
      let durationText = ''
      
      if (duration > 0 && !isNaN(duration)) {
        const minutes = Math.floor(duration / 60)
        const seconds = Math.floor(duration % 60)
        durationText = `${minutes}:${String(seconds).padStart(2, '0')}`
      }
      
      // 2) Convert blob to base64 for storage
      const reader = new FileReader()
      reader.readAsDataURL(audioBlob)
      reader.onloadend = () => {
        const base64Audio = reader.result as string
        
        // 3) Create user voice message with base64 data
        const voiceMsg: Message = {
          id: Helper.getNextId(),
          type: 'voice',
          content: base64Audio, // Store base64 instead of URL
          duration: durationText || '',
          sender: 'user',
        }
        setMessages((prev) => [...prev, voiceMsg])
      }

      // 4) Prepare form data for API
      const formData = new FormData()
      formData.append('phone_number', phoneNumber)
      formData.append('client_id', clientId)
      formData.append('platform', 'website')
      formData.append('file', audioBlob, 'voice.mp4') // Changed extension to .mp4 for iOS

      // 5) Send to API
      const response = await fetch('https://api.lenaai.net/voice_process', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      console.log('Voice process response:', data)

      const newMessages = createMessagesFromResponse(data)
      setMessages((prev) => [...prev, ...newMessages])

    } catch (err) {
      console.error('Error in sendVoiceMessage:', err)
      setMessages((prev) => [...prev, {
        id: Helper.getNextId(),
        type: 'text',
        content: 'Failed to process voice message. Please try again.',
        sender: 'server',
        duration: ''
      }])
    }
  }

  // ==============================
  //   RENDER
  // ==============================
  useEffect(() => {
    const unitId = localStorage.getItem('unitId')
    if (unitId) {
      console.log('Found unitId in localStorage:', unitId);
      
      const fetchUnitDetails = async () => {
        try {
          console.log('Fetching unit details for:', unitId)
          
          const response = await fetch(`https://api.lenaai.net/units_details/${unitId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          })
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
          
          const data = await response.json()
          console.log('Unit details received:', data)
          
          // Create messages from unit details
          const newMessages: Message[] = []

          // Add unit title as text message
          newMessages.push({
            id: Helper.getNextId(),
            type: 'text',
            content: data.unitTitle || '',
            sender: 'server',
            duration: '',
            propertyId: unitId
          })

          // Add unit details as text message
          const unitDetails = ` ${data.unitTitle || ''}`.trim()

          newMessages.push({
            id: Helper.getNextId(),
            type: 'text',
            content: unitDetails,
            sender: 'server',
            duration: '',
            propertyId: unitId
          })

          // Add images as album if they exist
          if (data.images && data.images.length > 0) {
            const albumItems = data.images.map((img: { thumbnailUrl: string; url: string }) => ({
              url: img.thumbnailUrl,
              full: img.url
            }))
            
            console.log('Adding album message with unitId:', unitId)
            
            newMessages.push({
              id: Helper.getNextId(),
              type: 'imageAlbum',
              content: albumItems,
              sender: 'server',
              duration: '',
              propertyId: unitId
            })
          }

          // Add messages to chat
          setMessages(prev => [...prev, ...newMessages])

          // After unit details are processed, send the like message
          const likeResponse = await apiService.sendToLanggraphChat(`I like this Property`, unitId)

          if (likeResponse) {
            const likeMessages = createMessagesFromResponse(likeResponse)
            setMessages(prev => [...prev, ...likeMessages])
          }

          // Clear unitId from localStorage after all processing
          localStorage.removeItem('unitId')
          
        } catch (error: any) {
          console.error('Error details:', {
            message: error?.message,
            stack: error?.stack,
            unitId
          })
          
          setMessages(prev => [...prev, {
            id: Helper.getNextId(),
            type: 'text',
            content: `Failed to load unit details. Please try again.`,
            sender: 'server',
            duration: ''
          }])
        }
      }
      fetchUnitDetails()
    }
  }, [])

  // Add useEffect to scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Add this handler for keyboard events
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newMessage.trim()) {
      e.preventDefault();
      handleSendText();
    }
  };

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
          onTouchStart={(e) => e.preventDefault()}
        >
          &#128222;
        </button>
      </header>
 {/* Development Mode Header View */}
 { headerView()}
      {/* Chat Area */}
      <div style={styles.chatArea} ref={chatAreaRef}>
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
          onKeyPress={handleKeyPress}
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
            onTouchStart={(e) => {
              e.preventDefault();
              handleStartRecording();
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleStopRecording();
            }}
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
        propertyId={selectedPropertyId || ''}
      />
    </div>
  )
}