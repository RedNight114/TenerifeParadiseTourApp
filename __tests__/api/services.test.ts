import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('@/lib/supabase-unified', () => {
  const chain: any = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockImplementation((_sel: string, _opts?: any) => chain),
    order: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis()
  }
  return {
    getSupabaseClient: vi.fn(async () => chain),
    __chain: chain
  }
})

describe('GET /api/services', () => {
  let route: any
  let chain: any

  beforeEach(async () => {
    vi.resetModules()
    const mod = await import('@/app/api/services/route')
    route = mod
    const supabaseUnified = await import('@/lib/supabase-unified') as any
    chain = (supabaseUnified as any).__chain
    chain.from.mockClear()
    chain.select.mockClear()
    chain.order.mockClear()
    chain.range.mockClear()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('retorna shape paginado por defecto con limit/offset y total', async () => {
    chain.select.mockImplementation((_sel: string, _opts?: any) => {
      chain.__result = { data: [{ id: 1 }, { id: 2 }], error: null, count: 42 }
      return chain
    })
    ;(chain as any).order.mockImplementation(() => chain)
    ;(chain as any).range.mockImplementation(() => chain.__result)

    const url = new URL('http://localhost/api/services?limit=2&offset=10')
    const res = await route.GET({ url: url.toString() } as any)
    const json = await res.json()
    expect(json.items).toHaveLength(2)
    expect(json.page).toEqual({ limit: 2, offset: 10, total: 42 })
  })

  it('clamp del limit a 100', async () => {
    chain.select.mockImplementation((_sel: string, _opts?: any) => {
      chain.__result = { data: Array.from({ length: 3 }, (_, i) => ({ id: i })), error: null, count: 150 }
      return chain
    })
    ;(chain as any).range.mockImplementation(() => chain.__result)

    const url = new URL('http://localhost/api/services?limit=500&offset=0')
    const res = await route.GET({ url: url.toString() } as any)
    const json = await res.json()
    expect(json.page.limit).toBe(100)
    expect(json.page.total).toBe(150)
  })

  it('legacy=true devuelve array plano', async () => {
    chain.select.mockImplementation((_sel: string, _opts?: any) => {
      chain.__result = { data: [{ id: 1 }, { id: 2 }], error: null, count: 2 }
      return chain
    })
    ;(chain as any).range.mockImplementation(() => chain.__result)

    const url = new URL('http://localhost/api/services?legacy=true&limit=2')
    const res = await route.GET({ url: url.toString() } as any)
    const json = await res.json()
    expect(Array.isArray(json)).toBe(true)
    expect(json).toHaveLength(2)
  })
})


