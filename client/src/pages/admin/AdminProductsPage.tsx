import { useEffect, useState } from 'react'
import { axiosInstance } from '@/lib/axiosInstance'
import type { Product, ProductVariant } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Trash2 } from 'lucide-react'

export function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [editing, setEditing] = useState<Product | null>(null)
  const [variants, setVariants] = useState<Partial<ProductVariant>[]>([])
  const [deleteIds, setDeleteIds] = useState<number[]>([])

  const load = () => axiosInstance.get('/admin/products').then(({ data }) => setProducts(data.products))

  useEffect(() => { load() }, [])

  const startEdit = (p: Product) => {
    setEditing(p)
    setVariants(p.variants ?? [])
    setDeleteIds([])
  }

  const save = async () => {
    if (!editing) return
    await axiosInstance.put(`/admin/products/${editing.id}`, {
      name: editing.name,
      description: editing.description,
      category: editing.category,
      price: editing.price,
      is_active: editing.is_active,
      variants: variants.map((v) => ({
        id: v.id,
        size_label: v.size_label,
        servings: v.servings,
        price: v.price,
        is_active: v.is_active ?? true,
      })),
      delete_variant_ids: deleteIds,
    })
    setEditing(null)
    load()
  }

  const removeProduct = async (id: number) => {
    if (!confirm('Delete product?')) return
    await axiosInstance.delete(`/admin/products/${id}`)
    load()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Products</h1>
      <div className="mt-4 space-y-3">
        {products.map((p) => (
          <div key={p.id} className="flex items-center justify-between rounded-xl border bg-white p-4">
            <div>
              <p className="font-semibold">{p.name}</p>
              <p className="text-xs text-gray-500">{p.category} · {p.variants?.length ?? 0} variants</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => startEdit(p)}>Edit</Button>
              <Button size="sm" variant="ghost" onClick={() => removeProduct(p.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6">
            <h2 className="text-lg font-bold">Edit {editing.name}</h2>
            <div className="mt-4 space-y-3">
              <div><Label>Name</Label><Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
              <div><Label>Description</Label><Input value={editing.description ?? ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></div>
              <p className="font-medium">Variants</p>
              {variants.map((v, i) => (
                <div key={v.id ?? i} className="grid grid-cols-3 gap-2">
                  <Input placeholder="Size" value={v.size_label ?? ''} onChange={(e) => {
                    const nv = [...variants]; nv[i] = { ...nv[i], size_label: e.target.value }; setVariants(nv)
                  }} />
                  <Input type="number" placeholder="Price" value={v.price ?? ''} onChange={(e) => {
                    const nv = [...variants]; nv[i] = { ...nv[i], price: Number(e.target.value) }; setVariants(nv)
                  }} />
                  {v.id && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => {
                      setDeleteIds([...deleteIds, v.id!])
                      setVariants(variants.filter((_, j) => j !== i))
                    }}><Trash2 className="h-4 w-4" /></Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => setVariants([...variants, { size_label: '', price: 0 }])}>
                <Plus className="h-4 w-4" /> Add variant
              </Button>
            </div>
            <div className="mt-6 flex gap-2">
              <Button onClick={save}>Save</Button>
              <Button variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
