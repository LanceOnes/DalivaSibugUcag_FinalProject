import { useState } from 'react'
import { api } from '@/lib/api'
import type { Order } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge'
import { formatPeso } from '@/lib/utils'

export function TrackPage() {
  const [orderNumber, setOrderNumber] = useState('')
  const [guestToken, setGuestToken] = useState('')
  const [order, setOrder] = useState<Order | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const track = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const token = guestToken || localStorage.getItem(`guest_${orderNumber}`) || ''
      const { data } = await api.post('/orders/track', {
        order_number: orderNumber,
        guest_token: token || undefined,
      })
      setOrder(data.order)
    } catch {
      setError('Order not found. Check your order number.')
      setOrder(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <h1 className="font-display text-3xl font-bold text-center">Track Your Order</h1>
      <Card className="mt-8">
        <CardContent className="pt-6">
          <form onSubmit={track} className="space-y-4">
            <div>
              <Label>Order Number</Label>
              <Input placeholder="BL-XXXXXXXX" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} required />
            </div>
            <div>
              <Label>Guest Token (if guest checkout)</Label>
              <Input value={guestToken} onChange={(e) => setGuestToken(e.target.value)} placeholder="Optional" />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" variant="gold" disabled={loading}>
              {loading ? 'Searching…' : 'Track Order'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {order && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{order.order_number}</span>
              <OrderStatusBadge status={order.status} />
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Scheduled:</strong> {order.scheduled_date} {order.scheduled_time}</p>
            <p><strong>Type:</strong> {order.fulfillment_type}</p>
            <p><strong>Total:</strong> {formatPeso(Number(order.total))}</p>
            <p><strong>Downpayment (50%):</strong> {formatPeso(Number(order.downpayment_amount))}</p>
            <ul className="mt-2 border-t pt-2">
              {order.items.map((i) => (
                <li key={i.id}>{i.item_name} {i.size_label} ×{i.quantity}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
