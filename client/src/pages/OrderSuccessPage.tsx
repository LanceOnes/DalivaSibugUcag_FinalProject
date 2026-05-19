import { Link, useLocation, useParams } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'
import type { Order } from '@/types'
import { Button } from '@/components/ui/button'
import { formatPeso } from '@/lib/utils'

export function OrderSuccessPage() {
  const { orderNumber } = useParams()
  const location = useLocation()
  const order = (location.state as { order?: Order })?.order
  const guestToken = (location.state as { guestToken?: string })?.guestToken

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <CheckCircle className="mx-auto h-16 w-16 text-belly-green" />
      <h1 className="mt-4 font-display text-3xl font-bold text-belly-brown">Order Placed!</h1>
      <p className="mt-2 text-belly-brown/70">Your pre-order <strong className="text-belly-red">{orderNumber}</strong> has been received.</p>
      {order && (
        <div className="mt-6 rounded-2xl bg-white p-6 text-left text-sm shadow-lg">
          <p>Total: <strong>{formatPeso(Number(order.total))}</strong></p>
          <p className="mt-1 text-belly-gold font-semibold">
            50% downpayment due: {formatPeso(Number(order.downpayment_amount))}
          </p>
          {guestToken && (
            <p className="mt-3 rounded-lg bg-belly-cream p-3 text-xs">
              Save your guest token to track: <code className="break-all">{guestToken}</code>
            </p>
          )}
        </div>
      )}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link to="/track"><Button variant="outline">Track Order</Button></Link>
        <Link to="/"><Button variant="gold">Back Home</Button></Link>
      </div>
    </div>
  )
}
