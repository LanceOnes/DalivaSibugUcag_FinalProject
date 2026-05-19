import { Link } from 'react-router-dom'
import { ArrowRight, Clock, MapPin, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import heroImg from '@/assets/hero.png'

export function HomePage() {
  return (
    <>
      <section className="relative min-h-[85vh] overflow-hidden">
        <img
          src={heroImg}
          alt="Crispy boneless lechon belly"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="hero-overlay absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto flex max-w-6xl flex-col justify-center px-4 py-24 md:min-h-[85vh] md:py-32">
          <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-belly-gold/20 px-4 py-1 text-sm font-medium text-belly-gold backdrop-blur">
            <Sparkles className="h-4 w-4" /> Roxas City&apos;s Finest Belly
          </span>
          <h1 className="max-w-2xl font-display text-4xl font-bold leading-tight text-white md:text-6xl">
            Crispy. Tender. <span className="text-gradient-gold">BELLYlicious.</span>
          </h1>
          <p className="mt-4 max-w-xl text-lg text-white/85">
            Premium boneless lechon belly crafted in Lawaan — pre-order only for the perfect roast every time.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/order">
              <Button variant="gold" size="lg">
                Pre-Order Now <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/menu">
              <Button variant="outline" size="lg" className="border-white/40 text-white hover:bg-white/10">
                View Menu
              </Button>
            </Link>
          </div>
          <div className="mt-10 flex flex-wrap gap-6 text-sm text-white/75">
            <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-belly-gold" /> 1–2 days lead time</span>
            <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-belly-gold" /> Lawaan, Roxas City</span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold text-belly-brown">Why BELLYlicious?</h2>
          <p className="mx-auto mt-2 max-w-xl text-belly-brown/70">
            We roast to order — never mass-produced. Every belly is golden, crackling, and worth the wait.
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            { title: 'Pre-Order Only', desc: 'Advanced orders ensure peak freshness. Book 1–2 days ahead.' },
            { title: '50% Downpayment', desc: 'Secure your slot with half payment. Balance on pickup or delivery.' },
            { title: 'Pickup & Delivery', desc: 'Collect in Lawaan or enjoy delivery within Roxas City.' },
          ].map((item) => (
            <div key={item.title} className="card-hover rounded-2xl border border-belly-gold/30 bg-white p-6 text-center shadow-md">
              <h3 className="font-display text-lg font-bold text-belly-red">{item.title}</h3>
              <p className="mt-2 text-sm text-belly-brown/70">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-belly-red py-16 text-center text-white">
        <h2 className="font-display text-3xl font-bold">Ready for your celebration?</h2>
        <p className="mt-2 text-white/80">Party trays from ₱4,500 — feeds 20–25 guests</p>
        <Link to="/order" className="mt-6 inline-block">
          <Button variant="gold" size="lg">Start Your Order</Button>
        </Link>
      </section>
    </>
  )
}
