import { useEffect, useState } from 'react'

import { useNavigate, Link } from 'react-router-dom'

import { axiosInstance } from '@/lib/axiosInstance'

import { formatPeso } from '@/lib/utils'

import { useCart } from '@/context/CartContext'

import { useSchedule } from '@/context/ScheduleContext'

import { useAuth } from '@/context/AuthContext'

import { toast } from '@/lib/toast'

import { SchedulePicker } from '@/components/SchedulePicker'

import { Button } from '@/components/ui/button'

import { Input } from '@/components/ui/input'

import { Label } from '@/components/ui/label'

import { Textarea } from '@/components/ui/textarea'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { Spinner, PageSpinnerOverlay } from '@/components/ui/spinner'



export function CheckoutPage() {

  const navigate = useNavigate()

  const { items, subtotal, clearCart, itemCount } = useCart()

  const { user } = useAuth()

  const {

    date,

    fulfillment,

    slotId,

    slots,

    availableSpots,

    refreshSlots,

  } = useSchedule()



  const [name, setName] = useState(user?.name ?? '')

  const [email, setEmail] = useState(user?.email ?? '')

  const [phone, setPhone] = useState(user?.phone ?? '')

  const [address, setAddress] = useState(user?.address ?? '')

  const [area, setArea] = useState('')

  const [deliveryFee, setDeliveryFee] = useState(0)

  const [notes, setNotes] = useState('')

  const [loading, setLoading] = useState(false)

  const [error, setError] = useState('')



  const units = itemCount()

  const cartSubtotal = subtotal()

  const total = cartSubtotal + (fulfillment === 'delivery' ? deliveryFee : 0)

  const canPlaceOrder = Boolean(slotId) && units > 0 && units <= availableSpots



  useEffect(() => {

    if (items.length === 0) navigate('/cart')

  }, [items, navigate])



  useEffect(() => {

    if (units > 0) {

      void refreshSlots(units)

    }

  }, [units, refreshSlots])



  useEffect(() => {

    setDeliveryFee(fulfillment === 'delivery' ? 150 : 0)

  }, [fulfillment])



  const submit = async (e: React.FormEvent) => {

    e.preventDefault()

    if (!canPlaceOrder) {

      setError('Your cart exceeds the remaining spots for this time slot.')

      return

    }

    setError('')

    setLoading(true)

    try {

      const payload = {

        customer_name: name,

        email: email || null,

        phone,

        fulfillment_type: fulfillment,

        delivery_address: fulfillment === 'delivery' ? address : null,

        delivery_area: fulfillment === 'delivery' ? area : null,

        delivery_fee: deliveryFee,

        scheduled_date: date,

        time_slot_id: slotId,

        scheduled_time: slots.find((s) => s.id === slotId)?.label,

        notes,

        items: items.map((i) => ({

          product_id: i.variantId ? undefined : i.productId,

          product_variant_id: i.variantId,

          quantity: i.quantity,

        })),

      }

      const { data } = await axiosInstance.post('/orders', payload)

      if (data.guest_token && !user) {

        localStorage.setItem('belly_guest_token', data.guest_token)

      }

      clearCart()

      toast.success(

        'Order placed!',

        `Order ${data.order.order_number} received. We will follow up with your schedule details.`,

      )

      navigate(`/order-success/${data.order.order_number}`, {

        state: { order: data.order },

      })

    } catch (err: unknown) {

      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message

      setError(msg || 'Failed to place order. Please try again.')

      toast.error('Order failed', msg || 'Please try again.')

    } finally {

      setLoading(false)

    }

  }



  if (items.length === 0) return null



  return (

    <>

      {loading && <PageSpinnerOverlay />}

      <div className="mx-auto max-w-4xl px-4 py-10">

        <h1 className="font-display text-3xl font-bold">Checkout</h1>

        <form onSubmit={submit} className="mt-8 grid gap-8 lg:grid-cols-5">

          <div className="space-y-6 lg:col-span-3">

            <Card className="glass-card">

              <CardHeader><CardTitle>Customer Details</CardTitle></CardHeader>

              <CardContent className="grid gap-4 sm:grid-cols-2">

                <div className="sm:col-span-2">

                  <Label htmlFor="name">Full Name</Label>

                  <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />

                </div>

                <div>

                  <Label htmlFor="phone">Phone</Label>

                  <Input id="phone" required value={phone} onChange={(e) => setPhone(e.target.value)} />

                </div>

                <div>

                  <Label htmlFor="email">Email (optional)</Label>

                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />

                </div>

              </CardContent>

            </Card>



            <SchedulePicker cartUnits={units} compact />



            <Card className="glass-card">

              <CardHeader><CardTitle>Delivery details</CardTitle></CardHeader>

              <CardContent className="space-y-4">

                {fulfillment === 'delivery' && (

                  <>

                    <div>

                      <Label>Delivery Address</Label>

                      <Textarea required value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, barangay, landmarks…" />

                    </div>

                    <div>

                      <Label>Area / Barangay</Label>

                      <Input value={area} onChange={(e) => setArea(e.target.value)} placeholder="e.g. Lawaan, Baybay" />

                    </div>

                    <p className="text-sm font-medium text-belly-green">Delivery fee: {formatPeso(deliveryFee)}</p>

                  </>

                )}

                {fulfillment === 'pickup' && (

                  <p className="text-sm text-belly-brown/70">Pickup at the scheduled time above.</p>

                )}

                <div>

                  <Label>Special Notes</Label>

                  <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Occasion, slicing preference…" />

                </div>

              </CardContent>

            </Card>



            {!user && (

              <p className="text-sm text-belly-brown/70">

                <Link to="/login" className="cursor-pointer text-belly-red underline">Login</Link> to save order history, or continue as guest.

              </p>

            )}

          </div>



          <Card className="glass-card h-fit lg:col-span-2">

            <CardHeader><CardTitle>Order Summary</CardTitle></CardHeader>

            <CardContent className="space-y-3 text-sm">

              {items.map((i) => (

                <div key={i.key} className="flex justify-between">

                  <span>{i.name} {i.sizeLabel && `(${i.sizeLabel})`} ×{i.quantity}</span>

                  <span>{formatPeso(i.unitPrice * i.quantity)}</span>

                </div>

              ))}

              <hr />

              <div className="flex justify-between"><span>Subtotal</span><span>{formatPeso(cartSubtotal)}</span></div>

              {fulfillment === 'delivery' && (

                <div className="flex justify-between"><span>Delivery</span><span>{formatPeso(deliveryFee)}</span></div>

              )}

              <div className="flex justify-between text-lg font-bold"><span>Total</span><span className="text-belly-red">{formatPeso(total)}</span></div>

              <p className="text-xs text-belly-brown/60">{units} item(s) using {units} slot spot(s)</p>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <Button type="submit" variant="gold" className="w-full" disabled={loading || !canPlaceOrder}>

                {loading ? (

                  <span className="flex items-center justify-center gap-2">

                    <Spinner size="sm" className="border-white/30 border-t-white" />

                    Placing Order…

                  </span>

                ) : (

                  'Place Order'

                )}

              </Button>

            </CardContent>

          </Card>

        </form>

      </div>

    </>

  )

}

