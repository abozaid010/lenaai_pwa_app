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
  const styles = {
    bubble: {
      alignSelf: message.sender === 'user' ? 'flex-end' : 'flex-start',
      backgroundColor: '#0A8996',
      color: '#FFFFFF',
      padding: '10px',
      borderRadius: '8px',
      maxWidth: '60%',
      whiteSpace: 'pre-wrap',
      marginBottom: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    // ... other styles ...
  }

  const bubbleStyle =
    message.sender === 'user' ? styles.userBubble : styles.serverBubble

  const renderVoiceMessage = (content: string, duration?: string) => (
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
      {duration && (
        <span style={{
          fontSize: '12px',
          color: '#666',
          position: 'absolute',
          right: '8px',
          bottom: '-18px'
        }}>
          {duration}
        </span>
      )}
    </div>
  )

  switch (message.type) {
    case 'text':
      return <div style={styles.bubble}>{message.content as string}</div>

    case 'voice':
      return (
        <div style={styles.bubble}>
          {renderVoiceMessage(message.content as string, message.duration)}
        </div>
      )

    case 'imageAlbum':
      if (Array.isArray(message.content)) {
        return (
          <div style={styles.bubble}>
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

export default MessageBubble