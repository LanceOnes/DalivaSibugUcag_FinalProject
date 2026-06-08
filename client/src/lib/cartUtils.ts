import type { CartItem } from '@/types'

export function cartItemUsesSlot(item: CartItem): boolean {
  if (item.category === 'belly') return true
  if (item.category === 'addon' || item.category === 'drink') return false
  return Boolean(item.variantId)
}

export function slotUnitsFromCartItems(items: CartItem[]): number {
  const list = Array.isArray(items) ? items : []
  return list.reduce((sum, i) => sum + (cartItemUsesSlot(i) ? i.quantity : 0), 0)
}
