export function formatTime12Hour(time: string) {
  const [hours, minutes] = time.split(':').map(Number)
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return time
  }
  const period = hours >= 12 ? 'PM' : 'AM'
  const hour12 = hours % 12 || 12
  return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`
}


export function formatSlotLabel(label: string | null) {
  if (!label) return ''
  return label
    .split('-')
    .map((part) => formatTime12Hour(part.trim()))
    .join(' - ')
}

export function parseTime24(value: string): { hour12: number; minute: number; period: 'AM' | 'PM' } {
  const [h, m] = value.split(':').map(Number)
  const period: 'AM' | 'PM' = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 || 12
  return { hour12, minute: m || 0, period }
}

export function toTime24(hour12: number, minute: number, period: 'AM' | 'PM'): string {
  let h = hour12 % 12
  if (period === 'PM') h += 12
  return `${h.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
}

export const TIME_MINUTES = [0, 15, 30, 45]
export const TIME_HOURS = Array.from({ length: 12 }, (_, i) => i + 1)
