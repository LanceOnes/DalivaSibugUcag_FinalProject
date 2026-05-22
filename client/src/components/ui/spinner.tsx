import { cn } from '@/lib/utils'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = {
  sm: 'h-5 w-5 border-2',
  md: 'h-8 w-8 border-[3px]',
  lg: 'h-12 w-12 border-4',
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        'animate-spin rounded-full border-belly-gold/30 border-t-belly-red',
        sizes[size],
        className,
      )}
    />
  )
}

export function PageSpinnerOverlay() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-belly-cream/70 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-white px-8 py-6 shadow-xl">
        <Spinner size="lg" />
        <p className="text-sm font-medium text-belly-brown/70">Loading…</p>
      </div>
    </div>
  )
}
