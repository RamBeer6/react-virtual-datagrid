export type OrderStatus = 'new' | 'processing' | 'shipped' | 'canceled'

export interface SaleRow {
  id: number
  customer: string
  category: 'Hardware' | 'Software' | 'Services'
  price: number
  cost: number 
  quantity: number
  date: string  
  status: OrderStatus
}
