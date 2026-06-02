import { Link } from 'react-router-dom'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { formatPeso } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export function CartPage() {
  const { items, updateQuantity, removeItem, subtotal } = useCart()

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="font-display text-3xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-belly-brown/60">Add some belly goodness from our menu!</p>
        <Link to="/menu" className="mt-6 inline-block cursor-pointer">
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
          <Card key={item.key} className="glass-card flex items-center justify-between gap-4 p-4">
            <div>
              <p className="font-semibold">{item.name}</p>
              {item.sizeLabel && <p className="text-sm text-belly-brown/60">{item.sizeLabel}</p>}
              <p className="text-sm font-medium text-belly-red">{formatPeso(item.unitPrice)} each</p>
            </div>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => updateQuantity(item.key, item.quantity - 1)} className="cursor-pointer rounded-full p-1 transition-colors hover:bg-belly-brown/5">
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-6 text-center font-semibold">{item.quantity}</span>
              <button type="button" onClick={() => updateQuantity(item.key, item.quantity + 1)} className="cursor-pointer rounded-full p-1 transition-colors hover:bg-belly-brown/5">
                <Plus className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => removeItem(item.key)} className="ml-2 cursor-pointer text-belly-red transition-opacity hover:opacity-70">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </Card>
        ))}
      </div>
      <div className="glass-card mt-8 p-6">
        <div className="flex justify-between text-lg font-bold">
          <span>Subtotal</span>
          <span className="text-belly-red">{formatPeso(subtotal())}</span>
        </div>
        <p className="mt-2 text-xs text-belly-brown/60">Delivery fee is calculated separately at checkout.</p>
        <Link to="/checkout" className="mt-4 block cursor-pointer">
          <Button variant="gold" className="w-full" size="lg">Proceed to Checkout</Button>
        </Link>
      </div>
    </div>
  )
}
