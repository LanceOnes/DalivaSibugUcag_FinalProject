import type { OrderItem, Product } from '@/types'

export type ProductOption = {
  value: string
  label: string
  unitPrice: number
  usesSlot: boolean
}

export function buildProductOptions(products: Product[]): ProductOption[] {
  const options: ProductOption[] = []

  for (const product of products) {
    if (!product.is_active) continue

    if (product.category === 'belly') {
      const variants = product.variants ?? product.active_variants ?? []
      for (const variant of variants) {
        if (!variant.is_active) continue
        options.push({
          value: `v-${variant.id}`,
          label: `${product.name} — ${variant.size_label}`,
          unitPrice: Number(variant.price),
          usesSlot: true,
        })
      }
    } else if (product.price != null) {
      options.push({
        value: `p-${product.id}`,
        label: product.name,
        unitPrice: Number(product.price),
        usesSlot: false,
      })
    }
  }

  return options
}

export function slotUnitsFromLines(
  lines: { selection: string; quantity: number }[],
  optionMap: Map<string, ProductOption>,
): number {
  return lines.reduce((sum, line) => {
    const opt = optionMap.get(line.selection)
    return sum + (opt?.usesSlot ? line.quantity : 0)
  }, 0)
}

export function selectionToPayload(selection: string, quantity: number) {
  if (selection.startsWith('v-')) {
    return { product_variant_id: Number(selection.slice(2)), quantity }
  }
  return { product_id: Number(selection.slice(2)), quantity }
}

export function itemToSelection(item: OrderItem): string {
  if (item.product_variant_id) return `v-${item.product_variant_id}`
  if (item.product_id) return `p-${item.product_id}`
  return ''
}
