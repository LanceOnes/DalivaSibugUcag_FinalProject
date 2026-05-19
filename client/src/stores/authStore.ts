import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types'
import { api } from '@/lib/api'

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (login: string, password: string, role?: 'customer' | 'admin') => Promise<void>
  register: (data: {
    name: string
    email: string
    phone: string
    password: string
    password_confirmation: string
    address?: string
  }) => Promise<void>
  logout: () => Promise<void>
  fetchMe: () => Promise<void>
  setAuth: (user: User, token: string) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,

      setAuth: (user, token) => {
        localStorage.setItem('belly_token', token)
        set({ user, token })
      },

      login: async (login, password, role = 'customer') => {
        set({ isLoading: true })
        try {
          const { data } = await api.post('/login', { login, password, role })
          get().setAuth(data.user, data.token)
        } finally {
          set({ isLoading: false })
        }
      },

      register: async (payload) => {
        set({ isLoading: true })
        try {
          const { data } = await api.post('/register', payload)
          get().setAuth(data.user, data.token)
        } finally {
          set({ isLoading: false })
        }
      },

      logout: async () => {
        try {
          await api.post('/logout')
        } catch {
          /* ignore */
        }
        localStorage.removeItem('belly_token')
        set({ user: null, token: null })
      },

      fetchMe: async () => {
        const token = get().token || localStorage.getItem('belly_token')
        if (!token) return
        const { data } = await api.get('/me')
        set({ user: data.user, token })
      },
    }),
    {
      name: 'belly-auth',
      partialize: (s) => ({ user: s.user, token: s.token }),
    },
  ),
)
