import type { CostCalculationParams, CostEstimateResult, ModelPricing } from './types.ts'

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
  'deepseek-chat': {
    modelId: 'deepseek-chat',
    name: 'DeepSeek Chat (V3)',
    currency: '$',
    discountPercent: 50,
    peak: {
      inputCacheHit: 0.014,
      inputCacheMiss: 0.28,
      output: 1.10,
    },
    offPeak: {
      inputCacheHit: 0.007,
      inputCacheMiss: 0.14,
      output: 0.55,
    },
  },
  'deepseek-reasoner': {
    modelId: 'deepseek-reasoner',
    name: 'DeepSeek Reasoner (R1)',
    currency: '$',
    discountPercent: 50,
    peak: {
      inputCacheHit: 0.014,
      inputCacheMiss: 0.55,
      output: 2.19,
    },
    offPeak: {
      inputCacheHit: 0.007,
      inputCacheMiss: 0.275,
      output: 1.095,
    },
  },
}

/**
 * Calculate token costs and estimated savings between Peak and Off-Peak.
 */
export function calculateTokenSavings(
  params: CostCalculationParams
): CostEstimateResult {
  const model = DEEPSEEK_MODELS[params.modelId || 'deepseek-v4-flash'] || DEEPSEEK_MODELS['deepseek-v4-flash']
  const hitRatio = Math.max(0, Math.min(1, params.cacheHitRatio ?? 0.5))
  
  const cacheHitTokens = params.inputTokens * hitRatio
  const cacheMissTokens = params.inputTokens * (1 - hitRatio)
  const outputTokens = params.outputTokens

  // Per 1M tokens factor
  const factor = 1 / 1_000_000

  const peakCostUSD =
    cacheHitTokens * factor * model.peak.inputCacheHit +
    cacheMissTokens * factor * model.peak.inputCacheMiss +
    outputTokens * factor * model.peak.output

  const offPeakCostUSD =
    cacheHitTokens * factor * model.offPeak.inputCacheHit +
    cacheMissTokens * factor * model.offPeak.inputCacheMiss +
    outputTokens * factor * model.offPeak.output

  const savingsUSD = peakCostUSD - offPeakCostUSD
  const savingsPercent = peakCostUSD > 0 ? (savingsUSD / peakCostUSD) * 100 : 0

  return {
    modelName: model.name,
    peakCostUSD,
    offPeakCostUSD,
    savingsUSD,
    savingsPercent,
  }
}
