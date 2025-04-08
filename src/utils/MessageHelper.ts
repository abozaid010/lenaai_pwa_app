import Helper from './Helper'
import { Message } from '@/types/Message'

export const createMessagesFromResponse = (data: any): Message[] => {
  const newMessages: Message[] = []

  // Add main response message
  newMessages.push({
    id: Helper.getNextId(),
    type: 'text',
    content: data.message || '(No message received)',
    sender: 'server',
    duration: ''
  })

  // Handle properties if they exist
  if (Array.isArray(data.properties)) {
    data.properties.forEach((prop: any) => {
      const description = prop.description || ''
      const images = prop.metadata?.images || []

      if (description) {
        newMessages.push({
          id: Helper.getNextId(),
          type: 'text',
          content: description,
          sender: 'server',
          duration: ''
        })
      }
      if (Array.isArray(images) && images.length > 0) {
        const albumItems = images.map((imgObj: any) => ({
          url: imgObj.url,
          full: imgObj.url
        }))
        console.log('>>>albumItems', albumItems)
        newMessages.push({
          id: Helper.getNextId(),
          type: 'imageAlbum',
          content: albumItems,
          sender: 'server',
          duration: ''
        })
      }
    })
  }

  return newMessages
} 