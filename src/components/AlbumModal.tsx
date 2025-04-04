'use client'

// components/AlbumModal.tsx
import React from 'react'

interface AlbumModalProps {
  images: string[]
  isOpen: boolean
  onClose: () => void
  onLike: () => void
  onFindSomethingElse: () => void
}

export default function AlbumModal({
  images,
  isOpen,
  onClose,
  onLike,
  onFindSomethingElse,
}: {
  images: string[]
  isOpen: boolean
  onClose: () => void
  onLike: () => void
  onFindSomethingElse: () => void
}) {
  if (!isOpen) return null
  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.content}>
        <div style={modalStyles.header}>
          <button style={modalStyles.backButton} onClick={onClose}>
            &larr;
          </button>
          <span style={{ marginLeft: 10, fontWeight: 'bold' }}>
            {images.length} Photos
          </span>
        </div>

        <div style={modalStyles.body}>
          {images.map((url, i) => (
            <img
              key={i}
              src={url}
              alt={`album-${i}`}
              style={{
                width: '100%',
                objectFit: 'cover',
                marginBottom: 10,
                borderRadius: 4,
              }}
            />
          ))}
        </div>

        <div style={modalStyles.footer}>
          <button style={modalStyles.footerBtn} onClick={onLike}>
            Like it
          </button>
          <button style={modalStyles.footerBtn} onClick={onFindSomethingElse}>
            Find something else
          </button>
        </div>
      </div>
    </div>
  )
}

// The modal
const modalStyles = {
    overlay: {
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
    } as React.CSSProperties,
    content: {
      backgroundColor: '#fff',
      width: '90%',
      maxWidth: 600,
      height: '90%',
      display: 'flex',
      flexDirection: 'column',
      borderRadius: 8,
      overflow: 'hidden',
    } as React.CSSProperties,
    header: {
      display: 'flex',
      alignItems: 'center',
      borderBottom: '1px solid #ccc',
      padding: '10px',
    } as React.CSSProperties,
    backButton: {
      border: 'none',
      background: 'none',
      cursor: 'pointer',
      fontSize: 20,
    } as React.CSSProperties,
    body: {
      flex: 1,
      padding: '10px',
      overflowY: 'auto',
    } as React.CSSProperties,
    footer: {
      display: 'flex',
      justifyContent: 'space-around',
      borderTop: '1px solid #ccc',
      padding: '10px',
    } as React.CSSProperties,
    footerBtn: {
      flex: 1,
      margin: '0 5px',
      padding: '10px',
      fontSize: '16px',
      borderRadius: '4px',
      border: '1px solid #ccc',
      cursor: 'pointer',
    } as React.CSSProperties,
  }
