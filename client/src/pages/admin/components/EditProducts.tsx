import { useEffect, useState, type FC, type FormEvent } from 'react'
import type { OrderStatus } from '@/types'

const statuses: OrderStatus[] = [
    'pending',
    'confirmed',
    'preparing',
    'ready_for_pickup',
    'delivered',
    'cancelled',
]

interface EditProductsProps {
    initialStatus: OrderStatus
    onSave: (status: OrderStatus) => Promise<void>
    onCancel: () => void
}

export const EditProducts: FC<EditProductsProps> = ({ initialStatus, onSave, onCancel }) => {
    const [status, setStatus] = useState<OrderStatus>(initialStatus)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        setStatus(initialStatus)
    }, [initialStatus])

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setIsSaving(true)
        try {
            await onSave(status)
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <select
                className="rounded border px-2 py-1 text-xs"
                value={status}
                onChange={(event) => setStatus(event.target.value as OrderStatus)}
            >
                {statuses.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>
            <button
                type="submit"
                disabled={isSaving}
                className="rounded-full bg-belly-gold px-3 py-1 text-xs font-semibold text-belly-brown transition hover:bg-belly-gold/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {isSaving ? 'Saving…' : 'Save'}
            </button>
            <button
                type="button"
                onClick={onCancel}
                className="rounded-full border px-3 py-1 text-xs text-gray-600 transition hover:bg-gray-100"
            >
                Cancel
            </button>
        </form>
    )
}
