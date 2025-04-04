'use client'

// components/AlbumBubble.tsx
import React from 'react'

interface AlbumBubbleProps {
  images: string[]
  onOpenAlbum: () => void
}

export default function AlbumBubble({
  images,
  onOpenAlbum,
}: {
  images: string[]
  onOpenAlbum: () => void
}) {
  // We'll just show up to 4 images in a mini grid. If more, show +N overlay.
  const previewLimit = 4
  const previewImages = images.slice(0, previewLimit)
  const extraCount = images.length - previewLimit

  return (
    <div
      style={bubbleStyles.container}
      onClick={onOpenAlbum}
      title="Open Full Album"
    >
      {previewImages.map((url, idx) => {
        const isLast = idx === previewImages.length - 1
        const hasExtra = extraCount > 0 && isLast
        return (
          <div key={idx} style={bubbleStyles.itemWrapper}>
            {/* next/image usage is optional:
               <Image src={url} alt="thumb" width={80} height={80} style={...}/> 
               For simplicity, we'll do a plain <img> now: */}
            <img
              src={url}
              alt="Album preview"
              style={bubbleStyles.itemImg}
            />
            {hasExtra && (
              <div style={bubbleStyles.overlay}>+{extraCount}</div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// The small grid for the album preview bubble
const bubbleStyles = {
    container: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '5px',
      maxWidth: '250px',
      cursor: 'pointer',
    } as React.CSSProperties,
    itemWrapper: {
      position: 'relative',
      width: '100%',
      height: '100%',
    } as React.CSSProperties,
    itemImg: {
      width: '100%',
      height: '100%',
      borderRadius: 4,
      objectFit: 'cover',
    } as React.CSSProperties,
    overlay: {
      position: 'absolute',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.4)',
      color: '#fff',
      fontSize: 20,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 4,
    } as React.CSSProperties,
  }
  