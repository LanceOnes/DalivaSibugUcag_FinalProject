import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { format, addDays } from 'date-fns'
import { Plus, Trash2 } from 'lucide-react'
import { axiosInstance } from '@/lib/axiosInstance'
import { toast } from '@/lib/toast'
import { formatPeso } from '@/lib/utils'
import type { Order, OrderItem, OrderStatus, Product, TimeSlot } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'

const statuses: OrderStatus[] = [
  'pending',
  'confirmed',
  'preparing',
  'ready_for_pickup',
  'delivered',
  'cancelled',
]

type LineDraft = {
  key: string
  selection: string
  quantity: number
}

type ProductOption = {
  value: string
  label: string
  unitPrice: number
}

function toDateInputValue(dateString: string) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString
  }
  const d = new Date(dateString)
  if (Number.isNaN(d.getTime())) {
    return format(addDays(new Date(), 2), 'yyyy-MM-dd')
  }
  return format(d, 'yyyy-MM-dd')
}

function itemToSelection(item: OrderItem): string {
  if (item.product_variant_id) {
    return `v-${item.product_variant_id}`
  }
  if (item.product_id) {
    return `p-${item.product_id}`
  }
  return ''
}

function itemsToLines(items: OrderItem[]): LineDraft[] {
  return items.map((item) => ({
    key: `line-${item.id}`,
    selection: itemToSelection(item),
    quantity: item.quantity,
  }))
}

function buildProductOptions(products: Product[]): ProductOption[] {
  const options: ProductOption[] = []

  for (const product of products) {
    if (!product.is_active) continue

    if (product.category === 'belly') {
      const variants = product.variants ?? product.active_variants ?? []
      for (const variant of variants) {
        if (!variant.is_active) continue
        options.push({
          value: `v-${variant.id}`,
          label: `${product.name} — ${variant.size_label}`,
          unitPrice: Number(variant.price),
        })
      }
    } else if (product.price != null) {
      options.push({
        value: `p-${product.id}`,
        label: product.name,
        unitPrice: Number(product.price),
      })
    }
  }

  return options
}

function selectionToPayload(selection: string, quantity: number) {
  if (selection.startsWith('v-')) {
    return {
      product_variant_id: Number(selection.slice(2)),
      quantity,
    }
  }
  return {
    product_id: Number(selection.slice(2)),
    quantity,
  }
}

interface EditOrderModalProps {
  order: Order
  onClose: () => void
  onSaved: (order: Order) => void
}

