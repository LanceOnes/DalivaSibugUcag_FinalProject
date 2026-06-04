import type { ReactNode } from 'react'
import { AuthProvider } from '@/context/AuthContext'
import { CartProvider } from '@/context/CartContext'
import { ScheduleProvider } from '@/context/ScheduleContext'
import { Toaster } from '@/components/ui/toaster'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ScheduleProvider>
        <CartProvider>
          {children}
          <Toaster />
        </CartProvider>
      </ScheduleProvider>
    </AuthProvider>
  )
}
