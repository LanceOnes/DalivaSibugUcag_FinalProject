import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { format, addDays } from 'date-fns'
import { axiosInstance } from '@/lib/axiosInstance'
import { loadSchedule, saveSchedule } from '@/lib/storage'
import type { TimeSlot } from '@/types'

interface ScheduleContextValue {
  date: string
  fulfillment: 'pickup' | 'delivery'
  slotId: number | null
  slots: TimeSlot[]
  maxUnitsPerSlot: number
  availableSpots: number
  loadingSlots: boolean
  setDate: (date: string) => void
  setFulfillment: (type: 'pickup' | 'delivery') => void
  setSlotId: (id: number | null) => void
  canAddUnits: (cartUnits: number, delta: number) => boolean
  refreshSlots: (unitsNeeded?: number) => Promise<void>
}

const ScheduleContext = createContext<ScheduleContextValue | null>(null)

const defaultDate = format(addDays(new Date(), 2), 'yyyy-MM-dd')

export function ScheduleProvider({ children }: { children: ReactNode }) {
  const saved = loadSchedule()
  const [date, setDateState] = useState(saved?.date ?? defaultDate)
  const [fulfillment, setFulfillmentState] = useState<'pickup' | 'delivery'>(
    saved?.fulfillment ?? 'pickup',
  )
  const [slotId, setSlotIdState] = useState<number | null>(saved?.slotId ?? null)
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [maxUnitsPerSlot, setMaxUnitsPerSlot] = useState(4)
  const [loadingSlots, setLoadingSlots] = useState(false)

  useEffect(() => {
    saveSchedule({ date, fulfillment, slotId })
  }, [date, fulfillment, slotId])

  const setDate = useCallback((value: string) => {
    setDateState(value)
    setSlotIdState(null)
  }, [])

  const setFulfillment = useCallback((value: 'pickup' | 'delivery') => {
    setFulfillmentState(value)
    setSlotIdState(null)
  }, [])

  const setSlotId = useCallback((id: number | null) => {
    setSlotIdState(id)
  }, [])

  const refreshSlots = useCallback(
    async (unitsNeeded?: number) => {
      setLoadingSlots(true)
      try {
        const params: Record<string, string | number> = { date, type: fulfillment }
        if (unitsNeeded && unitsNeeded > 0) {
          params.units_needed = unitsNeeded
        }
        const { data } = await axiosInstance.get('/time-slots/available', { params })
        setSlots(data.slots)
        setMaxUnitsPerSlot(data.max_units_per_slot ?? 4)
        setSlotIdState((current) => {
          const stillValid = data.slots.some((s: TimeSlot) => s.id === current)
          return stillValid ? current : (data.slots[0]?.id ?? null)
        })
      } finally {
        setLoadingSlots(false)
      }
    },
    [date, fulfillment],
  )

  useEffect(() => {
    void refreshSlots()
  }, [date, fulfillment, refreshSlots])

  const selectedSlot = slots.find((s) => s.id === slotId)
  const availableSpots = selectedSlot?.available_spots ?? 0

  const canAddUnits = useCallback(
    (cartUnits: number, delta: number) => {
      if (!slotId) return false
      return cartUnits + delta <= availableSpots
    },
    [slotId, availableSpots],
  )

  const value = useMemo(
    () => ({
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
      canAddUnits,
      refreshSlots,
    }),
    [
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
      canAddUnits,
      refreshSlots,
    ],
  )

  return <ScheduleContext.Provider value={value}>{children}</ScheduleContext.Provider>
}

export function useSchedule() {
  const ctx = useContext(ScheduleContext)
  if (!ctx) throw new Error('useSchedule must be used within ScheduleProvider')
  return ctx
}
