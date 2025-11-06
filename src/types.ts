export interface SaleRow {
  id: number
  customer: string
  customerLC: string   
  category: 'Hardware' | 'Software' | 'Services'
  categoryLC: string   
  quantity: number
  price: number
  cost: number
  marginPct: number
  status: 'new' | 'processing' | 'shipped' | 'canceled'
  date: string
  dateISO: string
}
