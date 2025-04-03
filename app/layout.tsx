// app/layout.tsx
import React from 'react'
import './globals.css' // or any global CSS

export const metadata = {
  title: 'LenaAI Chat',
  description: 'A WhatsApp-like chat PWA',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}