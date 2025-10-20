export interface TranslationProvider {
  name: 'deepl' | 'google' | 'azure'
  translate(text: string, from: string, to: string): Promise<string>
  getRateLimit(): { requestsPerMinute: number; requestsPerDay: number }
}

export interface TranslationJob {
  id: string
  serviceId: string
  locale: string
  contentHash: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  attempts: number
  maxAttempts: number
  createdAt: Date
  updatedAt: Date
  error?: string
}

export interface TranslationResult {
  success: boolean
  translatedText?: string
  error?: string
  provider?: string
  rateLimitRemaining?: number
}

export class DeepLProvider implements TranslationProvider {
  name = 'deepl' as const
  private apiKey: string
  private baseUrl = 'https://api-free.deepl.com/v2/translate'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async translate(text: string, from: string, to: string): Promise<string> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${this.apiKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        text,
        source_lang: from.toUpperCase(),
        target_lang: to.toUpperCase(),
      }),
    })

    if (!response.ok) {
      throw new Error(`DeepL API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data.translations[0].text
  }

  getRateLimit(): { requestsPerMinute: number; requestsPerDay: number } {
    return { requestsPerMinute: 500, requestsPerDay: 500000 }
  }
}

export class GoogleProvider implements TranslationProvider {
  name = 'google' as const
  private apiKey: string
  private baseUrl = 'https://translation.googleapis.com/language/translate/v2'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async translate(text: string, from: string, to: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source: from,
        target: to,
        format: 'text',
      }),
    })

    if (!response.ok) {
      throw new Error(`Google Translate API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data.data.translations[0].translatedText
  }

  getRateLimit(): { requestsPerMinute: number; requestsPerDay: number } {
    return { requestsPerMinute: 100, requestsPerDay: 100000 }
  }
}

export class AzureProvider implements TranslationProvider {
  name = 'azure' as const
  private apiKey: string
  private region: string
  private baseUrl: string

  constructor(apiKey: string, region: string = 'global') {
    this.apiKey = apiKey
    this.region = region
    this.baseUrl = `https://api.cognitive.microsofttranslator.com/translate?api-version=3.0`
  }

  async translate(text: string, from: string, to: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}&from=${from}&to=${to}`, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': this.apiKey,
        'Ocp-Apim-Subscription-Region': this.region,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([{ text }]),
    })

    if (!response.ok) {
      throw new Error(`Azure Translator API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data[0].translations[0].text
  }

  getRateLimit(): { requestsPerMinute: number; requestsPerDay: number } {
    return { requestsPerMinute: 200, requestsPerDay: 2000000 }
  }
}

export function createTranslationProvider(
  provider: 'deepl' | 'google' | 'azure',
  apiKey: string,
  region?: string
): TranslationProvider {
  switch (provider) {
    case 'deepl':
      return new DeepLProvider(apiKey)
    case 'google':
      return new GoogleProvider(apiKey)
    case 'azure':
      return new AzureProvider(apiKey, region)
    default:
      throw new Error(`Unsupported translation provider: ${provider}`)
  }
}
