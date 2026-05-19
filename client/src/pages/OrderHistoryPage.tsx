import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '@/lib/api'
import type { Order } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge'
import { formatPeso } from '@/lib/utils'

export function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/orders').then(({ data }) => setOrders(data.data ?? data)).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-sm text-belly-brown/50">
        Loading orders…
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-belly-brown">Orders</h2>
        <p className="mt-1 text-sm text-belly-brown/50">
          {orders.length === 0 ? 'No orders yet' : `${orders.length} order${orders.length === 1 ? '' : 's'}`}
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-belly-brown/15 bg-white/50 px-6 py-12 text-center">
          <p className="text-sm text-belly-brown/60">You haven&apos;t placed any orders yet.</p>
          <Link to="/order" className="mt-3 inline-block text-sm font-medium text-belly-red hover:underline">
            Pre-order now →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <Card key={o.id} className="card-hover">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base font-semibold">{o.order_number}</CardTitle>
                <OrderStatusBadge status={o.status} />
              </CardHeader>
              <CardContent className="flex items-end justify-between text-sm">
                <div className="text-belly-brown/70">
                  <p>{o.scheduled_date}</p>
                  <p className="capitalize">{o.fulfillment_type}</p>
                </div>
                <p className="font-bold text-belly-red">{formatPeso(Number(o.total))}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
