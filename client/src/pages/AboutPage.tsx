import { MapPin, Clock, CreditCard } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="font-display text-4xl font-bold text-belly-brown">About BELLYlicious</h1>
      <p className="mt-4 text-lg text-belly-brown/80 leading-relaxed">
        Welcome to BELLYlicious Lawaan — your home for premium boneless lechon belly in Roxas City, Capiz.
        Located in St. Ignatius Heights, Lawaan, we specialize in slow-roasted belly with shatteringly crisp skin
        and melt-in-your-mouth meat.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {[
          { icon: Clock, title: 'Advanced Orders Only', text: 'Please book 1–2 days in advance so we can prepare your belly to perfection.' },
          { icon: CreditCard, title: '50% Downpayment', text: 'A 50% downpayment is required to confirm your order. Balance due on pickup or delivery.' },
          { icon: MapPin, title: 'Our Location', text: 'St. Ignatius Heights, Lawaan, Roxas City, Capiz, Philippines' },
        ].map(({ icon: Icon, title, text }) => (
          <div key={title} className="rounded-2xl bg-white p-6 shadow-md">
            <Icon className="h-8 w-8 text-belly-gold" />
            <h3 className="mt-3 font-display text-lg font-bold text-belly-red">{title}</h3>
            <p className="mt-2 text-sm text-belly-brown/70">{text}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 rounded-2xl bg-belly-red/5 border border-belly-red/20 p-8 text-center">
        <h2 className="font-display text-2xl font-bold text-belly-brown">Ready to order?</h2>
        <Link to="/order" className="mt-4 inline-block">
          <Button variant="default" size="lg">Place a Pre-Order</Button>
        </Link>
      </div>
    </div>
  )
}
