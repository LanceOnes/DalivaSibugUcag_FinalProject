import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { Order, OrderStatus } from '@/types'
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge'
import { formatPeso } from '@/lib/utils'
const statuses: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready_for_pickup', 'delivered', 'cancelled']

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filter, setFilter] = useState('')

  const load = () => {
    api.get('/admin/orders', { params: { status: filter || undefined } })
      .then(({ data }) => setOrders(data.data ?? []))
  }

  useEffect(() => { load() }, [filter])

  const updateStatus = async (id: number, status: OrderStatus) => {
    await api.patch(`/admin/orders/${id}/status`, { status })
    load()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Orders</h1>
      <select className="mt-4 rounded-lg border px-3 py-2 text-sm" value={filter} onChange={(e) => setFilter(e.target.value)}>
        <option value="">All statuses</option>
        {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      <div className="mt-4 overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">Order</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Date</th>
              <th className="p-3">Total</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t">
                <td className="p-3 font-mono text-xs">{o.order_number}</td>
                <td className="p-3">{o.customer_name}<br /><span className="text-gray-400">{o.phone}</span></td>
                <td className="p-3">{o.scheduled_date}</td>
                <td className="p-3">{formatPeso(Number(o.total))}</td>
                <td className="p-3"><OrderStatusBadge status={o.status} /></td>
                <td className="p-3">
                  <select
                    className="rounded border px-2 py-1 text-xs"
                    value={o.status}
                    onChange={(e) => updateStatus(o.id, e.target.value as OrderStatus)}
                  >
                    {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
