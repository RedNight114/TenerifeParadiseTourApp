import { describe, it, expect, beforeEach } from 'vitest'
import { resolveLocaleFrom } from '@/app/config/i18n'

describe('i18n negociación', () => {
  beforeEach(() => {
    process.env.I18N_ENABLED = 'true'
    process.env.I18N_DEFAULT_LOCALE = 'es'
    process.env.I18N_SUPPORTED = 'es,en,de,fr'
  })

  it('prioriza cookie lang válida', () => {
    const locale = resolveLocaleFrom('en-US,en;q=0.9', 'de')
    expect(locale).toBe('de')
  })

  it('usa Accept-Language cuando no hay cookie', () => {
    const locale = resolveLocaleFrom('fr-FR,fr;q=0.9,en;q=0.8', null)
    expect(locale).toBe('fr')
  })

  it('fallback a default cuando no coincide', () => {
    const locale = resolveLocaleFrom('it-IT,it;q=0.9', null)
    expect(locale).toBe('es')
  })
})

