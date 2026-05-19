import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, Package, ShoppingCart, Calendar, Users, BarChart3, LogOut } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { cn } from '@/lib/utils'

const nav = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/schedule', label: 'Schedule', icon: Calendar },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
]

export function AdminLayout() {
  const logout = useAuthStore((s) => s.logout)

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="hidden w-64 flex-col border-r bg-belly-brown text-belly-cream md:flex">
        <div className="border-b border-belly-cream/10 p-6">
          <p className="font-display text-xl font-bold">BELLY<span className="text-belly-gold">licious</span></p>
          <p className="text-xs text-belly-cream/60">Admin Panel</p>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition',
                  isActive ? 'bg-belly-gold text-belly-brown' : 'hover:bg-belly-cream/10',
                )
              }
            >
              <Icon className="h-4 w-4" /> {label}
            </NavLink>
          ))}
        </nav>
        <button type="button" onClick={() => logout()} className="flex items-center gap-2 p-4 text-sm text-belly-cream/70 hover:text-white">
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </aside>
      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  )
}
