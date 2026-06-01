import { useEffect, useState } from 'react'
import { axiosInstance } from '@/lib/axiosInstance'
import type { Order, OrderStatus } from '@/types'
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge'
import { formatPeso } from '@/lib/utils'
import { EditProducts } from '@/pages/admin/components/EditProducts'

const statuses: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready_for_pickup', 'delivered', 'cancelled']

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filter, setFilter] = useState('')
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [editingId, setEditingId] = useState<number | null>(null)

  const load = (pageNumber = 1) => {
    axiosInstance
      .get('/admin/orders', { params: { status: filter || undefined, page: pageNumber } })
      .then(({ data }) => {
        setOrders(data.data ?? [])
        setMeta({
          current_page: data.current_page ?? 1,
          last_page: data.last_page ?? 1,
          total: data.total ?? 0,
        })
      })
  }

  useEffect(() => {
    setPage(1)
  }, [filter])

  useEffect(() => {
    load(page)
  }, [page, filter])

  const updateStatus = async (id: number, status: OrderStatus) => {
    await axiosInstance.patch(`/admin/orders/${id}/status`, { status })
    setEditingId(null)
    load(page)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Orders</h1>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <select className="rounded-lg border px-3 py-2 text-sm" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All statuses</option>
          {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <div className="text-sm text-gray-500">Page {meta.current_page} of {meta.last_page}</div>
      </div>

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
                  {editingId === o.id ? (
                    <EditProducts
                      initialStatus={o.status}
                      onSave={(status) => updateStatus(o.id, status)}
                      onCancel={() => setEditingId(null)}
                    />
                  ) : (
                    <button
                      type="button"
                      className="rounded-full bg-belly-gold px-3 py-1 text-xs font-semibold text-belly-brown transition hover:bg-belly-gold/90"
                      onClick={() => setEditingId(o.id)}
                    >
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 text-sm">
        <span>{meta.total} orders</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            className="rounded border px-3 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-40"
            onClick={() => setPage((value) => Math.max(1, value - 1))}
          >Previous</button>
          <button
            type="button"
            disabled={page >= meta.last_page}
            className="rounded border px-3 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-40"
            onClick={() => setPage((value) => Math.min(meta.last_page, value + 1))}
          >Next</button>
        </div>
      </div>
    </div>
  )
}
