import { Badge } from '@/components/ui/badge'
import type { OrderStatus } from '@/types'

const labels: Record<OrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready_for_pickup: 'Ready',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

const variants: Record<OrderStatus, 'default' | 'gold' | 'green' | 'muted'> = {
  pending: 'gold',
  confirmed: 'green',
  preparing: 'gold',
  ready_for_pickup: 'green',
  delivered: 'muted',
  cancelled: 'default',
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge variant={variants[status]}>{labels[status]}</Badge>
}
