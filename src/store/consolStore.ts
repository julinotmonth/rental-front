// src/store/consolStore.ts
import { create } from 'zustand'
import { Console } from '@/types'
import api from '@/lib/api'

interface CreateConsolData {
  nama: string
  deskripsi: string
  hargaPerJam: number
  stok: number
  status: Console['status']
  gambar?: string
}

interface ConsolState {
  consoles: Console[]
  isLoading: boolean
  fetchConsoles: () => Promise<void>
  addConsole: (data: CreateConsolData) => Promise<void>
  updateConsole: (id: string, data: Partial<CreateConsolData>) => Promise<void>
  deleteConsole: (id: string) => Promise<void>
}

export const useConsolStore = create<ConsolState>((set) => ({
  consoles: [],
  isLoading: false,

  fetchConsoles: async () => {
    set({ isLoading: true })
    try {
      const res: any = await api.get('/consoles', false)
      set({ consoles: res.data, isLoading: false })
    } catch (err) {
      console.error('fetchConsoles error:', err)
      set({ isLoading: false })
    }
  },

  addConsole: async (data) => {
    const res: any = await api.post('/consoles', data)
    set((state) => ({ consoles: [...state.consoles, res.data] }))
  },

  updateConsole: async (id, data) => {
    const res: any = await api.put(`/consoles/${id}`, data)
    set((state) => ({
      consoles: state.consoles.map((c) => (c.id === id ? res.data : c)),
    }))
  },

  deleteConsole: async (id) => {
    await api.delete(`/consoles/${id}`)
    set((state) => ({
      consoles: state.consoles.filter((c) => c.id !== id),
    }))
  },
}))
