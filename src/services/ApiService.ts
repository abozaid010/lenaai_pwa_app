export class ApiService {
  private static instance: ApiService;
  private baseUrl = 'https://api.lenaai.net';

  private constructor() {}

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  public async sendToLanggraphChat(query: string, unitId?: string) {
    const payload = {
      phone_number: localStorage.getItem('phone_number') || '',
      query: query,
      client_id: 'DREAM_HOMES',
      platform: 'website',
      ...(unitId && { unit_id: unitId })
    }

    try {
      const response = await fetch(`${this.baseUrl}/langgraph_chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        console.error('Server returned error:', response.status)
        return null
      }

      const data = await response.json()
      console.log('Server data:', data)
      return data
    } catch (err) {
      console.error('Error calling API:', err)
      return null
    }
  }
} 