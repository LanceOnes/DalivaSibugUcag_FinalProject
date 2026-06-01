import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'

export function LoginPage() {
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login: doLogin, isLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/account'

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await doLogin(login, password, 'customer')
      navigate(from)
    } catch {
      setError('Invalid email/phone or password.')
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center px-4 py-12">
      <Card className="glass-card w-full">
        <CardHeader>
          <CardTitle className="text-center">Customer Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label>Email or Phone</Label>
              <Input value={login} onChange={(e) => setLogin(e.target.value)} required />
            </div>
            <div>
              <Label>Password</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" variant="gold" disabled={isLoading}>
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
          <p className="mt-4 text-center text-sm text-belly-brown/70">
            No account? <Link to="/register" className="cursor-pointer font-medium text-belly-red hover:underline">Register</Link>
          </p>
          <p className="mt-2 text-center text-sm">
            <Link to="/checkout" className="cursor-pointer text-belly-brown/60 underline">Continue as guest</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
