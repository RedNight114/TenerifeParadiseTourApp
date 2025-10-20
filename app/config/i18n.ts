export const I18N_ENABLED = process.env.I18N_ENABLED === 'true'
export const I18N_DEFAULT_LOCALE = process.env.I18N_DEFAULT_LOCALE || 'es'
export const I18N_SUPPORTED = (process.env.I18N_SUPPORTED || 'es')
  .split(',')
  .map(l => l.trim())
  .filter(Boolean)

export function normalizeLocale(input?: string | null): string {
  const lower = (input || '').toLowerCase()
  if (!lower) return I18N_DEFAULT_LOCALE
  const short = lower.split('-')[0]
  return I18N_SUPPORTED.includes(short) ? short : I18N_DEFAULT_LOCALE
}

export function resolveLocaleFrom(acceptLanguageHeader: string | null | undefined, cookieLocale?: string | null): string {
  const cookieNorm = cookieLocale ? normalizeLocale(cookieLocale) : ''
  if (cookieNorm) return cookieNorm
  const accept = (acceptLanguageHeader || '')
  const candidates = accept.split(',').map(part => part.split(';')[0].trim()).filter(Boolean)
  for (const cand of candidates) {
    const short = cand.toLowerCase().split('-')[0]
    if (I18N_SUPPORTED.includes(short)) return short
  }
  return I18N_DEFAULT_LOCALE
}

export const LANGUAGE_COOKIE = 'lang'
export const LANGUAGE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 año
