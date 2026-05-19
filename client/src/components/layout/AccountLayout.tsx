import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LogOut, Package, User } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/account', label: 'Profile', icon: User, end: true },
  { to: '/account/orders', label: 'Orders', icon: Package, end: false },
]

function initials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function AccountLayout() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  if (!user) return null

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:py-14">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-belly-brown">My Account</h1>
        <p className="mt-1 text-sm text-belly-brown/60">Manage your profile and orders</p>
      </div>

      <div className="grid gap-8 md:grid-cols-[220px_1fr]">
        <aside className="space-y-6">
          <div className="rounded-2xl border border-belly-brown/8 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-belly-red/10 text-sm font-bold text-belly-red">
                {initials(user.name)}
              </div>
              <div className="min-w-0">
                <p className="truncate font-semibold text-belly-brown">{user.name}</p>
                <p className="truncate text-xs text-belly-brown/50">{user.email}</p>
              </div>
            </div>
          </div>

          <nav className="flex gap-1 md:flex-col">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 md:justify-start',
                    isActive
                      ? 'bg-belly-red text-white shadow-md shadow-belly-red/20'
                      : 'text-belly-brown/70 hover:bg-belly-brown/5 hover:text-belly-brown',
                  )
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-belly-brown/50 transition-colors duration-200 hover:bg-red-50 hover:text-red-600 md:justify-start"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </aside>

        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
