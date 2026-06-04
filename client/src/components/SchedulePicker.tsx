import { format, addDays } from 'date-fns'
import { useSchedule } from '@/context/ScheduleContext'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'

interface SchedulePickerProps {
  cartUnits?: number
  compact?: boolean
}

export function SchedulePicker({ cartUnits = 0, compact = false }: SchedulePickerProps) {
  const {
    date,
    fulfillment,
    slotId,
    slots,
    maxUnitsPerSlot,
    availableSpots,
    loadingSlots,
    setDate,
    setFulfillment,
    setSlotId,
  } = useSchedule()

  const minDate = format(addDays(new Date(), 1), 'yyyy-MM-dd')
  const overCapacity = cartUnits > availableSpots

  return (
    <div
      className={
        compact
          ? 'space-y-3 rounded-xl border border-belly-gold/30 bg-belly-gold/5 p-4'
          : 'glass-card space-y-4 rounded-2xl border border-belly-brown/10 p-5'
      }
    >
      <div>
        <p className="text-sm font-semibold text-belly-brown">Pickup or delivery schedule</p>
        <p className="mt-1 text-xs text-belly-brown/60">
          Each item in your cart uses one spot (max {maxUnitsPerSlot} per time slot).
          {cartUnits > 0 && (
            <> You have <strong>{cartUnits}</strong> in your cart.</>
          )}
        </p>
      </div>

      <div className="flex gap-2">
        {(['pickup', 'delivery'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setFulfillment(t)}
            className={`flex-1 cursor-pointer rounded-xl border-2 py-2 text-sm font-semibold capitalize transition-colors ${
              fulfillment === t
                ? 'border-belly-gold bg-belly-gold/10 text-belly-brown'
                : 'border-belly-brown/15 hover:border-belly-gold/40'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label>Date</Label>
          <Input type="date" required min={minDate} value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div>
          <Label>Time slot</Label>
          {loadingSlots ? (
            <div className="flex h-11 items-center gap-2 text-sm text-belly-brown/60">
              <Spinner size="sm" /> Loading slots…
            </div>
          ) : (
            <select
              className="flex h-11 w-full cursor-pointer rounded-xl border border-belly-brown/20 bg-white px-4 text-sm"
              value={slotId ?? ''}
              onChange={(e) => setSlotId(e.target.value ? Number(e.target.value) : null)}
            >
              {slots.length === 0 && (
                <option value="">
                  {cartUnits > 0
                    ? `No slot fits ${cartUnits} items — change date or reduce cart`
                    : 'No slots — pick another date'}
                </option>
              )}
              {slots.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label} ({s.available_spots} of {maxUnitsPerSlot} spots left)
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {slotId && !overCapacity && (
        <p className="text-xs font-medium text-belly-green">
          {availableSpots - cartUnits} spot(s) remaining for this slot.
        </p>
      )}
      {overCapacity && (
        <p className="text-xs font-medium text-red-600">
          Your cart ({cartUnits}) exceeds this slot&apos;s remaining capacity ({availableSpots}).
          Remove items or choose another time.
        </p>
      )}
    </div>
  )
}
