export interface Message {
  id: number
  type: 'text' | 'voice' | 'imageAlbum'
  content: string | { url: string; full: string }[]
  sender: 'user' | 'server'
  duration?: string
}