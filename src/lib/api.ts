import type { SaleRow } from '../types'
import { generateSales } from './seed'

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms))

/**
 * מחזיר 10k רשומות אחרי דיליי קצר. אם fail=true — זורק שגיאה.
 */
export async function fetchSales(opts?: { count?: number; delayMs?: number; fail?: boolean }): Promise<SaleRow[]> {
    const { count = 10_000, delayMs = 600, fail = false } = opts ?? {}
    await sleep(delayMs)
    if (fail) {
        throw new Error('Network error (simulated)')
    }
    return generateSales(count)
}
