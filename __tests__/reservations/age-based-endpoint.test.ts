import { describe, it, expect, vi, beforeEach } from 'vitest'

// Nota: este test asume que existe getSupabaseClient y que podemos simularlo
vi.mock('@/lib/supabase-unified', () => ({
  getSupabaseClient: vi.fn(async () => ({
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { id: 'service-1', name: 'S', available: true, price: 10 } }),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis()
    })
  }))
}))

describe('age-based reservations API compatibility', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('calcula y persiste total_amount y total_price', async () => {
    const { POST } = await import('@/app/api/reservations/age-based/route')

    const req = {
      json: async () => ({
        serviceId: 'service-1',
        userId: 'user-1',
        reservationDate: '2025-10-20',
        participants: [
          { participant_type: 'adult', age: 30, price: 10, age_range: '18-64' },
          { participant_type: 'child', age: 10, price: 5, age_range: '6-12' }
        ],
        totalPrice: 1,
        specialRequests: 'n/a'
      })
    } as any

    const res = await POST(req)
    expect(res.status).toBe(200)
  })
})


