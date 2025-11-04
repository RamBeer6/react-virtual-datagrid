export type OrderStatus = 'new' | 'processing' | 'shipped' | 'canceled'

export interface SaleRow {
  id: number
  customer: string
  category: 'Hardware' | 'Software' | 'Services'
  price: number // gross price
  cost: number  // internal cost
  quantity: number
  date: string  // ISO date string
  status: OrderStatus
}
