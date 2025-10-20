import { createTranslationProvider, TranslationProvider, TranslationJob, TranslationResult } from './providers'
import { I18N_ENABLED, I18N_DEFAULT_LOCALE } from '@/app/config/i18n'

export interface TranslationQueueConfig {
  maxRetries: number
  retryDelayMs: number
  batchSize: number
  rateLimitBuffer: number
}

export class TranslationQueue {
  private provider: TranslationProvider
  private config: TranslationQueueConfig
  private jobs: Map<string, TranslationJob> = new Map()
  private processing = false

  constructor(provider: TranslationProvider, config: Partial<TranslationQueueConfig> = {}) {
    this.provider = provider
    this.config = {
      maxRetries: 3,
      retryDelayMs: 1000,
      batchSize: 10,
      rateLimitBuffer: 0.8,
      ...config,
    }
  }

  async enqueueTranslation(
    serviceId: string,
    locale: string,
    contentHash: string,
    text: string,
    fromLocale: string = I18N_DEFAULT_LOCALE
  ): Promise<string> {
    if (!I18N_ENABLED) {
      throw new Error('Translation is disabled')
    }

    const jobId = `${serviceId}-${locale}-${contentHash}`
    
    // Check if job already exists
    if (this.jobs.has(jobId)) {
      const existingJob = this.jobs.get(jobId)!
      if (existingJob.status === 'completed') {
        return jobId
      }
      if (existingJob.status === 'processing') {
        return jobId
      }
    }

    const job: TranslationJob = {
      id: jobId,
      serviceId,
      locale,
      contentHash,
      status: 'pending',
      attempts: 0,
      maxAttempts: this.config.maxRetries,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    this.jobs.set(jobId, job)
    
    // Start processing if not already running
    if (!this.processing) {
      this.processQueue()
    }

    return jobId
  }

  private async processQueue(): Promise<void> {
    if (this.processing) return
    
    this.processing = true

    try {
      const pendingJobs = Array.from(this.jobs.values())
        .filter(job => job.status === 'pending')
        .slice(0, this.config.batchSize)

      if (pendingJobs.length === 0) {
        return
      }

      // Process jobs in parallel with rate limiting
      const rateLimit = this.provider.getRateLimit()
      const maxConcurrent = Math.floor(rateLimit.requestsPerMinute * this.config.rateLimitBuffer / 60)

      const batches = this.chunkArray(pendingJobs, maxConcurrent)
      
      for (const batch of batches) {
        await Promise.allSettled(
          batch.map(job => this.processJob(job))
        )
        
        // Rate limiting delay
        await this.delay(1000)
      }
    } finally {
      this.processing = false
    }
  }

  private async processJob(job: TranslationJob): Promise<void> {
    try {
      job.status = 'processing'
      job.attempts++
      job.updatedAt = new Date()

      // Get the original text from service
      const originalText = await this.getServiceText(job.serviceId)
      if (!originalText) {
        throw new Error('Service text not found')
      }

      // Translate
      const translatedText = await this.provider.translate(
        originalText,
        I18N_DEFAULT_LOCALE,
        job.locale
      )

      // Save translation to database
      await this.saveTranslation(job.serviceId, job.locale, translatedText, 'auto')

      job.status = 'completed'
      job.updatedAt = new Date()

    } catch (error) {
      job.error = error instanceof Error ? error.message : 'Unknown error'
      job.updatedAt = new Date()

      if (job.attempts >= job.maxAttempts) {
        job.status = 'failed'
      } else {
        job.status = 'pending'
        // Exponential backoff
        await this.delay(this.config.retryDelayMs * Math.pow(2, job.attempts - 1))
      }
    }
  }

  private async getServiceText(serviceId: string): Promise<string | null> {
    // This would typically fetch from Supabase
    // For now, return mock data
    return 'Sample service text'
  }

  private async saveTranslation(
    serviceId: string,
    locale: string,
    translatedText: string,
    status: 'auto' | 'verified'
  ): Promise<void> {
    // This would typically save to Supabase service_translations table
    console.log(`Saving translation for ${serviceId} in ${locale}: ${translatedText}`)
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = []
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size))
    }
    return chunks
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  getJobStatus(jobId: string): TranslationJob | null {
    return this.jobs.get(jobId) || null
  }

  getAllJobs(): TranslationJob[] {
    return Array.from(this.jobs.values())
  }

  getJobsByStatus(status: TranslationJob['status']): TranslationJob[] {
    return Array.from(this.jobs.values()).filter(job => job.status === status)
  }
}
