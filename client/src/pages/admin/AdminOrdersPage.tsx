import { useEffect, useState } from 'react'
import { axiosInstance } from '@/lib/axiosInstance'
import type { Order } from '@/types'
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge'
import { formatPeso } from '@/lib/utils'
import { ViewOrderModal } from '@/pages/admin/components/ViewOrderModal'
import { CreateOrderModal } from '@/pages/admin/components/CreateOrderModal'
import { EditOrderModal } from '@/pages/admin/components/EditOrderModal'
import { Button } from '@/components/ui/button'

const statuses = ['pending', 'confirmed', 'preparing', 'ready_for_pickup', 'delivered', 'cancelled'] as const

function formatSlotLabel(label: string | null) {
  if (!label) {
    return ''
  }

  const toStandardTime = (timeValue: string) => {
    const [hours, minutes] = timeValue.trim().split(':').map(Number)
    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
      return timeValue.trim()
    }

    const period = hours >= 12 ? 'PM' : 'AM'
    const hour12 = hours % 12 || 12
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`
  }

  return label.split('-').map((part) => toStandardTime(part)).join(' - ')
}

function formatScheduledDate(dateString: string, timeLabel: string | null) {
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

  return `${formattedDate} · ${formatSlotLabel(timeLabel)}`
}

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filter, setFilter] = useState('')
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [loadingOrder, setLoadingOrder] = useState(false)

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

  const fetchOrder = async (order: Order) => {
    if (order.items?.length) {
      return order
    }
    const { data } = await axiosInstance.get(`/admin/orders/${order.id}`)
    return data.order as Order
  }

  const openView = async (order: Order) => {
    setLoadingOrder(true)
    try {
      setViewingOrder(await fetchOrder(order))
    } finally {
      setLoadingOrder(false)
    }
  }

  const openEdit = async (order: Order) => {
    setLoadingOrder(true)
    try {
      setEditingOrder(await fetchOrder(order))
    } finally {
      setLoadingOrder(false)
    }
  }

  const handleOrderSaved = () => {
    load(page)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Orders</h1>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <select className="rounded-lg border px-3 py-2 text-sm" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All statuses</option>
          {statuses.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
        <div className="flex items-center gap-3">
          <Button type="button" size="sm" onClick={() => setShowCreate(true)}>
            Add order
          </Button>
          <span className="text-sm text-gray-500">Page {meta.current_page} of {meta.last_page}</span>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">Order</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Scheduled</th>
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
                <td className="p-3">{formatScheduledDate(o.scheduled_date, o.scheduled_time)}</td>
                <td className="p-3">{formatPeso(Number(o.total))}</td>
                <td className="p-3"><OrderStatusBadge status={o.status} /></td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="rounded-full border border-belly-brown/20 px-3 py-1 text-xs font-semibold text-belly-brown transition hover:bg-belly-cream disabled:opacity-50"
                      onClick={() => openView(o)}
                      disabled={loadingOrder}
                    >
                      View
                    </button>
                    <button
                      type="button"
                      className="rounded-full bg-belly-gold px-3 py-1 text-xs font-semibold text-belly-brown transition hover:bg-belly-gold/90 disabled:opacity-50"
                      onClick={() => openEdit(o)}
                      disabled={loadingOrder}
                    >
                      Edit
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {viewingOrder && (
        <ViewOrderModal order={viewingOrder} onClose={() => setViewingOrder(null)} />
      )}

      {showCreate && (
        <CreateOrderModal
          onClose={() => setShowCreate(false)}
          onCreated={handleOrderSaved}
        />
      )}

      {editingOrder && (
        <EditOrderModal
          order={editingOrder}
          onClose={() => setEditingOrder(null)}
          onSaved={handleOrderSaved}
        />
      )}

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
