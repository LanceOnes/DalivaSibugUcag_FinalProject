import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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
  const { register, isLoading } = useAuthStore()
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

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value })

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <Card>
        <CardHeader><CardTitle className="text-center">Create Account</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div><Label>Name</Label><Input required value={form.name} onChange={set('name')} /></div>
            <div><Label>Email</Label><Input type="email" required value={form.email} onChange={set('email')} /></div>
            <div><Label>Phone</Label><Input required value={form.phone} onChange={set('phone')} /></div>
            <div><Label>Address</Label><Input value={form.address} onChange={set('address')} /></div>
            <div><Label>Password</Label><Input type="password" required value={form.password} onChange={set('password')} /></div>
            <div><Label>Confirm Password</Label><Input type="password" required value={form.password_confirmation} onChange={set('password_confirmation')} /></div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" variant="gold" disabled={isLoading}>Register</Button>
          </form>
          <p className="mt-4 text-center text-sm">
            Already have an account? <Link to="/login" className="text-belly-red">Login</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
