import { useEffect, useState } from 'react'
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react'
import { dismiss, subscribe, type ToastMessage } from '@/lib/toast'
import { cn } from '@/lib/utils'

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
}

const styles = {
  success: 'border-belly-green/30 bg-white',
  error: 'border-red-200 bg-white',
  info: 'border-belly-gold/40 bg-white',
}

const iconStyles = {
  success: 'text-belly-green',
  error: 'text-red-600',
  info: 'text-belly-gold',
}

export function Toaster() {
  const [items, setItems] = useState<ToastMessage[]>([])

  useEffect(() => subscribe(setItems), [])

  if (items.length === 0) return null

  return (
    <div className="fixed top-20 right-4 z-[110] flex w-full max-w-sm flex-col gap-2 px-4 sm:top-4 sm:px-0">
      {items.map((t) => {
        const Icon = icons[t.variant]
        return (
          <div
            key={t.id}
            className={cn(
              'flex items-start gap-3 rounded-xl border p-4 shadow-lg transition-all duration-300',
              styles[t.variant],
            )}
          >
            <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', iconStyles[t.variant])} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-belly-brown">{t.title}</p>
              {t.description && (
                <p className="mt-0.5 text-xs text-belly-brown/60">{t.description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              className="shrink-0 rounded-lg p-1 text-belly-brown/40 transition-colors hover:bg-belly-brown/5 hover:text-belly-brown"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}