export function EditOrderModal({ order, onClose, onSaved }: EditOrderModalProps) {
  const minDate = format(addDays(new Date(), 1), 'yyyy-MM-dd')

  const [customerName, setCustomerName] = useState(order.customer_name)
  const [phone, setPhone] = useState(order.phone)
  const [email, setEmail] = useState(order.email ?? '')
  const [fulfillment, setFulfillment] = useState<'pickup' | 'delivery'>(order.fulfillment_type)
  const [address, setAddress] = useState(order.delivery_address ?? '')
  const [area, setArea] = useState(order.delivery_area ?? '')
  const [scheduledDate, setScheduledDate] = useState(toDateInputValue(order.scheduled_date))
  const [status, setStatus] = useState<OrderStatus>(order.status)
  const [notes, setNotes] = useState(order.notes ?? '')
  const [lines, setLines] = useState<LineDraft[]>(() => itemsToLines(order.items ?? []))
  const [productOptions, setProductOptions] = useState<ProductOption[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [slotId, setSlotId] = useState<number | null>(order.time_slot_id ?? null)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [saving, setSaving] = useState(false)

  const units = lines.reduce((sum, line) => sum + line.quantity, 0)
  const deliveryFee = Number(order.delivery_fee)

  const optionMap = useMemo(
    () => new Map(productOptions.map((o) => [o.value, o])),
    [productOptions],
  )

  const previewSubtotal = lines.reduce((sum, line) => {
    const opt = optionMap.get(line.selection)
    if (!opt) return sum
    return sum + opt.unitPrice * line.quantity
  }, 0)

  const previewTotal = previewSubtotal + (fulfillment === 'delivery' ? deliveryFee : 0)

  useEffect(() => {
    axiosInstance
      .get('/admin/products')
      .then(({ data }) => {
        const options = buildProductOptions(data.products ?? [])
        setProductOptions(options)
        setLines((current) =>
          current.map((line) =>
            line.selection || options.length === 0
              ? line
              : { ...line, selection: options[0].value },
          ),
        )
      })
      .finally(() => setLoadingProducts(false))
  }, [])

  useEffect(() => {
    setLoadingSlots(true)
    axiosInstance
      .get('/time-slots/available', { params: { date: scheduledDate, type: fulfillment } })
      .then(({ data }) => {
        let available: TimeSlot[] = data.slots ?? []
        if (order.time_slot_id && !available.some((s) => s.id === order.time_slot_id)) {
          available = [
            {
              id: order.time_slot_id,
              label: order.scheduled_time ?? 'Current slot',
              start_time: '',
              end_time: '',
              available_spots: units,
            },
            ...available,
          ]
        }
        setSlots(available)
        setSlotId((current) => {
          if (current && available.some((s) => s.id === current)) {
            return current
          }
          if (order.time_slot_id && available.some((s) => s.id === order.time_slot_id)) {
            return order.time_slot_id
          }
          return available[0]?.id ?? null
        })
      })
      .finally(() => setLoadingSlots(false))
  }, [scheduledDate, fulfillment, order.time_slot_id, order.scheduled_time, units])

  const selectedSlot = slots.find((s) => s.id === slotId)
  const availableSpots = selectedSlot?.available_spots ?? 0
  const slotOverCapacity = status !== 'cancelled' && units > availableSpots

  const addLine = () => {
    const first = productOptions[0]
    if (!first) {
      toast.error('No products available')
      return
    }
    setLines((prev) => [
      ...prev,
      { key: `new-${Date.now()}`, selection: first.value, quantity: 1 },
    ])
  }

  const updateLine = (key: string, patch: Partial<LineDraft>) => {
    setLines((prev) => prev.map((line) => (line.key === key ? { ...line, ...patch } : line)))
  }

  const removeLine = (key: string) => {
    setLines((prev) => (prev.length <= 1 ? prev : prev.filter((line) => line.key !== key)))
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()

    if (lines.length === 0) {
      toast.error('Add at least one item')
      return
    }

    if (lines.some((line) => !line.selection)) {
      toast.error('Select a product for each line')
      return
    }

    if (slotOverCapacity) {
      toast.error(
        'Not enough slot capacity',
        `This slot only has ${availableSpots} spot(s) left but the order needs ${units}.`,
      )
      return
    }

    setSaving(true)
    try {
      const selectedSlot = slots.find((s) => s.id === slotId)
      const { data } = await axiosInstance.put(`/admin/orders/${order.id}`, {
        customer_name: customerName,
        phone,
        email: email || null,
        fulfillment_type: fulfillment,
        delivery_address: fulfillment === 'delivery' ? address : null,
        delivery_area: fulfillment === 'delivery' ? area : null,
        scheduled_date: scheduledDate,
        time_slot_id: slotId,
        scheduled_time: selectedSlot?.label ?? order.scheduled_time,
        status,
        notes: notes || null,
        items: lines.map((line) => selectionToPayload(line.selection, line.quantity)),
      })
      toast.success('Order updated')
      onSaved(data.order)
      onClose()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error('Update failed', msg || 'Could not save changes.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold">Edit order</h2>
        <p className="mt-1 font-mono text-sm text-gray-500">{order.order_number}</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <Label>Status</Label>
            <select
              className="mt-1 flex h-11 w-full rounded-xl border border-belly-brown/20 px-3 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value as OrderStatus)}
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          <section className="rounded-xl border border-belly-brown/10 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-belly-brown">Order items</h3>
              <Button type="button" variant="outline" size="sm" onClick={addLine} disabled={loadingProducts}>
                <Plus className="h-4 w-4" /> Add item
              </Button>
            </div>

            {loadingProducts ? (
              <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                <Spinner size="sm" /> Loading products…
              </div>
            ) : (
              <ul className="mt-3 space-y-3">
                {lines.map((line) => {
                  const opt = optionMap.get(line.selection)
                  const lineTotal = opt ? opt.unitPrice * line.quantity : 0

                  return (
                    <li
                      key={line.key}
                      className="grid gap-2 rounded-lg bg-belly-cream/40 p-3 sm:grid-cols-[1fr_88px_88px_auto]"
                    >
                      <div>
                        <Label className="text-xs">Product</Label>
                        <select
                          className="mt-1 flex h-10 w-full rounded-lg border border-belly-brown/20 bg-white px-2 text-sm"
                          value={line.selection}
                          onChange={(e) => updateLine(line.key, { selection: e.target.value })}
                          required
                        >
                          <option value="">Select…</option>
                          {productOptions.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label} — {formatPeso(o.unitPrice)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <Label className="text-xs">Qty</Label>
                        <Input
                          type="number"
                          min={1}
                          className="mt-1 h-10"
                          value={line.quantity}
                          onChange={(e) =>
                            updateLine(line.key, {
                              quantity: Math.max(1, Number(e.target.value) || 1),
                            })
                          }
                        />
                      </div>
                      <div className="flex flex-col justify-end">
                        <span className="text-xs text-gray-500">Line total</span>
                        <span className="text-sm font-semibold">{formatPeso(lineTotal)}</span>
                      </div>
                      <div className="flex items-end justify-end">
                        <button
                          type="button"
                          className="cursor-pointer rounded-lg p-2 text-red-600 transition hover:bg-red-50 disabled:opacity-30"
                          onClick={() => removeLine(line.key)}
                          disabled={lines.length <= 1}
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}

            <div className="mt-4 space-y-1 border-t pt-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>{formatPeso(previewSubtotal)}</span>
              </div>
              {fulfillment === 'delivery' && deliveryFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery</span>
                  <span>{formatPeso(deliveryFee)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span className="text-belly-red">{formatPeso(previewTotal)}</span>
              </div>
              <p className="text-xs text-gray-500">{units} slot spot(s) for this order</p>
            </div>
          </section>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Customer name</Label>
              <Input required value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
            </div>
            <div>
              <Label>Phone</Label>
              <Input required value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
          </div>

          <div>
            <Label>Fulfillment</Label>
            <select
              className="mt-1 flex h-11 w-full rounded-xl border border-belly-brown/20 px-3 text-sm capitalize"
              value={fulfillment}
              onChange={(e) => setFulfillment(e.target.value as 'pickup' | 'delivery')}
            >
              <option value="pickup">Pickup</option>
              <option value="delivery">Delivery</option>
            </select>
          </div>

          {fulfillment === 'delivery' && (
            <>
              <div>
                <Label>Delivery address</Label>
                <Textarea value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
              <div>
                <Label>Area / barangay</Label>
                <Input value={area} onChange={(e) => setArea(e.target.value)} />
              </div>
            </>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Scheduled date</Label>
              <Input
                type="date"
                required
                min={minDate}
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
              />
            </div>
            <div>
              <Label>Time slot</Label>
              {loadingSlots ? (
                <div className="mt-1 flex h-11 items-center gap-2 text-sm text-gray-500">
                  <Spinner size="sm" /> Loading…
                </div>
              ) : (
                <select
                  className="mt-1 flex h-11 w-full rounded-xl border border-belly-brown/20 px-3 text-sm"
                  value={slotId ?? ''}
                  onChange={(e) => setSlotId(e.target.value ? Number(e.target.value) : null)}
                >
                  {slots.length === 0 && <option value="">No slots available</option>}
                  {slots.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label} ({s.available_spots} left)
                    </option>
                  ))}
                </select>
              )}
              {slotOverCapacity && (
                <p className="mt-1 text-xs font-medium text-red-600">
                  Cart uses {units} spots but only {availableSpots} remain in this slot.
                </p>
              )}
            </div>
          </div>

          <div>
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Special instructions…" />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !slotId || loadingProducts || lines.length === 0}>
              {saving ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
