import type { CartItem } from '@/types'
import type { User } from '@/types'

/** Normalize cart data (handles legacy Zustand persist shape). */
export function loadCartItems(): CartItem[] {
  try {
    const raw = localStorage.getItem('belly-cart')
    if (!raw) return []

    const parsed: unknown = JSON.parse(raw)

    if (Array.isArray(parsed)) {
      return parsed.filter(isCartItem)
    }

    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'state' in parsed &&
      typeof (parsed as { state?: unknown }).state === 'object' &&
      (parsed as { state: { items?: unknown } }).state !== null &&
      Array.isArray((parsed as { state: { items?: unknown } }).state.items)
    ) {
      const items = (parsed as { state: { items: unknown[] } }).state.items.filter(isCartItem)
      localStorage.setItem('belly-cart', JSON.stringify(items))
      return items
    }
  } catch {
    localStorage.removeItem('belly-cart')
  }
  return []
}

export function saveCartItems(items: CartItem[]) {
  localStorage.setItem('belly-cart', JSON.stringify(items))
}

export function loadAuth(): { user: User | null; token: string | null } {
  try {
    const raw = localStorage.getItem('belly-auth')
    if (raw) {
      const parsed: unknown = JSON.parse(raw)

      if (
        typeof parsed === 'object' &&
        parsed !== null &&
        'state' in parsed &&
        typeof (parsed as { state?: unknown }).state === 'object' &&
        (parsed as { state: { user?: User; token?: string } }).state?.user &&
        (parsed as { state: { token?: string } }).state?.token
      ) {
        const { user, token } = (parsed as { state: { user: User; token: string } }).state
        persistAuth(user, token)
        return { user, token }
      }

      if (
        typeof parsed === 'object' &&
        parsed !== null &&
        'user' in parsed &&
        'token' in parsed &&
        (parsed as { user?: User; token?: string }).user &&
        (parsed as { token?: string }).token
      ) {
        return parsed as { user: User; token: string }
      }
    }
  } catch {
    localStorage.removeItem('belly-auth')
  }

  const token = localStorage.getItem('belly_token')
  const userRaw = localStorage.getItem('belly_user')
  if (token && userRaw) {
    try {
      return { user: JSON.parse(userRaw) as User, token }
    } catch {
      /* fall through */
    }
  }

  return { user: null, token: null }
}

export function persistAuth(user: User | null, token: string | null) {
  if (user && token) {
    localStorage.setItem('belly-auth', JSON.stringify({ user, token }))
    localStorage.setItem('belly_token', token)
    localStorage.setItem('belly_user', JSON.stringify(user))
  } else {
    localStorage.removeItem('belly-auth')
    localStorage.removeItem('belly_token')
    localStorage.removeItem('belly_user')
  }
}

function isCartItem(item: unknown): item is CartItem {
  if (typeof item !== 'object' || item === null) return false
  const i = item as Record<string, unknown>
  return (
    typeof i.key === 'string' &&
    typeof i.productId === 'number' &&
    typeof i.name === 'string' &&
    typeof i.unitPrice === 'number' &&
    typeof i.quantity === 'number'
  )
}
