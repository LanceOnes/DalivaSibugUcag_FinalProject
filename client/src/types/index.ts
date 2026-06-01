export type UserRole = 'customer' | 'admin'

export interface User {
  id: number
  name: string
  email: string
  phone: string | null
  role: UserRole
  address: string | null
}

export interface ProductVariant {
  id: number
  product_id: number
  size_label: string
  servings: string | null
  price: string | number
  is_active: boolean
  sort_order: number
}

export interface Product {
  id: number
  name: string
  slug: string
  description: string | null
  image: string | null
  product_picture: string | null
  product_picture_url?: string | null
  category: 'belly' | 'addon' | 'drink'
  price: string | number | null
  is_active: boolean
  sort_order: number
  variants?: ProductVariant[]
  active_variants?: ProductVariant[]
}

export interface MenuData {
  belly: Product[]
  addons: Product[]
  drinks: Product[]
}

export interface TimeSlot {
  id: number
  start_time: string
  end_time: string
  label: string
  available_spots: number
}

export interface CartItem {
  key: string
  productId: number
  variantId?: number
  name: string
  sizeLabel?: string
  unitPrice: number
  quantity: number
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready_for_pickup'
  | 'delivered'
  | 'cancelled'

export interface OrderItem {
  id: number
  item_name: string
  size_label: string | null
  unit_price: string | number
  quantity: number
  line_total: string | number
}

export interface Order {
  id: number
  order_number: string
  customer_name: string
  email: string | null
  phone: string
  fulfillment_type: 'pickup' | 'delivery'
  delivery_address: string | null
  delivery_fee: string | number
  scheduled_date: string
  scheduled_time: string | null
  subtotal: string | number
  total: string | number
  downpayment_amount: string | number
  downpayment_paid: boolean
  status: OrderStatus
  notes: string | null
  guest_token?: string | null
  items: OrderItem[]
  created_at: string
}
