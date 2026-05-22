import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useAuth } from '@/context/AuthContext'
import { loadCartItems, saveCartItems } from '@/lib/storage'
import { toast } from '@/lib/toast'
import type { CartItem } from '@/types'

interface CartContextValue {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'key' | 'quantity'> & { quantity?: number }) => boolean
  updateQuantity: (key: string, quantity: number) => void
  removeItem: (key: string) => void
  clearCart: () => void
  subtotal: () => number
  itemCount: () => number
  isAdding: boolean
}

const CartContext = createContext<CartContextValue | null>(null)

function CartProviderInner({ children }: { children: ReactNode }) {
  const { user, token } = useAuth()
  const [items, setItems] = useState<CartItem[]>(loadCartItems)
  const [isAdding, setIsAdding] = useState(false)

  const isCustomerLoggedIn =
    Boolean(token) && user?.role === 'customer'

  useEffect(() => {
    saveCartItems(items)
  }, [items])

  const addItem = useCallback(
    (item: Omit<CartItem, 'key' | 'quantity'> & { quantity?: number }): boolean => {
      if (!isCustomerLoggedIn) {
        toast.error('Sign in required', 'Please log in to add items to your cart.')
        return false
      }

      setIsAdding(true)
      const key = item.variantId ? `v-${item.variantId}` : `p-${item.productId}`
      setItems((prev) => {
        const list = Array.isArray(prev) ? prev : []
        const existing = list.find((i) => i.key === key)
        if (existing) {
          return list.map((i) =>
            i.key === key
              ? { ...i, quantity: i.quantity + (item.quantity ?? 1) }
              : i,
          )
        }
        return [...list, { ...item, key, quantity: item.quantity ?? 1 }]
      })
      toast.success('Added to cart', item.name)
      setTimeout(() => setIsAdding(false), 350)
      return true
    },
    [isCustomerLoggedIn],
  )

  const updateQuantity = useCallback((key: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => (Array.isArray(prev) ? prev : []).filter((i) => i.key !== key))
      return
    }
    setItems((prev) =>
      (Array.isArray(prev) ? prev : []).map((i) =>
        i.key === key ? { ...i, quantity } : i,
      ),
    )
  }, [])

  const removeItem = useCallback((key: string) => {
    setItems((prev) => (Array.isArray(prev) ? prev : []).filter((i) => i.key !== key))
    toast.info('Removed from cart')
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const subtotal = useCallback(() => {
    const list = Array.isArray(items) ? items : []
    return list.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
  }, [items])

  const itemCount = useCallback(() => {
    const list = Array.isArray(items) ? items : []
    return list.reduce((sum, i) => sum + i.quantity, 0)
  }, [items])

  const value = useMemo(
    () => ({
      items: Array.isArray(items) ? items : [],
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      subtotal,
      itemCount,
      isAdding,
    }),
    [items, addItem, updateQuantity, removeItem, clearCart, subtotal, itemCount, isAdding],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function CartProvider({ children }: { children: ReactNode }) {
  return <CartProviderInner>{children}</CartProviderInner>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
