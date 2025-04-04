'use client'

// components/AlbumBubble.tsx
import React from 'react'

interface AlbumBubbleProps {
  images: string[]
  onOpenAlbum: () => void
}

export default function AlbumBubble({ images, onOpenAlbum }: AlbumBubbleProps) {
  // Show up to 4 images in preview. If more, display a +N overlay on last one
  const previewLimit = 4
  const previewImages = images.slice(0, previewLimit)
  const remainingCount = images.length - previewLimit

  return (
    <div style={styles.container} onClick={onOpenAlbum}>
      {previewImages.map((imgUrl, idx) => {
        const isLastPreview = idx === previewImages.length - 1
        const hasMore = remainingCount > 0 && isLastPreview

        return (
          <div key={idx} style={styles.imageWrapper}>
            <img src={imgUrl} alt={`Preview ${idx}`} style={styles.previewImage} />
            {hasMore && (
              <div style={styles.overlay}>
                +{remainingCount}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)', // 2 columns
    gap: '5px',
    cursor: 'pointer',
    maxWidth: '250px', // limit bubble width
  },
  imageWrapper: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '4px',
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    color: '#fff',
    fontSize: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
  },
}