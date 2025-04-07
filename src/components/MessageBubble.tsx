'use client'
import React, { useEffect, useState, useRef } from 'react'

import '../app/globals.css'

import styles from '../app/styles'
import Image from 'next/image'
import AlbumBubble from './AlbumBubble'
import AlbumModal from './AlbumModal'
import type { Message } from '../types/Message'

// =============== MessageBubble Component ===============
interface MessageBubbleProps {
  message: Message
  onOpenAlbum?: (images: Array<{ url: string; full: string }>) => void
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onOpenAlbum }) => {

  const bubbleStyle =
    message.sender === 'user' ? styles.userBubble : styles.serverBubble

  const renderVoiceMessage = (content: string, duration: string) => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      position: 'relative'
    }}>
      <audio 
        src={content} 
        controls 
        style={{
          height: '40px',
          minWidth: '200px'
        }} 
      />
      
    </div>
  )

  switch (message.type) {
    case 'text':
      return <div style={bubbleStyle}>{message.content as string}</div>

    case 'voice':
      return (
        <div style={bubbleStyle}>
          {renderVoiceMessage(message.content as string, message.duration || '00:59')}
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
              onOpenAlbum={() => onOpenAlbum?.(message.content as Array<{ url: string; full: string }>)}
            />
          </div>
        )
      }
      return null

    default:
      return null
  }
}

export default MessageBubble