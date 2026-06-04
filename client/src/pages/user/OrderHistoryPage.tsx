import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { axiosInstance } from '@/lib/axiosInstance'
import type { Order } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge'
import { formatPeso } from '@/lib/utils'
import { Spinner } from '@/components/ui/spinner'

function formatTime12Hour(time: string) {
  const [hours, minutes] = time.split(':').map(Number)
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return time
  }

  const period = hours >= 12 ? 'PM' : 'AM'
  const hour12 = hours % 12 || 12
  return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`
}

function formatSlotLabel(label: string | null) {
  if (!label) {
    return ''
  }

  return label
    .split('-')
    .map((part) => formatTime12Hour(part.trim()))
    .join(' - ')
}

function formatScheduledLabel(dateString: string, timeLabel: string | null) {
  const date = new Date(dateString)
  const formattedDate = new Intl.DateTimeFormat('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'Asia/Manila',
  }).format(date)

  if (!timeLabel) {
    return formattedDate
  }

  const formattedTime = formatSlotLabel(timeLabel)
  return `${formattedDate} · ${formattedTime}`
}

async function fetchAllOrders(): Promise<Order[]> {
  const { data } = await axiosInstance.get('/orders', { params: { page: 1 } })
  let list: Order[] = Array.isArray(data.data) ? data.data : []
  const lastPage = data.last_page ?? 1

  if (lastPage > 1) {
    const pages = await Promise.all(
      Array.from({ length: lastPage - 1 }, (_, i) =>
        axiosInstance.get('/orders', { params: { page: i + 2 } }).then((res) => res.data.data ?? []),
      ),
    )
    list = [...list, ...pages.flat()]
  }

  return list
}

export function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetchAllOrders()
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }, [])

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
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-belly-brown">Orders</h2>
        <p className="mt-1 text-sm text-belly-brown/50">
          {orders.length} order{orders.length === 1 ? '' : 's'}
        </p>
      </div>

      <div className="space-y-3">
        {orders.map((order) => (
          <Card
            key={order.id}
            className={
              ['delivered', 'cancelled'].includes(order.status)
                ? 'card-hover glass-card'
                : 'glass-card border-belly-gold bg-belly-gold/5'
            }
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-base font-semibold">{order.order_number}</CardTitle>
                <p className="text-sm capitalize text-belly-brown/60">{order.fulfillment_type}</p>
              </div>
              <OrderStatusBadge status={order.status} />
            </CardHeader>
            <CardContent className="flex items-end justify-between text-sm">
              <div className="text-belly-brown/70">
                <p>{formatScheduledLabel(order.scheduled_date, order.scheduled_time)}</p>
              </div>
              <p className="font-bold text-belly-red">{formatPeso(Number(order.total))}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
