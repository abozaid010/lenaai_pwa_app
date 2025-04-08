'use client'

// components/AlbumBubble.tsx
import React from 'react'
import Image from 'next/image'

interface AlbumBubbleProps {
  images: string[]
  onOpenAlbum: () => void
  propertyId?: string
}

export default function AlbumBubble({
  images,
  onOpenAlbum,
  propertyId
}: AlbumBubbleProps) {
  console.log('AlbumBubble component with propertyId:', propertyId)
  
  // Show only first 3 images to avoid long bubbles
  const visibleImages = images.length <= 3 ? images : images.slice(0, 3)
  const hasMore = images.length > 3

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        cursor: 'pointer',
      }}
      onClick={() => {
        console.log('AlbumBubble clicked, propertyId =', propertyId)
        onOpenAlbum()
      }}
    >
      <div style={{ fontSize: '14px', marginBottom: '4px' }}>
        {images.length} photos{' '}
        <span style={{ color: '#6F49FF' }}>View All &rarr;</span>
        {propertyId && <span style={{ fontSize: '10px', marginLeft: '5px', color: '#666' }}>(ID: {propertyId})</span>}
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px',
          maxWidth: '250px',
        }}
      >
        {visibleImages.map((url, i) => (
          <div key={i} style={{ position: 'relative', height: '80px', width: '80px' }}>
            <img
              src={url}
              alt={`Album thumbnail ${i + 1}`}
              style={{
                objectFit: 'cover',
                height: '100%',
                width: '100%',
                borderRadius: '4px',
              }}
            />
            {i === 2 && hasMore ? (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '4px',
                  fontSize: '16px',
                }}
              >
                +{images.length - 3}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  )
}
  