import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { axiosInstance } from '@/lib/axiosInstance'
import { loadAuth, persistAuth } from '@/lib/storage'
import { toast } from '@/lib/toast'
import type { User } from '@/types'

interface AuthContextValue {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthReady: boolean
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
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const stored = loadAuth()
  const [user, setUser] = useState<User | null>(stored.user)
  const [token, setToken] = useState<string | null>(stored.token)
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthReady, setIsAuthReady] = useState(false)

  const setAuth = useCallback((nextUser: User, nextToken: string) => {
    setUser(nextUser)
    setToken(nextToken)
    persistAuth(nextUser, nextToken)
  }, [])

  const clearAuth = useCallback(() => {
    setUser(null)
    setToken(null)
    persistAuth(null, null)
  }, [])

  useEffect(() => {
    const onLogout = () => clearAuth()
    window.addEventListener('belly-auth-logout', onLogout)
    return () => window.removeEventListener('belly-auth-logout', onLogout)
  }, [clearAuth])

  const login = useCallback(
    async (loginId: string, password: string, role: 'customer' | 'admin' = 'customer') => {
      setIsLoading(true)
      try {
        const { data } = await axiosInstance.post('/login', {
          login: loginId,
          password,
          role,
        })
        setAuth(data.user, data.token)
        toast.success(
          role === 'admin' ? 'Welcome back, Admin!' : 'Welcome back!',
          `Signed in as ${data.user.name}`,
        )
      } finally {
        setIsLoading(false)
      }
    },
    [setAuth],
  )

  const register = useCallback(
    async (payload: {
      name: string
      email: string
      phone: string
      password: string
      password_confirmation: string
      address?: string
    }) => {
      setIsLoading(true)
      try {
        const { data } = await axiosInstance.post('/register', payload)
        setAuth(data.user, data.token)
        toast.success('Account created!', 'You are now signed in.')
      } finally {
        setIsLoading(false)
      }
    },
    [setAuth],
  )

  const logout = useCallback(async () => {
    try {
      await axiosInstance.post('/logout')
    } catch {
      /* ignore */
    }
    clearAuth()
    toast.success('Signed out', 'See you again soon!')
  }, [clearAuth])

  const fetchMe = useCallback(async () => {
    const t = token || localStorage.getItem('belly_token')
    if (!t) return
    const { data } = await axiosInstance.get('/me')
    setAuth(data.user, t)
  }, [token, setAuth])

  useEffect(() => {
    const t = token || localStorage.getItem('belly_token')
    if (!t) {
      setIsAuthReady(true)
      return
    }

    let active = true
    const loadUser = async () => {
      setIsLoading(true)
      try {
        const { data } = await axiosInstance.get('/me')
        if (!active) return
        setAuth(data.user, t)
      } catch {
        if (!active) return
        clearAuth()
      } finally {
        if (!active) return
        setIsLoading(false)
        setIsAuthReady(true)
      }
    }

    loadUser()

    return () => {
      active = false
    }
  }, [token, setAuth, clearAuth])

  const value = useMemo(
    () => ({ user, token, isLoading, isAuthReady, login, register, logout, fetchMe }),
    [user, token, isLoading, isAuthReady, login, register, logout, fetchMe],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
