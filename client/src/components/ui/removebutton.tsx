import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface RemoveButtonProps {
  label: string
  className?: string
  onRemove: () => void
}

export default function RemoveButton({ label, className, onRemove }: RemoveButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      className={cn('w-full border-belly-red/25 text-belly-red hover:bg-red-50', className)}
      onClick={onRemove}
    >
      {label}
    </Button>
  )
}
