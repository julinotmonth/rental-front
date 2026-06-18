// src/store/authStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '@/types'
import api, { ApiError } from '@/lib/api'

interface AuthState {
  user: User | null
  token: string | null
  role: 'user' | 'admin' | null
  login: (usernameOrEmail: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
}

interface RegisterData {
  nama: string
  username: string
  email: string
  noHp: string
  password: string
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      role: null,

      login: async (usernameOrEmail, password) => {
        const res: any = await api.post('/auth/login', { usernameOrEmail, password }, false)
        const { user, token } = res.data
        set({ user, token, role: user.role })
      },

      register: async (data) => {
        const res: any = await api.post('/auth/register', data, false)
        const { user, token } = res.data
        set({ user, token, role: user.role })
      },

      logout: () => {
        set({ user: null, token: null, role: null })
      },
    }),
    {
      name: 'ps-rental-auth',
      partialize: (state) => ({ user: state.user, token: state.token, role: state.role }),
    }
  )
)
