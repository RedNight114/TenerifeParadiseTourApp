"use client"
import { ReactNode, useMemo } from 'react'
import { I18N_ENABLED, I18N_DEFAULT_LOCALE } from '@/app/config/i18n'

type Messages = Record<string, string>

async function loadMessages(locale: string): Promise<Messages> {
  try {
    const module = await import(`@/i18n/messages/${locale}/common.json`)
    return module.default as Messages
  } catch {
    if (locale !== I18N_DEFAULT_LOCALE) {
      const module = await import(`@/i18n/messages/${I18N_DEFAULT_LOCALE}/common.json`)
      return module.default as Messages
    }
    return {}
  }
}

export function I18nProvider({ locale, children }: { locale: string; children: ReactNode }) {
  const enabled = I18N_ENABLED
  const value = useMemo(() => ({ locale }), [locale])
  if (!enabled) return <>{children}</>
  return <div data-locale={value.locale}>{children}</div>
}

export async function getMessagesFor(locale: string): Promise<Messages> {
  return await loadMessages(locale)
}

