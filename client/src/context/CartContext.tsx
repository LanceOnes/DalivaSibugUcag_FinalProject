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
import { useSchedule } from '@/context/ScheduleContext'
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
  const schedule = useSchedule()
  const [items, setItems] = useState<CartItem[]>(loadCartItems)
  const [isAdding, setIsAdding] = useState(false)

  const isCustomerLoggedIn =
    Boolean(token) && user?.role === 'customer'

  useEffect(() => {
    saveCartItems(items)
  }, [items])

  useEffect(() => {
    const units = items.reduce((sum, i) => sum + i.quantity, 0)
    if (units > 0) {
      schedule.refreshSlots(units)
    }
  }, [items, schedule.refreshSlots])

  const totalUnits = useCallback(() => {
    const list = Array.isArray(items) ? items : []
    return list.reduce((sum, i) => sum + i.quantity, 0)
  }, [items])

  const addItem = useCallback(
    (item: Omit<CartItem, 'key' | 'quantity'> & { quantity?: number }): boolean => {
      if (!isCustomerLoggedIn) {
        toast.error('Sign in required', 'Please log in to add items to your cart.')
        return false
      }

      if (!schedule.slotId) {
        toast.error('Select a time slot first', 'Choose your pickup or delivery date and time above.')
        return false
      }

      const addQty = item.quantity ?? 1
      const key = item.variantId ? `v-${item.variantId}` : `p-${item.productId}`
      const list = Array.isArray(items) ? items : []
      const existing = list.find((i) => i.key === key)
      const otherUnits = list
        .filter((i) => i.key !== key)
        .reduce((sum, i) => sum + i.quantity, 0)
      const newTotal = otherUnits + (existing ? existing.quantity + addQty : addQty)

      if (newTotal > schedule.availableSpots) {
        toast.error(
          'Not enough spots left',
          `This time slot only has ${schedule.availableSpots} spot(s) left (max ${schedule.maxUnitsPerSlot}).`,
        )
        return false
      }

      setIsAdding(true)
      setItems((prev) => {
        const current = Array.isArray(prev) ? prev : []
        const found = current.find((i) => i.key === key)
        if (found) {
          return current.map((i) =>
            i.key === key
              ? { ...i, quantity: i.quantity + addQty }
              : i,
          )
        }
        return [...current, { ...item, key, quantity: addQty }]
      })
      toast.success('Added to cart', item.name)
      setTimeout(() => setIsAdding(false), 350)
      return true
    },
    [isCustomerLoggedIn, items, schedule.slotId, schedule.availableSpots, schedule.maxUnitsPerSlot],
  )

  const updateQuantity = useCallback(
    (key: string, quantity: number) => {
      if (quantity <= 0) {
        setItems((prev) => (Array.isArray(prev) ? prev : []).filter((i) => i.key !== key))
        return
      }

      const list = Array.isArray(items) ? items : []
      const otherUnits = list
        .filter((i) => i.key !== key)
        .reduce((sum, i) => sum + i.quantity, 0)

      if (otherUnits + quantity > schedule.availableSpots) {
        toast.error(
          'Not enough spots left',
          `This time slot only has ${schedule.availableSpots} spot(s) left (max ${schedule.maxUnitsPerSlot}).`,
        )
        return
      }

      setItems((prev) =>
        (Array.isArray(prev) ? prev : []).map((i) =>
          i.key === key ? { ...i, quantity } : i,
        ),
      )
    },
    [items, schedule.availableSpots, schedule.maxUnitsPerSlot],
  )

  const removeItem = useCallback((key: string) => {
    setItems((prev) => (Array.isArray(prev) ? prev : []).filter((i) => i.key !== key))
    toast.info('Removed from cart')
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const subtotal = useCallback(() => {
    const list = Array.isArray(items) ? items : []
    return list.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0)
  }, [items])

  const itemCount = useCallback(() => totalUnits(), [totalUnits])

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
