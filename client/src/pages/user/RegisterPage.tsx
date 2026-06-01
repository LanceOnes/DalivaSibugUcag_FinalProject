import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'

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
  const { register, isLoading } = useAuth()
  const navigate = useNavigate()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await register(form)
      navigate('/account')
    } catch {
      setError('Registration failed. Check your details.')
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-12">
      <Card className="glass-card w-full">
        <CardHeader><CardTitle className="text-center">Create Account</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-3">
            {(['name', 'email', 'phone', 'address'] as const).map((field) => (
              <div key={field}>
                <Label className="capitalize">{field === 'address' ? 'Address (optional)' : field}</Label>
                <Input
                  type={field === 'email' ? 'email' : 'text'}
                  required={field !== 'address'}
                  value={form[field]}
                  onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                />
              </div>
            ))}
            <div>
              <Label>Password</Label>
              <Input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
            <div>
              <Label>Confirm Password</Label>
              <Input type="password" required value={form.password_confirmation} onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })} />
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
            Already have an account? <Link to="/login" className="cursor-pointer text-belly-red hover:underline">Login</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
