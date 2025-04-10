import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface GlobalState {
  clientId: string
  setClientId: (id: string) => void
}

export const useGlobalState = create<GlobalState>()(
  persist(
    (set) => ({
      clientId: '',
      setClientId: (id: string) => set({ clientId: id }),
    }),
    {
      name: 'global-state', // name of the item in localStorage
    }
  )
) 