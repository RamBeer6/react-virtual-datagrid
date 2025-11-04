import type { SaleRow } from '../types'

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const customers = ['Alice','Bob','Charlie','Dana','Eve','Frank','Grace','Heidi','Ivan','Judy','Mallory','Niaj','Olivia','Peggy','Sybil','Trent','Victor','Walter']
const categories: Array<SaleRow['category']> = ['Hardware','Software','Services']
const statuses: Array<SaleRow['status']> = ['new','processing','shipped','canceled']

export function generateSales(count = 10_000, seed = 42): SaleRow[] {
  const rnd = mulberry32(seed)
  const rows: SaleRow[] = []
  const start = new Date('2023-01-01').getTime()
  const end = new Date('2025-10-01').getTime()
  for (let i = 1; i <= count; i++) {
    const customer = customers[Math.floor(rnd() * customers.length)]
    const category = categories[Math.floor(rnd() * categories.length)]
    const quantity = Math.max(1, Math.floor(rnd() * 10))
    const base = 20 + rnd() * 980
    const costFactor = 0.3 + rnd() * 0.5
    const price = Math.round(base * 100) / 100
    const cost = Math.round(base * costFactor * 100) / 100
    const date = new Date(start + rnd() * (end - start)).toISOString()
    const status = statuses[Math.floor(rnd() * statuses.length)]
    rows.push({ id: i, customer, category, price, cost, quantity, date, status })
  }
  return rows
}
