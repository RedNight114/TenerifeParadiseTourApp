import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { DeepLProvider, GoogleProvider, AzureProvider, createTranslationProvider } from '@/lib/translation/providers'
import { TranslationQueue } from '@/lib/translation/queue'

// Mock fetch
global.fetch = vi.fn()

// Mock i18n config
vi.mock('@/app/config/i18n', () => ({
  I18N_ENABLED: true,
  I18N_DEFAULT_LOCALE: 'es',
  I18N_SUPPORTED: ['es', 'en', 'de', 'fr']
}))

describe('Translation Providers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('DeepLProvider', () => {
    it('should translate text successfully', async () => {
      const mockResponse = {
        translations: [{ text: 'Hola mundo' }]
      }
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const provider = new DeepLProvider('test-key')
      const result = await provider.translate('Hello world', 'en', 'es')
      
      expect(result).toBe('Hola mundo')
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api-free.deepl.com/v2/translate',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'DeepL-Auth-Key test-key'
          })
        })
      )
    })

    it('should handle API errors', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests'
      })

      const provider = new DeepLProvider('test-key')
      await expect(provider.translate('Hello world', 'en', 'es'))
        .rejects.toThrow('DeepL API error: 429 Too Many Requests')
    })

    it('should return correct rate limits', () => {
      const provider = new DeepLProvider('test-key')
      const limits = provider.getRateLimit()
      expect(limits).toEqual({ requestsPerMinute: 500, requestsPerDay: 500000 })
    })
  })

  describe('GoogleProvider', () => {
    it('should translate text successfully', async () => {
      const mockResponse = {
        data: {
          translations: [{ translatedText: 'Hola mundo' }]
        }
      }
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const provider = new GoogleProvider('test-key')
      const result = await provider.translate('Hello world', 'en', 'es')
      
      expect(result).toBe('Hola mundo')
    })

    it('should handle API errors', async () => {
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden'
      })

      const provider = new GoogleProvider('test-key')
      await expect(provider.translate('Hello world', 'en', 'es'))
        .rejects.toThrow('Google Translate API error: 403 Forbidden')
    })
  })

  describe('AzureProvider', () => {
    it('should translate text successfully', async () => {
      const mockResponse = [{
        translations: [{ text: 'Hola mundo' }]
      }]
      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const provider = new AzureProvider('test-key', 'eastus')
      const result = await provider.translate('Hello world', 'en', 'es')
      
      expect(result).toBe('Hola mundo')
    })
  })

  describe('createTranslationProvider', () => {
    it('should create DeepL provider', () => {
      const provider = createTranslationProvider('deepl', 'test-key')
      expect(provider).toBeInstanceOf(DeepLProvider)
    })

    it('should create Google provider', () => {
      const provider = createTranslationProvider('google', 'test-key')
      expect(provider).toBeInstanceOf(GoogleProvider)
    })

    it('should create Azure provider', () => {
      const provider = createTranslationProvider('azure', 'test-key')
      expect(provider).toBeInstanceOf(AzureProvider)
    })

    it('should throw error for unsupported provider', () => {
      expect(() => createTranslationProvider('unsupported' as any, 'test-key'))
        .toThrow('Unsupported translation provider: unsupported')
    })
  })
})

