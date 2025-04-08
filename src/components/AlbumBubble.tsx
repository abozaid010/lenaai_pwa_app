'use client'

// components/AlbumBubble.tsx
import React from 'react'
import Image from 'next/image'

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
  // Filter out empty URLs first
  const validImages = images.filter(url => url && url.trim() !== '');
  
  // We'll just show up to 4 images in a mini grid. If more, show +N overlay.
  const previewLimit = 4
  const previewImages = validImages.slice(0, previewLimit)
  const extraCount = validImages.length - previewLimit
  
  // If no valid images, show a placeholder
  if (previewImages.length === 0) {
    return (
      <div style={bubbleStyles.placeholderContainer} onClick={onOpenAlbum}>
        <div style={bubbleStyles.placeholderText}>No images available</div>
      </div>
    );
  }

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
            <Image 
              src={url} 
              alt="Album preview"
              width={125} 
              height={125}
              style={bubbleStyles.itemImg}
              priority={idx === 0} // Load the first image with priority
              placeholder="blur"
              blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFdwI2U3tLhgAAAABJRU5ErkJggg=="
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
    height: '260px', // Increased height
  } as React.CSSProperties,
  itemWrapper: {
    position: 'relative',
    width: '100%',
    height: '125px', // Fixed height for each item
    borderRadius: '4px',
    overflow: 'hidden',
  } as React.CSSProperties,
  itemImg: {
    width: '100%',
    height: '100%',
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
  placeholderContainer: {
    width: '250px',
    height: '125px',
    backgroundColor: '#f0f0f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
    cursor: 'pointer',
  } as React.CSSProperties,
  placeholderText: {
    color: '#888',
    fontSize: '14px',
  } as React.CSSProperties,
}
  