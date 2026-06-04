import { Label } from '@/components/ui/label'
import { parseTime24, toTime24, TIME_HOURS, TIME_MINUTES } from '@/lib/timeFormat'

interface TimeSelect12hProps {
  label: string
  value: string
  onChange: (value24: string) => void
}

export function TimeSelect12h({ label, value, onChange }: TimeSelect12hProps) {
  const { hour12, minute, period } = parseTime24(value || '09:00')

  const update = (patch: Partial<{ hour12: number; minute: number; period: 'AM' | 'PM' }>) => {
    const next = {
      hour12: patch.hour12 ?? hour12,
      minute: patch.minute ?? minute,
      period: patch.period ?? period,
    }
    onChange(toTime24(next.hour12, next.minute, next.period))
  }

  const selectClass = 'flex h-11 flex-1 rounded-xl border border-belly-brown/20 bg-white px-2 text-sm'

  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-1 flex gap-2">
        <select className={selectClass} value={hour12} onChange={(e) => update({ hour12: Number(e.target.value) })}>
          {TIME_HOURS.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>
        <select className={selectClass} value={minute} onChange={(e) => update({ minute: Number(e.target.value) })}>
          {TIME_MINUTES.map((m) => (
            <option key={m} value={m}>
              {m.toString().padStart(2, '0')}
            </option>
          ))}
        </select>
        <select
          className={selectClass}
          value={period}
          onChange={(e) => update({ period: e.target.value as 'AM' | 'PM' })}
        >
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
      </div>
    </div>
  )
}
