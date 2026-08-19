import { describe, it, expect } from 'vitest'
import { calculateTokenSavings, DEEPSEEK_MODELS } from '../src/core/pricing.ts'

describe('Pricing & Savings Calculator', () => {
  it('contains valid rate cards for standard DeepSeek models', () => {
    const flash = DEEPSEEK_MODELS['deepseek-v4-flash']
    expect(flash).toBeDefined()
    expect(flash.discountPercent).toBe(50)
    expect(flash.offPeak.inputCacheHit).toBe(flash.peak.inputCacheHit / 2)
    expect(flash.offPeak.inputCacheMiss).toBe(flash.peak.inputCacheMiss / 2)
    expect(flash.offPeak.output).toBe(flash.peak.output / 2)
  })

  it('calculates 50% savings accurately for DeepSeek-V4 Flash', () => {
    const res = calculateTokenSavings({
      inputTokens: 1_000_000,
      outputTokens: 500_000,
      cacheHitRatio: 0.5,
      modelId: 'deepseek-v4-flash',
    })

    // Peak:
    // cacheHit: 500k * $0.014 / 1M = 0.007
    // cacheMiss: 500k * $0.44 / 1M = 0.220
    // output: 500k * $1.32 / 1M = 0.660
    // Total peak = 0.887 USD

    // Off-Peak: exactly half = 0.4435 USD
    expect(res.peakCostUSD).toBeCloseTo(0.887, 3)
    expect(res.offPeakCostUSD).toBeCloseTo(0.4435, 3)
    expect(res.savingsUSD).toBeCloseTo(0.4435, 3)
    expect(res.savingsPercent).toBeCloseTo(50, 1)
  })

  it('calculates savings for DeepSeek-V4 Pro', () => {
    const res = calculateTokenSavings({
      inputTokens: 2_000_000,
      outputTokens: 1_000_000,
      cacheHitRatio: 0.8,
      modelId: 'deepseek-v4-pro',
    })

    expect(res.peakCostUSD).toBeGreaterThan(0)
    expect(res.offPeakCostUSD).toBe(res.peakCostUSD / 2)
    expect(res.savingsPercent).toBeCloseTo(50, 1)
  })
})
