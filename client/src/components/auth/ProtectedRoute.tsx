import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export function ProtectedRoute({
  children,
  role,
}: {
  children: React.ReactNode
  role?: 'customer' | 'admin'
}) {
  const { user, token, isAuthReady } = useAuth()
  const location = useLocation()

  if (!token && !localStorage.getItem('belly_token')) {
    const loginPath = role === 'admin' ? '/admin/login' : '/login'
    return <Navigate to={loginPath} state={{ from: location }} replace />
  }

  if (!isAuthReady) {
    return <p className="py-16 text-center text-sm text-belly-brown/60">Loading authentication…</p>
  }

  if (!user) {
    const loginPath = role === 'admin' ? '/admin/login' : '/login'
    return <Navigate to={loginPath} state={{ from: location }} replace />
  }

  if (role && user.role !== role) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/'} replace />
  }

  return <>{children}</>
}
