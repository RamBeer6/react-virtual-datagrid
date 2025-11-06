export interface SaleRow {
  id: number
  customer: string
  category: 'Hardware' | 'Software' | 'Services'
  quantity: number
  price: number
  cost: number
  marginPct: number
  status: 'new' | 'processing' | 'shipped' | 'canceled'
  date: string
  dateISO: string
}
