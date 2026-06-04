import { useEffect, useState } from 'react'
import { axiosInstance } from '@/lib/axiosInstance'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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

function formatTime12Hour(time: string) {
  const [hours, minutes] = time.split(':').map(Number)
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return time
  }

  const period = hours >= 12 ? 'PM' : 'AM'
  const hour12 = hours % 12 || 12
  return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`
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

  const load = () => axiosInstance.get('/admin/time-slots').then(({ data }) => setSlots(data.slots))

  useEffect(() => { load() }, [])

  const create = async (e: React.FormEvent) => {
    e.preventDefault()
    await axiosInstance.post('/admin/time-slots', form)
    setForm({ ...form, slot_date: '' })
    load()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Schedule</h1>
      <form onSubmit={create} className="mt-4 grid max-w-xl gap-3 rounded-xl border bg-white p-4 sm:grid-cols-2">
        <div><Label>Date</Label><Input type="date" required value={form.slot_date} onChange={(e) => setForm({ ...form, slot_date: e.target.value })} /></div>
        <div><Label>Type</Label>
          <select className="flex h-11 w-full rounded-xl border px-3" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option value="pickup">Pickup</option>
            <option value="delivery">Delivery</option>
          </select>
        </div>
        <div><Label>Start</Label><Input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} /></div>
        <div><Label>End</Label><Input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} /></div>
        <Button type="submit" className="sm:col-span-2">Add Slot</Button>
      </form>
      <div className="mt-6 overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50"><tr>
            <th className="p-3 text-left">Date</th><th className="p-3 text-left">Time</th><th className="p-3">Type</th><th className="p-3">Booked</th>
          </tr></thead>
          <tbody>
            {slots.slice((page - 1) * 10, page * 10).map((s) => (
              <tr key={s.id} className="border-t">
                <td className="p-3">{formatDateLabel(s.slot_date)}</td>
                <td className="p-3">{formatTime12Hour(s.start_time)} – {formatTime12Hour(s.end_time)}</td>
                <td className="p-3 capitalize">{s.type}</td>
                <td className="p-3 text-center">{s.booked_count}/{s.max_orders}</td>
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
    </div>
  )
}
