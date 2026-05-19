import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { api } from '@/lib/api'
import { formatPeso } from '@/lib/utils'
import type { MenuData, Product, ProductVariant } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useCartStore } from '@/stores/cartStore'
import heroImg from '@/assets/hero.png'

function getVariants(p: Product): ProductVariant[] {
  return p.active_variants ?? p.variants ?? []
}

export function MenuPage() {
  const [menu, setMenu] = useState<MenuData | null>(null)
  const [loading, setLoading] = useState(true)
  const addItem = useCartStore((s) => s.addItem)

  useEffect(() => {
    api.get<MenuData>('/menu').then(({ data }) => setMenu(data)).finally(() => setLoading(false))
  }, [])

  const addVariant = (product: Product, variant: ProductVariant) => {
    addItem({
      productId: product.id,
      variantId: variant.id,
      name: product.name,
      sizeLabel: variant.size_label,
      unitPrice: Number(variant.price),
    })
  }

  const addAddon = (product: Product) => {
    addItem({
      productId: product.id,
      name: product.name,
      unitPrice: Number(product.price),
    })
  }

  if (loading) {
    return <div className="flex min-h-[50vh] items-center justify-center text-belly-brown/60">Loading menu…</div>
  }

  const belly = menu?.belly?.[0]

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="text-center">
        <h1 className="font-display text-4xl font-bold text-belly-brown">Our Menu</h1>
        <p className="mt-2 text-belly-brown/70">Boneless lechon belly &amp; add-ons — prices start at ₱1,800</p>
      </div>

      {belly && (
        <Card className="card-hover mt-10 overflow-hidden">
          <div className="grid md:grid-cols-2">
            <img src={heroImg} alt={belly.name} className="h-64 w-full object-cover md:h-full" />
            <div className="p-6 md:p-8">
              <CardHeader className="p-0">
                <CardTitle className="text-2xl text-belly-red">{belly.name}</CardTitle>
              </CardHeader>
              <CardContent className="mt-2 p-0">
                <p className="text-sm text-belly-brown/70">{belly.description}</p>
                <div className="mt-6 space-y-3">
                  {getVariants(belly).map((v) => (
                    <div
                      key={v.id}
                      className="flex items-center justify-between rounded-xl border border-belly-brown/10 bg-belly-cream/50 p-4"
                    >
                      <div>
                        <p className="font-semibold text-belly-brown">{v.size_label}</p>
                        <p className="text-xs text-belly-brown/60">{v.servings}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-belly-red">{formatPeso(Number(v.price))}</span>
                        <Button size="sm" variant="gold" onClick={() => addVariant(belly, v)}>
                          <Plus className="h-4 w-4" /> Add
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </div>
          </div>
        </Card>
      )}

      <h2 className="mt-12 font-display text-2xl font-bold text-belly-brown">Add-ons</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {menu?.addons?.map((p) => (
          <Card key={p.id} className="card-hover p-4">
            <p className="font-semibold">{p.name}</p>
            <p className="mt-1 text-sm text-belly-brown/60">{p.description}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="font-bold text-belly-red">{formatPeso(Number(p.price))}</span>
              <Button size="sm" variant="outline" onClick={() => addAddon(p)}>Add</Button>
            </div>
          </Card>
        ))}
      </div>

      {menu?.drinks && menu.drinks.length > 0 && (
        <>
          <h2 className="mt-12 font-display text-2xl font-bold text-belly-brown">Drinks</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {menu.drinks.map((p) => (
              <Card key={p.id} className="card-hover p-4">
                <p className="font-semibold">{p.name}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="font-bold text-belly-red">{formatPeso(Number(p.price))}</span>
                  <Button size="sm" variant="outline" onClick={() => addAddon(p)}>Add</Button>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
