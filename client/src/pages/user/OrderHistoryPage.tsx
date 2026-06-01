import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { axiosInstance } from '@/lib/axiosInstance'
import type { Order } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge'
import { formatPeso } from '@/lib/utils'
import { Spinner } from '@/components/ui/spinner'

export function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const loadOrders = () => {
    setLoading(true)
    axiosInstance
      .get('/orders')
      .then(({ data }) => setOrders(data.data ?? data))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const completedStatuses: Order['status'][] = ['delivered', 'cancelled']
  const currentOrder = orders.find((order) => !completedStatuses.includes(order.status))
  const orderHistory = orders.filter((order) => completedStatuses.includes(order.status))

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 py-16">
        <Spinner />
        <span className="text-sm text-belly-brown/50">Loading orders…</span>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="font-display text-xl font-bold text-belly-brown">Orders</h2>
          <p className="mt-1 text-sm text-belly-brown/50">No orders yet</p>
        </div>
        <div className="rounded-2xl border border-dashed border-belly-brown/15 bg-white/50 px-6 py-12 text-center">
          <p className="text-sm text-belly-brown/60">You haven&apos;t placed any orders yet.</p>
          <Link to="/menu" className="mt-3 inline-block cursor-pointer text-sm font-medium text-belly-red hover:underline">
            Browse menu →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-xl font-bold text-belly-brown">Orders</h2>
        <p className="mt-1 text-sm text-belly-brown/50">
          {orders.length} order{orders.length === 1 ? '' : 's'}
        </p>
      </div>

      {currentOrder && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-belly-brown">Current Order</h3>
          <Card className="glass-card border-belly-gold bg-belly-gold/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-base font-semibold">{currentOrder.order_number}</CardTitle>
                <p className="text-sm text-belly-brown/60">In progress</p>
              </div>
              <OrderStatusBadge status={currentOrder.status} />
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex flex-col gap-2 text-belly-brown/70">
                <p>Scheduled: {currentOrder.scheduled_date}</p>
                <p>Type: {currentOrder.fulfillment_type}</p>
                <p>Total: <span className="font-semibold text-belly-red">{formatPeso(Number(currentOrder.total))}</span></p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {orderHistory.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-belly-brown">Order History</h3>
          {orderHistory.map((o) => (
            <Card key={o.id} className="card-hover glass-card">
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
