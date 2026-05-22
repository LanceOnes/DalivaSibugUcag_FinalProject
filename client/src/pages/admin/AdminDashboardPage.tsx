import { useEffect, useState } from 'react'
import { axiosInstance } from '@/lib/axiosInstance'
import { formatPeso } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge'
import type { Order, OrderStatus } from '@/types'

interface DashboardData {
  stats: {
    today_orders: number
    pending_orders: number
    today_revenue: number
    month_revenue: number
    total_customers: number
  }
  recent_orders: Order[]
}

export function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    axiosInstance.get('/admin/dashboard').then(({ data: d }) => setData(d))
  }, [])

  if (!data) return <p>Loading dashboard…</p>

  const stats = [
    { label: "Today's Orders", value: data.stats.today_orders },
    { label: 'Pending', value: data.stats.pending_orders },
    { label: "Today's Revenue", value: formatPeso(data.stats.today_revenue) },
    { label: 'Month Revenue', value: formatPeso(data.stats.month_revenue) },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">{s.label}</CardTitle></CardHeader>
            <CardContent><p className="text-2xl font-bold">{s.value}</p></CardContent>
          </Card>
        ))}
      </div>
      <Card className="mt-8">
        <CardHeader><CardTitle>Recent Orders</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {data.recent_orders.map((o) => (
            <div key={o.id} className="flex items-center justify-between border-b pb-2 text-sm">
              <span>{o.order_number} — {o.customer_name}</span>
              <OrderStatusBadge status={o.status as OrderStatus} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
