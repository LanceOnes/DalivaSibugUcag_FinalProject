import { Link } from 'react-router-dom'
import { MapPin, Phone, Clock } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export function Footer() {
  const { user, token } = useAuth()
  const isCustomerLoggedIn = Boolean(token) && user?.role === 'customer'

  return (
    <footer className="mt-auto border-t border-belly-brown/10 bg-belly-brown text-belly-cream">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3">
        <div>
          <p className="font-display text-2xl font-bold">
            BELLY<span className="text-belly-gold">licious</span>
          </p>
          <p className="mt-2 text-sm text-belly-cream/70">
            Premium boneless lechon belly — pre-orders only. Crispy, tender, unforgettable.
          </p>
        </div>
        <div>
          <p className="mb-3 font-semibold text-belly-gold">Quick Links</p>
          <ul className="space-y-2 text-sm text-belly-cream/80">
            <li><Link to="/menu" className="cursor-pointer transition-colors hover:text-belly-gold">Menu</Link></li>
            <li><Link to="/cart" className="cursor-pointer transition-colors hover:text-belly-gold">Cart</Link></li>
            {isCustomerLoggedIn ? (
              <li><Link to="/account" className="cursor-pointer transition-colors hover:text-belly-gold">My Account</Link></li>
            ) : (
              <li><Link to="/login" className="cursor-pointer transition-colors hover:text-belly-gold">Login</Link></li>
            )}
          </ul>
        </div>
        <div className="space-y-3 text-sm text-belly-cream/80">
          <p className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-belly-gold" />
            St. Ignatius Heights, Lawaan, Roxas City, Capiz, Philippines
          </p>
          <p className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-belly-gold" />
            0917 123 4567
          </p>
          <p className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-belly-gold" />
            Advanced orders · 1–2 days lead time
          </p>
        </div>
      </div>
      <div className="border-t border-belly-cream/10 py-4 text-center text-xs text-belly-cream/50">
        © {new Date().getFullYear()} BELLYlicious Lawaan. All rights reserved.
      </div>
    </footer>
  )
}
