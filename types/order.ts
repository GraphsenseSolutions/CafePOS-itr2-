export interface OrderItem {
  id: string
  name: string
  price: number
  category: string
  subcategory?: string
  quantity: number
}

export interface Order {
  id: string
  customerName: string
  items: OrderItem[]
  total: number
  isPaid: boolean
  isCancelled?: boolean
  paymentMethod?: "upi" | "cash"
  createdAt: string
}

