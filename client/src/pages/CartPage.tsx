import { Link } from 'react-router-dom'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { useCartStore } from '@/stores/cartStore'
import { formatPeso } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export function CartPage() {
  const { items, updateQuantity, removeItem, subtotal } = useCartStore()

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="font-display text-3xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-belly-brown/60">Add some belly goodness from our menu!</p>
        <Link to="/menu" className="mt-6 inline-block">
          <Button variant="gold">Browse Menu</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold text-belly-brown">Your Cart</h1>
      <div className="mt-6 space-y-4">
        {items.map((item) => (
          <Card key={item.key} className="flex items-center justify-between gap-4 p-4">
            <div>
              <p className="font-semibold">{item.name}</p>
              {item.sizeLabel && <p className="text-sm text-belly-brown/60">{item.sizeLabel}</p>}
              <p className="text-sm font-medium text-belly-red">{formatPeso(item.unitPrice)} each</p>
            </div>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => updateQuantity(item.key, item.quantity - 1)} className="rounded-full p-1 hover:bg-belly-brown/5">
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-6 text-center font-semibold">{item.quantity}</span>
              <button type="button" onClick={() => updateQuantity(item.key, item.quantity + 1)} className="rounded-full p-1 hover:bg-belly-brown/5">
                <Plus className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => removeItem(item.key)} className="ml-2 text-belly-red">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </Card>
        ))}
      </div>
      <div className="mt-8 rounded-2xl bg-white p-6 shadow-lg">
        <div className="flex justify-between text-lg font-bold">
          <span>Subtotal</span>
          <span className="text-belly-red">{formatPeso(subtotal())}</span>
        </div>
        <p className="mt-2 text-xs text-belly-brown/60">50% downpayment required at checkout. Delivery fee calculated separately.</p>
        <Link to="/checkout" className="mt-4 block">
          <Button variant="gold" className="w-full" size="lg">Proceed to Checkout</Button>
        </Link>
      </div>
    </div>
  )
}
