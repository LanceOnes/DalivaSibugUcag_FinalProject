import type { Order } from '@/types'
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge'
import { formatPeso } from '@/lib/utils'
import { Button } from '@/components/ui/button'

function formatSlotLabel(label: string | null) {
  if (!label) return ''

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
  const formattedDate = new Intl.DateTimeFormat('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'Asia/Manila',
  }).format(new Date(dateString))

  if (!timeLabel) return formattedDate
  return `${formattedDate} · ${formatSlotLabel(timeLabel)}`
}

function formatPlacedAt(dateString: string) {
  return new Intl.DateTimeFormat('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'Asia/Manila',
  }).format(new Date(dateString))
}

interface ViewOrderModalProps {
  order: Order
  onClose: () => void
}

export function ViewOrderModal({ order, onClose }: ViewOrderModalProps) {
  const items = order.items ?? []
  const deliveryFee = Number(order.delivery_fee)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Order details</h2>
            <p className="mt-1 font-mono text-sm text-gray-600">{order.order_number}</p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>

        <p className="mt-2 text-xs text-gray-500">Placed {formatPlacedAt(order.created_at)}</p>

        <section className="mt-6 space-y-2 text-sm">
          <h3 className="font-semibold text-gray-800">Customer</h3>
          <p>{order.customer_name}</p>
          <p className="text-gray-600">{order.phone}</p>
          {order.email && <p className="text-gray-600">{order.email}</p>}
        </section>

        <section className="mt-5 space-y-2 text-sm">
          <h3 className="font-semibold text-gray-800">Schedule</h3>
          <p>{formatScheduledDate(order.scheduled_date, order.scheduled_time)}</p>
          <p className="capitalize text-gray-600">{order.fulfillment_type}</p>
          {order.fulfillment_type === 'delivery' && (
            <>
              {order.delivery_address && (
                <p className="text-gray-600">{order.delivery_address}</p>
              )}
              {order.delivery_area && (
                <p className="text-gray-600">Area: {order.delivery_area}</p>
              )}
            </>
          )}
        </section>

        <section className="mt-5">
          <h3 className="text-sm font-semibold text-gray-800">Items</h3>
          <ul className="mt-2 divide-y rounded-lg border text-sm">
            {items.length === 0 ? (
              <li className="p-3 text-gray-500">No line items</li>
            ) : (
              items.map((item) => (
                <li key={item.id} className="flex items-start justify-between gap-3 p-3">
                  <div>
                    <p className="font-medium">{item.item_name}</p>
                    {item.size_label && (
                      <p className="text-xs text-gray-500">{item.size_label}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      {formatPeso(Number(item.unit_price))} × {item.quantity}
                    </p>
                  </div>
                  <p className="shrink-0 font-medium">{formatPeso(Number(item.line_total))}</p>
                </li>
              ))
            )}
          </ul>
        </section>

        <section className="mt-5 space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Subtotal</span>
            <span>{formatPeso(Number(order.subtotal))}</span>
          </div>
          {order.fulfillment_type === 'delivery' && deliveryFee > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Delivery fee</span>
              <span>{formatPeso(deliveryFee)}</span>
            </div>
          )}
          <div className="flex justify-between border-t pt-2 text-base font-bold">
            <span>Total</span>
            <span className="text-belly-red">{formatPeso(Number(order.total))}</span>
          </div>
          {items.length > 0 && (
            <p className="text-xs text-gray-500">
              {items.reduce((sum, i) => sum + i.quantity, 0)} unit(s) in this order
            </p>
          )}
        </section>

        {order.notes && (
          <section className="mt-5 text-sm">
            <h3 className="font-semibold text-gray-800">Notes</h3>
            <p className="mt-1 rounded-lg bg-gray-50 p-3 text-gray-700">{order.notes}</p>
          </section>
        )}

        <div className="mt-6 flex justify-end">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
