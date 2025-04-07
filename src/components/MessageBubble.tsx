'use client'
import React, { useEffect, useState, useRef } from 'react'

import '../app/globals.css'

import styles from '../app/styles'
import Image from 'next/image'
import AlbumBubble from './AlbumBubble'
import AlbumModal from './AlbumModal'
import type { Message } from '../types/Message'

// =============== MessageBubble Component ===============
export default function MessageBubble({
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
          {renderVoiceMessage(message.content as string, message.duration)}
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

const renderVoiceMessage = (content: string, duration?: string) => (
  <div style={styles.voiceContainer}>
    <audio src={content} controls style={styles.audioPlayer} />
    {duration && <span style={styles.duration}>{duration}</span>}
  </div>
)

// export default MessageBubble