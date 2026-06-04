import { useState, type ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'

function RequiredLabel({ children }: { children: ReactNode }) {
  return (
    <Label>
      {children}
      <span className="ml-0.5 text-belly-red" aria-hidden="true">
        *
      </span>
    </Label>
  )
}

function normalizePhone(value: string) {
  return value.replace(/\D/g, '').slice(0, 11)
}

function isValidPhilippinePhone(phone: string) {
  return /^09\d{9}$/.test(phone)
}

function mapApiErrors(errors: Record<string, string[]>) {
  const mapped: Record<string, string> = {}
  for (const [key, messages] of Object.entries(errors)) {
    mapped[key] = messages[0] ?? 'Invalid value'
  }
  return mapped
}

export function RegisterPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
    address: '',
  })
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const { register, isLoading } = useAuth()
  const navigate = useNavigate()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const errors: Record<string, string> = {}

    if (!form.name.trim()) errors.name = 'Name is required'
    if (!form.email.trim()) errors.email = 'Email is required'
    if (!form.phone.trim()) {
      errors.phone = 'Phone is required'
    } else if (!isValidPhilippinePhone(form.phone)) {
      errors.phone = 'Enter 11 digits starting with 09 (e.g. 09171234567)'
    }
    if (!form.password) {
      errors.password = 'Password is required'
    } else if (form.password.length < 8) {
      errors.password = 'Password must be at least 8 characters'
    }
    if (!form.password_confirmation) {
      errors.password_confirmation = 'Please confirm your password'
    } else if (form.password !== form.password_confirmation) {
      errors.password_confirmation = 'Passwords do not match'
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setFieldErrors({})

    try {
      await register({ ...form, phone: form.phone })
      navigate('/account')
    } catch (err: unknown) {
      const data = (err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } })
        ?.response?.data
      if (data?.errors) {
        setFieldErrors(mapApiErrors(data.errors))
      }
      setError(data?.message || 'Registration failed. Check the fields below.')
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-12">
      <Card className="glass-card w-full">
        <CardHeader>
          <CardTitle className="text-center">Create Account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} noValidate className="space-y-3">
            <div>
              <RequiredLabel>Name</RequiredLabel>
              <Input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                aria-invalid={!!fieldErrors.name}
              />
              {fieldErrors.name && <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>}
            </div>
            <div>
              <RequiredLabel>Email</RequiredLabel>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                aria-invalid={!!fieldErrors.email}
              />
              {fieldErrors.email && <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>}
            </div>
            <div>
              <RequiredLabel>Phone</RequiredLabel>
              <Input
                type="tel"
                inputMode="numeric"
                maxLength={11}
                placeholder="09XXXXXXXXX"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: normalizePhone(e.target.value) })}
                aria-invalid={!!fieldErrors.phone}
              />
              <p className="mt-1 text-xs text-belly-brown/50">11-digit Philippine mobile (starts with 09)</p>
              {fieldErrors.phone && <p className="mt-1 text-xs text-red-600">{fieldErrors.phone}</p>}
            </div>
            <div>
              <Label>Address (optional)</Label>
              <Input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
            <div>
              <RequiredLabel>Password</RequiredLabel>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                aria-invalid={!!fieldErrors.password}
              />
              <p className="mt-1 text-xs text-belly-brown/50">At least 8 characters</p>
              {fieldErrors.password && <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>}
            </div>
            <div>
              <RequiredLabel>Confirm password</RequiredLabel>
              <Input
                type="password"
                value={form.password_confirmation}
                onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
                aria-invalid={!!fieldErrors.password_confirmation}
              />
              {fieldErrors.password_confirmation && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.password_confirmation}</p>
              )}
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" variant="gold" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner size="sm" className="border-white/30 border-t-white" />
                  Creating…
                </span>
              ) : (
                'Register'
              )}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link to="/login" className="cursor-pointer text-belly-red hover:underline">
              Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
