import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'

export function AdminLoginPage() {
  const [login, setLogin] = useState('admin@bellylicious.ph')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login: doLogin, isLoading } = useAuth()
  const navigate = useNavigate()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await doLogin(login, password, 'admin')
      navigate('/admin')
    } catch {
      setError('Invalid admin credentials.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-belly-brown px-4">
      <Card className="glass-card w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-belly-red">Admin Login</CardTitle>
          <p className="text-center text-sm text-belly-brown/60">BELLYlicious Lawaan Dashboard</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div><Label>Email</Label><Input value={login} onChange={(e) => setLogin(e.target.value)} required /></div>
            <div><Label>Password</Label><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner size="sm" className="border-white/30 border-t-white" />
                  Signing in…
                </span>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
