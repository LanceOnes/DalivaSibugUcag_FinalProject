import { Link, NavLink } from 'react-router-dom'
import { ShoppingBag, User, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/stores/cartStore'
import { useAuthStore } from '@/stores/authStore'
import { cn } from '@/lib/utils'

const links = [
  { to: '/', label: 'Home' },
  { to: '/menu', label: 'Menu' },
  { to: '/order', label: 'Order Now' },
  { to: '/about', label: 'About' },
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const itemCount = useCartStore((s) => s.itemCount())
  const user = useAuthStore((s) => s.user)

  return (
    <header className="sticky top-0 z-50 border-b border-belly-brown/10 bg-belly-cream/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 transition-opacity duration-200 hover:opacity-80">
          <span className="font-display text-xl font-bold text-belly-red">
            BELLY<span className="text-belly-gold">licious</span>
          </span>
          <span className="hidden text-xs text-belly-brown/60 sm:inline">Lawaan</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                cn(
                  'text-sm font-medium transition-colors hover:text-belly-red',
                  isActive ? 'text-belly-red' : 'text-belly-brown/70',
                )
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/cart" className="relative rounded-full p-2 transition-colors duration-200 hover:bg-belly-brown/5 hover:scale-105">
            <ShoppingBag className="h-5 w-5 text-belly-brown" />
            {itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-belly-red text-[10px] font-bold text-white">
                {itemCount}
              </span>
            )}
          </Link>

          {user ? (
            <Link to={user.role === 'admin' ? '/admin' : '/account'}>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </Link>
          ) : (
            <Link to="/login" className="hidden sm:block">
              <Button variant="outline" size="sm">Login</Button>
            </Link>
          )}

          <Link to="/order" className="hidden sm:block">
            <Button variant="gold" size="sm">Pre-Order</Button>
          </Link>

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-belly-brown/10 px-4 py-4 md:hidden">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="block py-2 text-sm font-medium text-belly-brown"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <Link to="/login" className="block py-2 text-sm" onClick={() => setOpen(false)}>Login</Link>
        </nav>
      )}
    </header>
  )
}
