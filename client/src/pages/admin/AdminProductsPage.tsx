import { useEffect, useState } from 'react'
import { axiosInstance } from '@/lib/axiosInstance'
import { toast } from '@/lib/toast'
import type { Product, ProductVariant } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import UploadInput from '@/components/ui/uploadinput'
import { Plus, Trash2 } from 'lucide-react'

export function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [editing, setEditing] = useState<Partial<Product> | null>(null)
  const [variants, setVariants] = useState<Partial<ProductVariant>[]>([])
  const [deleteIds, setDeleteIds] = useState<number[]>([])
  const [addProductPicture, setAddProductPicture] = useState<File | null>(null)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [saving, setSaving] = useState(false)

  const load = () => axiosInstance.get('/admin/products').then(({ data }) => setProducts(data.products))

  useEffect(() => {
    load()
  }, [])

  const addons = products.filter((p) => p.category === 'addon')
  const otherProducts = products.filter((p) => p.category !== 'addon')

  const closeEdit = () => {
    setEditing(null)
    setAddProductPicture(null)
    setDeleteIds([])
    setVariants([])
  }

  const startCreate = (category: Product['category']) => {
    setEditing({
      name: '',
      description: '',
      category,
      price: 0,
      is_active: true,
      sort_order: products.length,
    })
    setVariants([])
    setDeleteIds([])
    setAddProductPicture(null)
  }

  const startEdit = (p: Product) => {
    setEditing({ ...p })
    setVariants(p.variants ?? [])
    setDeleteIds([])
    setAddProductPicture(null)
  }

  const removeExistingPicture = async () => {
    if (!editing || !editing.id) return
    await axiosInstance.delete(`/admin/products/${editing.id}/image`)
    setEditing({ ...editing, product_picture: null, product_picture_url: null })
    toast.success('Image removed')
    load()
  }

  const uploadPicture = async (productId: number, file: File) => {
    const formData = new FormData()
    formData.append('product_picture', file)
    const { data } = await axiosInstance.post(`/admin/products/${productId}/image`, formData)
    return data.product as Product
  }

  const save = async () => {
    if (!editing) return
    setSaving(true)
    try {
      const payload = {
        name: editing.name,
        description: editing.description,
        category: editing.category,
        price: editing.category === 'belly' ? editing.price || null : editing.price,
        is_active: editing.is_active,
        sort_order: editing.sort_order,
        variants:
          editing.category === 'belly'
            ? variants.map((v) => ({
              id: v.id,
              size_label: v.size_label,
              servings: v.servings,
              price: v.price,
              is_active: v.is_active ?? true,
            }))
            : [],
        delete_variant_ids: deleteIds,
      }

      let product: Product

      if (editing.id) {
        const { data } = await axiosInstance.put(`/admin/products/${editing.id}`, payload)
        product = data.product
      } else {
        const { data } = await axiosInstance.post('/admin/products', payload)
        product = data.product
      }

      if (addProductPicture && product.id && product.category !== 'belly') {
        await uploadPicture(product.id, addProductPicture)
      }

      toast.success('Product saved')
      closeEdit()
      load()
    } catch {
      toast.error('Failed to save product')
    } finally {
      setSaving(false)
    }
  }

  const removeProduct = (product: Product) => {
    setProductToDelete(product)
  }

  const confirmRemoveProduct = async () => {
    if (!productToDelete) return

    try {
      await axiosInstance.delete(`/admin/products/${productToDelete.id}`)
      toast.success('Product deleted')
      load()
    } catch {
      toast.error('Unable to delete product')
    } finally {
      setProductToDelete(null)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Products</h1>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Add-ons</h2>
          <p className="text-sm text-gray-500">Edit an add-on to upload a photo (shown on the menu).</p>
        </div>
        <Button size="sm" onClick={() => startCreate('addon')}>
          Add add-on
        </Button>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {addons.map((p) => {
          const img = p.product_picture_url
          return (
            <div key={p.id} className="flex gap-3 rounded-xl border bg-white p-4">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                {img ? (
                  <img src={img} alt={p.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-[10px] text-gray-400">No photo</div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{p.name}</p>
                <p className="text-xs text-gray-500">₱{p.price}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <Button size="sm" variant="outline" onClick={() => startEdit(p)}>
                  Edit
                </Button>
                <Button size="sm" variant="ghost" onClick={() => removeProduct(p)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )
        })}
      </div>

      {otherProducts.length > 0 && (
        <>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Other products</h2>
              <p className="text-sm text-gray-500">Manage drinks, belly items, and other menu products.</p>
            </div>
            <Button size="sm" onClick={() => startCreate('drink')}>
              Add product
            </Button>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {otherProducts.map((p) => {
              const img = p.product_picture_url
              return (
                <div key={p.id} className="flex gap-3 rounded-xl border bg-white p-4">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    {img ? (
                      <img src={img} alt={p.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[10px] text-gray-400">No photo</div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{p.name}</p>
                    <p className="text-xs text-gray-500">
                      {p.category}
                      {p.variants?.length ? ` · ${p.variants.length} variants` : p.price != null ? ` · ₱${p.price}` : ''}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button size="sm" variant="outline" onClick={() => startEdit(p)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => removeProduct(p)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 text-left shadow-xl">
            <h2 className="text-lg font-semibold">Delete product</h2>
            <p className="mt-2 text-sm text-gray-600">
              Are you sure you want to delete <span className="font-semibold">{productToDelete.name}</span>? This cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setProductToDelete(null)}>
                No
              </Button>
              <Button onClick={confirmRemoveProduct}>
                Yes, delete
              </Button>
            </div>
          </div>
        </div>
      )}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6">
            <h2 className="text-lg font-bold">{editing.id ? 'Edit' : 'Add'} {editing.name || 'product'}</h2>
            <div className="mt-4 space-y-3">
              <div>
                <Label>Name</Label>
                <Input
                  value={editing.name ?? ''}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Input
                  value={editing.description ?? ''}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                />
              </div>
              <div>
                <Label>Category</Label>
                <select
                  className="flex h-11 w-full cursor-pointer rounded-xl border border-belly-brown/20 bg-white px-4 text-sm"
                  value={editing.category ?? 'addon'}
                  onChange={(e) => setEditing({ ...editing, category: e.target.value as Product['category'] })}
                >
                  <option value="addon">Add-on</option>
                  <option value="drink">Drink</option>
                  <option value="belly">Boneless Lechon Belly</option>
                </select>
              </div>

              {editing.category !== 'belly' && (
                <>
                  <div>
                    <Label>Price (₱)</Label>
                    <Input
                      type="text"
                      inputMode="decimal"
                      value={editing.price ?? ''}
                      onChange={(e) => setEditing({ ...editing, price: Number(e.target.value.replace(/,/g, '')) || 0 })}
                      onBlur={(e) => {
                        const num = Number(e.target.value.replace(/,/g, '')) || 0
                        setEditing({ ...editing, price: num })
                      }}
                      placeholder="0.00"
                    />
                  </div>
                  <UploadInput
                    label="Product photo"
                    name="product_picture"
                    value={addProductPicture}
                    onChange={setAddProductPicture}
                    existingImageUrl={editing.product_picture_url}
                    onRemoveExistingImageUrl={removeExistingPicture}
                    removeLabel="Remove photo"
                    previewAlt={editing.name ?? 'product image'}
                  />
                </>
              )}

              {editing.category === 'belly' && (
                <>
                  <p className="text-sm text-belly-brown/70">Image upload is not available for boneless lechon belly.</p>
                  <p className="font-medium">Variants</p>
                  {variants.map((v, i) => (
                    <div key={v.id ?? i} className="grid grid-cols-3 gap-2">
                      <Input
                        placeholder="Size"
                        value={v.size_label ?? ''}
                        onChange={(e) => {
                          const nv = [...variants]
                          nv[i] = { ...nv[i], size_label: e.target.value }
                          setVariants(nv)
                        }}
                      />
                      <Input
                        type="text"
                        inputMode="decimal"
                        placeholder="Price"
                        value={v.price ?? ''}
                        onChange={(e) => {
                          const nv = [...variants]
                          nv[i] = { ...nv[i], price: Number(e.target.value.replace(/,/g, '')) || 0 }
                          setVariants(nv)
                        }}
                        onBlur={(e) => {
                          const nv = [...variants]
                          nv[i] = { ...nv[i], price: Number(e.target.value.replace(/,/g, '')) || 0 }
                          setVariants(nv)
                        }}
                      />
                      {v.id && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setDeleteIds([...deleteIds, v.id!])
                            setVariants(variants.filter((_, j) => j !== i))
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setVariants([...variants, { size_label: '', price: 0 }])}
                  >
                    <Plus className="h-4 w-4" /> Add variant
                  </Button>
                </>
              )}
            </div>
            <div className="mt-6 flex gap-2">
              <Button onClick={save} disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </Button>
              <Button variant="ghost" onClick={closeEdit} disabled={saving}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
