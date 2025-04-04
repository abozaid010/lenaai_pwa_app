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
}: AlbumModalProps) {
  if (!isOpen) return null // No render if modal is closed

  return (
    <div style={styles.overlay}>
      <div style={styles.modalContent}>
        {/* Header */}
        <div style={styles.modalHeader}>
          <button onClick={onClose} style={styles.backButton}>
            &larr;
          </button>
          <span style={styles.title}>You • {images.length} Photos</span>
        </div>

        {/* Scrolling list of images */}
        <div style={styles.imageList}>
          {images.map((imgUrl, idx) => (
            <img
              key={idx}
              src={imgUrl}
              alt={`Album image ${idx}`}
              style={styles.fullImage}
            />
          ))}
        </div>

        {/* Footer with two buttons */}
        <div style={styles.modalFooter}>
          <button style={styles.footerButton} onClick={onLike}>
            Like it
          </button>
          <button style={styles.footerButton} onClick={onFindSomethingElse}>
            Find something else
          </button>
        </div>
      </div>
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '90%',
    maxWidth: '600px',
    height: '90%',
    display: 'flex',
    flexDirection: 'column',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px',
    borderBottom: '1px solid #ccc',
  },
  title: {
    marginLeft: '10px',
    fontWeight: 'bold',
  },
  backButton: {
    border: 'none',
    background: 'none',
    fontSize: '20px',
    cursor: 'pointer',
  },
  imageList: {
    flex: 1,
    overflowY: 'auto',
    padding: '10px',
  },
  fullImage: {
    width: '100%',
    marginBottom: '10px',
    objectFit: 'cover',
    borderRadius: '4px',
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'space-around',
    borderTop: '1px solid #ccc',
    padding: '10px',
  },
  footerButton: {
    flex: 1,
    margin: '0 5px',
    padding: '10px',
    fontSize: '16px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    cursor: 'pointer',
  },
}