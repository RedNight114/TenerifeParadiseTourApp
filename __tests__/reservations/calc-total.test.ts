import { describe, it, expect } from 'vitest'
import { calculateTotalAmountFromParticipants } from '@/lib/reservations/calc-total'

describe('calculateTotalAmountFromParticipants', () => {
  it('suma precios de participantes', () => {
    const total = calculateTotalAmountFromParticipants([
      { price: 10 },
      { price: 5.5 },
      { price: 0 }
    ])
    expect(total).toBe(15.5)
  })

  it('maneja lista vacía como 0', () => {
    const total = calculateTotalAmountFromParticipants([])
    expect(total).toBe(0)
  })

  it('ignora valores no numéricos', () => {
    const total = calculateTotalAmountFromParticipants([
      { price: 10 },
      { price: Number.NaN as unknown as number },
      { price: 2 }
    ])
    expect(total).toBe(12)
  })
})


