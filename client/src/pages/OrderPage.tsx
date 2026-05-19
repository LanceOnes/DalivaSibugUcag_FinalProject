import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { MenuPage } from './MenuPage'

export function OrderPage() {
  return (
    <div>
      <div className="bg-belly-red py-8 text-center text-white">
        <h1 className="font-display text-3xl font-bold">Pre-Order Your Belly</h1>
        <p className="mt-2 text-white/80">Select sizes &amp; add-ons, then proceed to checkout</p>
        <Link to="/cart" className="mt-4 inline-block">
          <Button variant="gold">View Cart</Button>
        </Link>
      </div>
      <MenuPage />
    </div>
  )
}
