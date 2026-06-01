import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { Eye, EyeOff } from 'lucide-react'

export function AdminLoginPage() {
  const [login, setLogin] = useState('admin@bellylicious.ph')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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
    <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-belly-brown/80 to-belly-brown/95 px-4">
      <div className="w-full max-w-md rounded-2xl shadow-xl bg-white">
        <div className="p-6">
          <div className="text-center">
            <h1 className="text-xl font-semibold text-belly-red">Admin Login</h1>
            <p className="mt-1 text-sm text-belly-brown/60">BELLYlicious Lawaan Dashboard</p>
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <Label>Email</Label>
              <Input value={login} onChange={(e) => setLogin(e.target.value)} required className="mt-1" />
            </div>

            <div>
              <Label>Password</Label>
              <div className="relative mt-1">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  aria-label="Toggle password visibility"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-belly-brown/60"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

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

            <div className="text-center text-sm text-belly-brown/60">
              <a href="#" className="hover:underline">Forgot password?</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
