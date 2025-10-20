import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('@supabase/supabase-js', () => {
  const chain: any = {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockImplementation((_sel: string, _opts?: any) => chain),
    eq: vi.fn().mockReturnThis(),
    not: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis()
  }
  return {
    createClient: vi.fn(() => chain),
    __chain: chain
  }
})

describe('GET /api/map-data/tenerife', () => {
  let route: any
  let chain: any

  beforeEach(async () => {
    vi.resetModules()
    const mod = await import('@/app/api/map-data/tenerife/route')
    route = mod
    const supabase = await import('@supabase/supabase-js') as any
    chain = (supabase as any).__chain
    chain.from.mockClear()
    chain.select.mockClear()
    chain.eq.mockClear()
    chain.not.mockClear()
    chain.order.mockClear()
    chain.range.mockClear()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('retorna shape paginado por defecto con total por coleccion', async () => {
    let callIndex = 0
    chain.select.mockImplementation((sel: string, opts?: any) => {
      callIndex++
      if (sel.includes('categories')) {
        chain.__result = { data: [{ id: 10, lat: 1, lng: 1, categories: { name: 'Cat' } }], error: null, count: 12 }
      } else {
        chain.__result = { data: [{ id: 1, lat: 1, lng: 1 }], error: null, count: 8 }
      }
      return chain
    })
    ;(chain as any).range.mockImplementation(() => chain.__result)

    const url = new URL('http://localhost/api/map-data/tenerife?limit=1&offset=2')
    const res = await route.GET({ url: url.toString() } as any)
    const json = await res.json()
    expect(json.items).toBeDefined()
    expect(json.items.hoteles).toHaveLength(1)
    expect(json.items.servicios).toHaveLength(1)
    expect(json.page.limit).toBe(1)
    expect(json.page.offset).toBe(2)
    expect(json.page.total).toEqual({ hoteles: 8, servicios: 12 })
  })

  it('legacy=true devuelve el shape anterior con success/data', async () => {
    chain.select.mockImplementation((sel: string, _opts?: any) => {
      if (sel.includes('categories')) {
        chain.__result = { data: [{ id: 10, lat: 1, lng: 1, categories: { name: 'Cat' } }], error: null, count: 1 }
      } else {
        chain.__result = { data: [{ id: 1, lat: 1, lng: 1 }], error: null, count: 1 }
      }
      return chain
    })
    ;(chain as any).range.mockImplementation(() => chain.__result)

    const url = new URL('http://localhost/api/map-data/tenerife?legacy=true')
    const res = await route.GET({ url: url.toString() } as any)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(json.data).toBeDefined()
    expect(Array.isArray(json.data.hoteles)).toBe(true)
    expect(Array.isArray(json.data.servicios)).toBe(true)
  })
})


