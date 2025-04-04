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

// export default MessageBubble