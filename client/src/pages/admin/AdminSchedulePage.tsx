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

export function AdminSchedulePage() {
  const [slots, setSlots] = useState<Slot[]>([])
  const [form, setForm] = useState({
    slot_date: '',
    start_time: '09:00',
    end_time: '11:00',
    type: 'pickup',
    max_orders: 5,
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
            {slots.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="p-3">{s.slot_date}</td>
                <td className="p-3">{String(s.start_time).slice(0, 5)} – {String(s.end_time).slice(0, 5)}</td>
                <td className="p-3 capitalize">{s.type}</td>
                <td className="p-3 text-center">{s.booked_count}/{s.max_orders}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