describe('Translation Queue', () => {
  let mockProvider: any
  let queue: TranslationQueue

  beforeEach(() => {
    mockProvider = {
      name: 'deepl',
      translate: vi.fn(),
      getRateLimit: vi.fn(() => ({ requestsPerMinute: 100, requestsPerDay: 10000 }))
    }
    
    queue = new TranslationQueue(mockProvider, {
      maxRetries: 2,
      retryDelayMs: 100,
      batchSize: 2
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should enqueue translation job', async () => {
    const jobId = await queue.enqueueTranslation('service-1', 'es', 'hash123', 'Hello world')
    
    expect(jobId).toBe('service-1-es-hash123')
    
    const job = queue.getJobStatus(jobId)
    expect(job).toBeDefined()
    expect(job?.status).toBe('pending')
    expect(job?.serviceId).toBe('service-1')
    expect(job?.locale).toBe('es')
  })

  it('should not create duplicate jobs for same content hash', async () => {
    const jobId1 = await queue.enqueueTranslation('service-1', 'es', 'hash123', 'Hello world')
    const jobId2 = await queue.enqueueTranslation('service-1', 'es', 'hash123', 'Hello world')
    
    expect(jobId1).toBe(jobId2)
    
    const allJobs = queue.getAllJobs()
    expect(allJobs).toHaveLength(1)
  })

  it('should handle translation success', async () => {
    mockProvider.translate.mockResolvedValue('Hola mundo')
    
    const jobId = await queue.enqueueTranslation('service-1', 'es', 'hash123', 'Hello world')
    
    // Wait for processing
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const job = queue.getJobStatus(jobId)
    expect(job?.status).toBe('completed')
    expect(mockProvider.translate).toHaveBeenCalledWith('Sample service text', 'es', 'es')
  })

  it('should handle translation failure and retry', async () => {
    mockProvider.translate
      .mockRejectedValueOnce(new Error('Rate limit exceeded'))
      .mockRejectedValueOnce(new Error('Rate limit exceeded'))
      .mockResolvedValue('Hola mundo')
    
    const jobId = await queue.enqueueTranslation('service-1', 'es', 'hash123', 'Hello world')
    
    // Wait for processing with retries
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const job = queue.getJobStatus(jobId)
    expect(job?.status).toBe('completed')
    expect(job?.attempts).toBe(3)
  })

  it('should mark job as failed after max retries', async () => {
    mockProvider.translate.mockRejectedValue(new Error('Persistent error'))
    
    const jobId = await queue.enqueueTranslation('service-1', 'es', 'hash123', 'Hello world')
    
    // Wait for processing with all retries
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const job = queue.getJobStatus(jobId)
    expect(job?.status).toBe('failed')
    expect(job?.attempts).toBe(2) // maxRetries
    expect(job?.error).toBe('Persistent error')
  })

  it('should respect rate limits', async () => {
    mockProvider.getRateLimit.mockReturnValue({ requestsPerMinute: 2, requestsPerDay: 1000 })
    
    const queue = new TranslationQueue(mockProvider, {
      maxRetries: 1,
      retryDelayMs: 50,
      batchSize: 5,
      rateLimitBuffer: 0.5
    })
    
    // Enqueue multiple jobs
    await queue.enqueueTranslation('service-1', 'es', 'hash1', 'Text 1')
    await queue.enqueueTranslation('service-2', 'es', 'hash2', 'Text 2')
    await queue.enqueueTranslation('service-3', 'es', 'hash3', 'Text 3')
    
    mockProvider.translate.mockResolvedValue('Translated')
    
    // Wait for processing
    await new Promise(resolve => setTimeout(resolve, 200))
    
    // Should process in batches respecting rate limits
    expect(mockProvider.translate).toHaveBeenCalledTimes(3)
  })

  it('should filter jobs by status', async () => {
    mockProvider.translate
      .mockResolvedValueOnce('Translated 1')
      .mockRejectedValueOnce(new Error('Error'))
      .mockResolvedValueOnce('Translated 3')
    
    await queue.enqueueTranslation('service-1', 'es', 'hash1', 'Text 1')
    await queue.enqueueTranslation('service-2', 'es', 'hash2', 'Text 2')
    await queue.enqueueTranslation('service-3', 'es', 'hash3', 'Text 3')
    
    // Wait for processing
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const completedJobs = queue.getJobsByStatus('completed')
    const failedJobs = queue.getJobsByStatus('failed')
    
    expect(completedJobs).toHaveLength(2)
    expect(failedJobs).toHaveLength(1)
  })
})
