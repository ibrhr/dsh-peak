import { describe, it, expect } from 'vitest'
import { formatCountdown, formatClockTime, formatPrice } from '../src/core/format.ts'

describe('Formatting Utilities', () => {
  it('formats countdowns in English', () => {
    expect(formatCountdown(2 * 3600 * 1000 + 15 * 60 * 1000, 'en')).toBe('2h 15m')
    expect(formatCountdown(45 * 60 * 1000, 'en')).toBe('45m')
    expect(formatCountdown(30 * 1000, 'en')).toBe('< 1m')
    expect(formatCountdown(0, 'en')).toBe('Now')
  })

  it('formats countdowns in Chinese', () => {
    expect(formatCountdown(2 * 3600 * 1000 + 15 * 60 * 1000, 'zh')).toBe('2小时15分')
    expect(formatCountdown(45 * 60 * 1000, 'zh')).toBe('45分钟')
    expect(formatCountdown(30 * 1000, 'zh')).toBe('< 1分钟')
    expect(formatCountdown(0, 'zh')).toBe('即将切换')
  })

  it('formats clock times', () => {
    const date = new Date('2026-08-19T15:30:45Z')
    expect(formatClockTime(date, 'UTC')).toBe('15:30:45')
  })

  it('formats prices', () => {
    expect(formatPrice(0.014)).toBe('$0.014')
    expect(formatPrice(1.32)).toBe('$1.32')
  })
})
