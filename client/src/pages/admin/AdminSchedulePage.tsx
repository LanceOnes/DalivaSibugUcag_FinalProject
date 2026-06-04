import { useEffect, useState } from 'react'
import { axiosInstance } from '@/lib/axiosInstance'
import { toast } from '@/lib/toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Trash2 } from 'lucide-react'
import { TimeSelect12h } from '@/components/ui/TimeSelect12h'
import { formatTime12Hour } from '@/lib/timeFormat'

interface Slot {
  id: number
  slot_date: string
  start_time: string
  end_time: string
  type: string
  max_orders: number
  booked_count: number
  is_active: boolean
}

function formatDateLabel(dateValue: string) {
  const date = new Date(dateValue)
  return new Intl.DateTimeFormat('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'Asia/Manila',
  }).format(date)
}

export function AdminSchedulePage() {
  const [slots, setSlots] = useState<Slot[]>([])
  const [page, setPage] = useState(1)
  const [form, setForm] = useState({
    slot_date: '',
    start_time: '09:00',
    end_time: '11:00',
    type: 'pickup',
    max_orders: 4,
  })
  const [slotToDelete, setSlotToDelete] = useState<Slot | null>(null)

  const load = () => axiosInstance.get('/admin/time-slots').then(({ data }) => setSlots(data.slots))

  useEffect(() => { load() }, [])

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    await axiosInstance.post('/admin/time-slots', form)
    toast.success('New schedule added')
    setForm({ ...form, slot_date: '' })
    load()
  }

  const confirmDelete = async () => {
    if (!slotToDelete) return
    try {
      await axiosInstance.delete(`/admin/time-slots/${slotToDelete.id}`)
      toast.success('Schedule deleted')
      setSlotToDelete(null)
      load()
    } catch {
      toast.error('Could not delete schedule')
    }
  }

  const toggleAvailability = async (slot: Slot) => {
    try {
      await axiosInstance.put(`/admin/time-slots/${slot.id}`, { is_active: !slot.is_active })
      toast.success(slot.is_active ? 'Slot hidden from customers' : 'Slot available for customers')
      load()
    } catch {
      toast.error('Could not update slot')
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Schedule</h1>
      <p className="mt-1 text-sm text-gray-500">
        Hidden or deleted slots will not appear when customers choose a pickup or delivery time at checkout.
      </p>
      <form onSubmit={create} className="mt-4 grid max-w-xl gap-3 rounded-xl border bg-white p-4 sm:grid-cols-2">
        <div><Label>Date</Label><Input type="date" required value={form.slot_date} onChange={(e) => setForm({ ...form, slot_date: e.target.value })} /></div>
        <div><Label>Type</Label>
          <select className="flex h-11 w-full rounded-xl border px-3" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option value="pickup">Pickup</option>
            <option value="delivery">Delivery</option>
          </select>
        </div>
        <TimeSelect12h label="Start" value={form.start_time} onChange={(start_time) => setForm({ ...form, start_time })} />
        <TimeSelect12h label="End" value={form.end_time} onChange={(end_time) => setForm({ ...form, end_time })} />
        <Button type="submit" className="sm:col-span-2">Add Slot</Button>
      </form>
      <div className="mt-6 overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50"><tr>
            <th className="p-3 text-left">Date</th><th className="p-3 text-left">Time</th><th className="p-3">Type</th><th className="p-3">Booked</th><th className="p-3">Status</th><th className="p-3 text-right">Actions</th>
          </tr></thead>
          <tbody>
            {slots.slice((page - 1) * 10, page * 10).map((s) => (
              <tr key={s.id} className="border-t">
                <td className="p-3">{formatDateLabel(s.slot_date)}</td>
                <td className="p-3">{formatTime12Hour(s.start_time)} – {formatTime12Hour(s.end_time)}</td>
                <td className="p-3 capitalize">{s.type}</td>
                <td className="p-3 text-center">{s.booked_count}/{s.max_orders}</td>
                <td className="p-3">
                  <span
                    className={
                      s.is_active
                        ? 'rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800'
                        : 'rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600'
                    }
                  >
                    {s.is_active ? 'Available' : 'Hidden'}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <div className="flex justify-end gap-1">
                    <Button type="button" size="sm" variant="outline" onClick={() => toggleAvailability(s)}>
                      {s.is_active ? 'Hide' : 'Show'}
                    </Button>
                    <Button type="button" size="sm" variant="ghost" onClick={() => setSlotToDelete(s)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
        <span>Showing {Math.min(slots.length, (page - 1) * 10 + 1)}–{Math.min(slots.length, page * 10)} of {slots.length}</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            className="rounded border px-3 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-40"
            onClick={() => setPage((value) => Math.max(1, value - 1))}
          >Previous</button>
          <button
            type="button"
            disabled={page >= Math.ceil(slots.length / 10)}
            className="rounded border px-3 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-40"
            onClick={() => setPage((value) => Math.min(Math.ceil(slots.length / 10), value + 1))}
          >Next</button>
        </div>
      </div>

      {slotToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold">Delete schedule</h2>
            <p className="mt-2 text-sm text-gray-600">
              Remove the {slotToDelete.type} slot on {formatDateLabel(slotToDelete.slot_date)} (
              {formatTime12Hour(slotToDelete.start_time)} – {formatTime12Hour(slotToDelete.end_time)})?
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setSlotToDelete(null)}>
                Cancel
              </Button>
              <Button type="button" onClick={confirmDelete}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
