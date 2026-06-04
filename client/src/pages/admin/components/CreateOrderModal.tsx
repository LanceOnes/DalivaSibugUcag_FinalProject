import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { format, addDays } from 'date-fns'
import { Plus, Trash2 } from 'lucide-react'
import { axiosInstance } from '@/lib/axiosInstance'
import { toast } from '@/lib/toast'
import { formatPeso } from '@/lib/utils'
import type { TimeSlot } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'
import { buildProductOptions, selectionToPayload, type ProductOption } from '@/pages/admin/components/orderFormUtils'

type LineDraft = {
  key: string
  selection: string
  quantity: number
}

interface CreateOrderModalProps {
  onClose: () => void
  onCreated: () => void
}

export function CreateOrderModal({ onClose, onCreated }: CreateOrderModalProps) {
  const minDate = format(addDays(new Date(), 1), 'yyyy-MM-dd')
  const deliveryFeeDefault = 150

  const [customerName, setCustomerName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [fulfillment, setFulfillment] = useState<'pickup' | 'delivery'>('pickup')
  const [address, setAddress] = useState('')
  const [area, setArea] = useState('')
  const [scheduledDate, setScheduledDate] = useState(minDate)
  const [notes, setNotes] = useState('')
  const [lines, setLines] = useState<LineDraft[]>([])
  const [productOptions, setProductOptions] = useState<ProductOption[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [slotId, setSlotId] = useState<number | null>(null)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [saving, setSaving] = useState(false)

  const units = lines.reduce((sum, line) => sum + line.quantity, 0)
  const deliveryFee = fulfillment === 'delivery' ? deliveryFeeDefault : 0

  const optionMap = useMemo(
    () => new Map(productOptions.map((o) => [o.value, o])),
    [productOptions],
  )

  const previewSubtotal = lines.reduce((sum, line) => {
    const opt = optionMap.get(line.selection)
    if (!opt) return sum
    return sum + opt.unitPrice * line.quantity
  }, 0)

  const previewTotal = previewSubtotal + deliveryFee

  useEffect(() => {
    axiosInstance
      .get('/admin/products')
      .then(({ data }) => {
        const options = buildProductOptions(data.products ?? [])
        setProductOptions(options)
        if (options.length > 0) {
          setLines([{ key: 'line-1', selection: options[0].value, quantity: 1 }])
        }
      })
      .finally(() => setLoadingProducts(false))
  }, [])

  useEffect(() => {
    if (units < 1) {
      setSlots([])
      setSlotId(null)
      return
    }
    setLoadingSlots(true)
    axiosInstance
      .get('/time-slots/available', {
        params: { date: scheduledDate, type: fulfillment, units_needed: units },
      })
      .then(({ data }) => {
        const available: TimeSlot[] = data.slots ?? []
        setSlots(available)
        setSlotId(available[0]?.id ?? null)
      })
      .finally(() => setLoadingSlots(false))
  }, [scheduledDate, fulfillment, units])

  const selectedSlot = slots.find((s) => s.id === slotId)
  const availableSpots = selectedSlot?.available_spots ?? 0
  const slotOverCapacity = units > availableSpots

  const addLine = () => {
    const first = productOptions[0]
    if (!first) {
      toast.error('No products available')
      return
    }
    setLines((prev) => [...prev, { key: `new-${Date.now()}`, selection: first.value, quantity: 1 }])
  }

  const updateLine = (key: string, patch: Partial<LineDraft>) => {
    setLines((prev) => prev.map((line) => (line.key === key ? { ...line, ...patch } : line)))
  }

  const removeLine = (key: string) => {
    setLines((prev) => (prev.length <= 1 ? prev : prev.filter((line) => line.key !== key)))
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()

    if (lines.length === 0 || lines.some((line) => !line.selection)) {
      toast.error('Add at least one product')
      return
    }

    if (!slotId) {
      toast.error('Select a time slot')
      return
    }

    if (slotOverCapacity) {
      toast.error(
        'Not enough slot capacity',
        `This slot only has ${availableSpots} spot(s) left but the order needs ${units}.`,
      )
      return
    }

    if (fulfillment === 'delivery' && !address.trim()) {
      toast.error('Delivery address is required')
      return
    }

    setSaving(true)
    try {
      const selected = slots.find((s) => s.id === slotId)
      await axiosInstance.post('/admin/orders', {
        customer_name: customerName,
        phone,
        email: email || null,
        fulfillment_type: fulfillment,
        delivery_address: fulfillment === 'delivery' ? address : null,
        delivery_area: fulfillment === 'delivery' ? area : null,
        delivery_fee: deliveryFee,
        scheduled_date: scheduledDate,
        time_slot_id: slotId,
        scheduled_time: selected?.label ?? null,
        notes: notes || null,
        status: 'pending',
        items: lines.map((line) => selectionToPayload(line.selection, line.quantity)),
      })
      toast.success('Order created', 'Phone order saved successfully.')
      onCreated()
      onClose()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error('Could not create order', msg || 'Please check the details and try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold">Add order (phone)</h2>
        <p className="mt-1 text-sm text-gray-500">Create an order for a customer who called in.</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
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
                            updateLine(line.key, { quantity: Math.max(1, Number(e.target.value) || 1) })
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
              {fulfillment === 'delivery' && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery</span>
                  <span>{formatPeso(deliveryFee)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span className="text-belly-red">{formatPeso(previewTotal)}</span>
              </div>
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
              <Label>Email (optional)</Label>
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
                <Textarea required value={address} onChange={(e) => setAddress(e.target.value)} />
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
                  {slots.length === 0 && (
                    <option value="">No slots fit this order — change date or items</option>
                  )}
                  {slots.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label} ({s.available_spots} left)
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          <div>
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Phone order notes…" />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !slotId || loadingProducts || lines.length === 0}>
              {saving ? 'Creating…' : 'Create order'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
