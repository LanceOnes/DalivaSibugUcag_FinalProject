import { Link, useLocation, useParams } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'
import type { Order } from '@/types'
import { Button } from '@/components/ui/button'
import { formatPeso } from '@/lib/utils'

export function OrderSuccessPage() {
  const { orderNumber } = useParams()
  const location = useLocation()
  const order = (location.state as { order?: Order })?.order

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <CheckCircle className="mx-auto h-16 w-16 text-belly-green" />
      <h1 className="mt-4 font-display text-3xl font-bold text-belly-brown">Order Placed!</h1>
      <p className="mt-2 text-belly-brown/70">
        Your pre-order <strong className="text-belly-red">{orderNumber}</strong> has been received.
      </p>
      {order && (
        <div className="glass-card mt-6 p-6 text-left text-sm">
          <p>Total: <strong>{formatPeso(Number(order.total))}</strong></p>
          <p className="mt-1 font-semibold text-belly-gold">
            50% downpayment due: {formatPeso(Number(order.downpayment_amount))}
          </p>
          <p className="mt-3 text-xs text-belly-brown/60">
            We will contact you to confirm payment and schedule details.
          </p>
        </div>
      )}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link to="/account/orders" className="cursor-pointer">
          <Button variant="outline">View My Orders</Button>
        </Link>
        <Link to="/menu" className="cursor-pointer">
          <Button variant="gold">Continue Shopping</Button>
        </Link>
      </div>
    </div>
  )
}
