import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, MapPin, Phone, ShoppingBag, User } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function AccountProfilePage() {
  const { user, updateProfile, isLoading } = useAuth()
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    password_confirmation: '',
  })

  if (!user) return null

  const startEdit = () => {
    setForm({
      name: user.name,
      email: user.email,
      phone: user.phone ?? '',
      address: user.address ?? '',
      password: '',
      password_confirmation: '',
    })
    setError('')
    setEditing(true)
  }

  const cancelEdit = () => {
    setEditing(false)
    setError('')
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (form.password && form.password !== form.password_confirmation) {
      setError('Passwords do not match.')
      return
    }

    try {
      const payload: {
        name: string
        email: string
        phone: string
        address: string | null
        password?: string
        password_confirmation?: string
      } = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        address: form.address.trim() || null,
      }

      if (form.password) {
        payload.password = form.password
        payload.password_confirmation = form.password_confirmation
      }

      await updateProfile(payload)
      setEditing(false)
    } catch {
      setError('Could not update profile. Check your details and try again.')
    }
  }

  const fields = [
    { icon: User, label: 'Name', value: user.name },
    { icon: Mail, label: 'Email', value: user.email },
    { icon: Phone, label: 'Phone', value: user.phone ?? '—' },
    { icon: MapPin, label: 'Address', value: user.address ?? 'Not set' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold text-belly-brown">Profile</h2>
          <p className="mt-1 text-sm text-belly-brown/50">Your account details</p>
        </div>
        {!editing && (
          <Button type="button" variant="outline" size="sm" onClick={startEdit}>
            Edit profile
          </Button>
        )}
      </div>

      {editing ? (
        <form onSubmit={save} className="glass-card space-y-4 p-5" noValidate>
          <div>
            <Label>Name</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Phone</Label>
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Address</Label>
            <Input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Optional"
            />
          </div>
          <div>
            <Label>New password (optional)</Label>
            <Input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Leave blank to keep current"
            />
          </div>
          {form.password && (
            <div>
              <Label>Confirm new password</Label>
              <Input
                type="password"
                value={form.password_confirmation}
                onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
              />
            </div>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <Button type="submit" variant="gold" disabled={isLoading}>
              {isLoading ? 'Saving…' : 'Save changes'}
            </Button>
            <Button type="button" variant="ghost" onClick={cancelEdit} disabled={isLoading}>
              Cancel
            </Button>
          </div>
        </form>
      ) : (
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
      )}

      <div className="rounded-2xl border border-belly-gold/20 bg-belly-gold/5 p-5">
        <div className="flex items-center gap-3">
          <ShoppingBag className="h-5 w-5 text-belly-gold" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-belly-brown">Ready to order?</p>
            <p className="text-xs text-belly-brown/60">Choose your belly for the next celebration.</p>
          </div>
          <Link to="/menu" className="cursor-pointer">
            <Button variant="gold" size="sm">Browse Menu</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
