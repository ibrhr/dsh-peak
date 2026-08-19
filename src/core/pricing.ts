import type { ModelPricing } from './types.ts'

/**
 * Official DeepSeek API Model Rate Cards (USD per 1M tokens).
 * Off-peak hours receive a 50% discount across cache hit, cache miss, and output tokens.
 */
export const DEEPSEEK_MODELS: Record<string, ModelPricing> = {
  'deepseek-v4-flash': {
    modelId: 'deepseek-v4-flash',
    name: 'DeepSeek-V4 Flash',
    currency: '$',
    discountPercent: 50,
    peak: {
      inputCacheHit: 0.014,
      inputCacheMiss: 0.44,
      output: 1.32,
    },
    offPeak: {
      inputCacheHit: 0.007,
      inputCacheMiss: 0.22,
      output: 0.66,
    },
  },
  'deepseek-v4-pro': {
    modelId: 'deepseek-v4-pro',
    name: 'DeepSeek-V4 Pro',
    currency: '$',
    discountPercent: 50,
    peak: {
      inputCacheHit: 0.044,
      inputCacheMiss: 1.32,
      output: 3.96,
    },
    offPeak: {
      inputCacheHit: 0.022,
      inputCacheMiss: 0.66,
      output: 1.98,
    },
  },
}
