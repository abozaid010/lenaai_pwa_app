import Helper from './Helper'
import { Message } from '@/types/Message'

export const createMessagesFromResponse = (data: any): Message[] => {
  const newMessages: Message[] = []
  let responsePropertyId = data.property_id  || ''
  console.log('Found property_id in properties array:', responsePropertyId)

  // Add main response message
  newMessages.push({
    id: Helper.getNextId(),
    type: 'text',
    content: data.message || '(No message received)',
    sender: 'server',
    duration: '',
    propertyId: responsePropertyId
  })

  // Handle properties if they exist
  if (Array.isArray(data.properties)) {
    data.properties.forEach((prop: any) => {
      console.log('Processing property:', prop)
      
      // Get property_id for this specific property
      const propertyId = prop.property_id || responsePropertyId
      
      console.log(`Property ID for this property: ${propertyId}`)
      
      const description = prop.description || ''
      const images = prop.metadata?.images || []

      if (description) {
        newMessages.push({
          id: Helper.getNextId(),
          type: 'text',
          content: description,
          sender: 'server',
          duration: '',
          propertyId: propertyId
        })
      }
      
      if (Array.isArray(images) && images.length > 0) {
        const albumItems = images.map((imgObj: any) => ({
          url: imgObj.url,
          full: imgObj.url
        }))
        
        console.log('Creating album message with propertyId:', propertyId)
        
        newMessages.push({
          id: Helper.getNextId(),
          type: 'imageAlbum',
          content: albumItems,
          sender: 'server',
          duration: '',
          propertyId: propertyId
        })
      }
    })
  }

  console.log('Created messages with propertyIds:', newMessages.map(m => m.propertyId))
  return newMessages
} 