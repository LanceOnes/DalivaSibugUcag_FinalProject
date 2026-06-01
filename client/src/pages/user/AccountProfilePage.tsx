import { Link } from 'react-router-dom'
import { Mail, MapPin, Phone, ShoppingBag } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'

export function AccountProfilePage() {
  const { user } = useAuth()
  if (!user) return null

  const fields = [
    { icon: Mail, label: 'Email', value: user.email },
    { icon: Phone, label: 'Phone', value: user.phone ?? '—' },
    { icon: MapPin, label: 'Address', value: user.address ?? 'Not set' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-belly-brown">Profile</h2>
        <p className="mt-1 text-sm text-belly-brown/50">Your account details</p>
      </div>

      <div className="glass-card divide-y divide-belly-brown/6 overflow-hidden">
        {fields.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-start gap-4 px-5 py-4">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-belly-cream text-belly-brown/60">
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wide text-belly-brown/40">{label}</p>
              <p className="mt-0.5 text-sm text-belly-brown">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-belly-gold/20 bg-belly-gold/5 p-5">
        <div className="flex items-center gap-3">
          <ShoppingBag className="h-5 w-5 text-belly-gold" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-belly-brown">Ready to order?</p>
            <p className="text-xs text-belly-brown/60">Pre-order belly for your next celebration</p>
          </div>
          <Link to="/menu" className="cursor-pointer">
            <Button variant="gold" size="sm">Browse Menu</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
