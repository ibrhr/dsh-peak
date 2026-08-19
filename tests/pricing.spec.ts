import { describe, it, expect } from 'vitest'
import { DEEPSEEK_MODELS } from '../src/core/pricing.ts'

describe('DeepSeek Model Pricing Rates', () => {
  it('contains valid 50% discount rate cards for DeepSeek-V4 Flash and Pro', () => {
    const flash = DEEPSEEK_MODELS['deepseek-v4-flash']
    expect(flash).toBeDefined()
    expect(flash.discountPercent).toBe(50)
    expect(flash.offPeak.inputCacheHit).toBe(flash.peak.inputCacheHit / 2)
    expect(flash.offPeak.inputCacheMiss).toBe(flash.peak.inputCacheMiss / 2)
    expect(flash.offPeak.output).toBe(flash.peak.output / 2)

    const pro = DEEPSEEK_MODELS['deepseek-v4-pro']
    expect(pro).toBeDefined()
    expect(pro.discountPercent).toBe(50)
    expect(pro.offPeak.inputCacheHit).toBe(pro.peak.inputCacheHit / 2)
    expect(pro.offPeak.inputCacheMiss).toBe(pro.peak.inputCacheMiss / 2)
    expect(pro.offPeak.output).toBe(pro.peak.output / 2)
  })
})
