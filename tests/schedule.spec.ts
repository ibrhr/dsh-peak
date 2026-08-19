import { describe, it, expect } from 'vitest'
import {
  getPeakStatus,
  isPeak,
  getTimeInfo,
  OFFICIAL_UTC_WINDOWS,
  LEGACY_BEIJING_WINDOWS,
} from '../src/core/schedule.ts'

describe('Peak Schedule Evaluator', () => {
  describe('Official UTC Schedule', () => {
    it('correctly detects early morning off-peak (00:30 UTC)', () => {
      const date = new Date('2026-08-19T00:30:00Z')
      const status = getPeakStatus(date)

      expect(status.state).toBe('OFF_PEAK')
      expect(status.isPeak).toBe(false)
      expect(status.discountPercent).toBe(50)
      expect(status.currentWindow.start).toBe('00:00')
      expect(status.currentWindow.end).toBe('01:00')
      expect(status.nextWindow.start).toBe('01:00')
      expect(status.nextWindow.end).toBe('04:00')
      expect(status.formattedCountdown).toBe('30m')
    })

    it('correctly detects morning peak window start (01:00 UTC)', () => {
      const date = new Date('2026-08-19T01:00:00Z')
      const status = getPeakStatus(date)

      expect(status.state).toBe('PEAK')
      expect(status.isPeak).toBe(true)
      expect(status.discountPercent).toBe(0)
      expect(status.currentWindow.start).toBe('01:00')
      expect(status.currentWindow.end).toBe('04:00')
      expect(status.nextWindow.start).toBe('04:00')
      expect(status.formattedCountdown).toBe('3h 0m')
    })

    it('correctly detects morning peak window interior (02:45 UTC)', () => {
      const date = new Date('2026-08-19T02:45:00Z')
      const status = getPeakStatus(date)

      expect(status.state).toBe('PEAK')
      expect(status.isPeak).toBe(true)
      expect(status.formattedCountdown).toBe('1h 15m')
    })

    it('correctly detects midday off-peak window (04:30 UTC)', () => {
      const date = new Date('2026-08-19T04:30:00Z')
      const status = getPeakStatus(date)

      expect(status.state).toBe('OFF_PEAK')
      expect(status.isPeak).toBe(false)
      expect(status.discountPercent).toBe(50)
      expect(status.currentWindow.start).toBe('04:00')
      expect(status.currentWindow.end).toBe('06:00')
      expect(status.formattedCountdown).toBe('1h 30m')
    })

    it('correctly detects afternoon peak window (08:15 UTC)', () => {
      const date = new Date('2026-08-19T08:15:00Z')
      const status = getPeakStatus(date)

      expect(status.state).toBe('PEAK')
      expect(status.isPeak).toBe(true)
      expect(status.currentWindow.start).toBe('06:00')
      expect(status.currentWindow.end).toBe('10:00')
      expect(status.formattedCountdown).toBe('1h 45m')
    })

    it('correctly detects evening/night off-peak window (14:20 UTC)', () => {
      const date = new Date('2026-08-19T14:20:00Z')
      const status = getPeakStatus(date)

      expect(status.state).toBe('OFF_PEAK')
      expect(status.isPeak).toBe(false)
      expect(status.discountPercent).toBe(50)
      expect(status.currentWindow.start).toBe('10:00')
      expect(status.currentWindow.end).toBe('24:00')
      expect(status.nextWindow.start).toBe('00:00')
    })

    it('handles midnight transition cleanly (23:59:59 UTC)', () => {
      const date = new Date('2026-08-19T23:59:59Z')
      const status = getPeakStatus(date)

      expect(status.state).toBe('OFF_PEAK')
      expect(status.isPeak).toBe(false)
      expect(status.timeToNextChangeMs).toBeLessThan(2000)
    })
  })

  describe('Legacy Beijing Schedule', () => {
    it('correctly detects legacy off-peak window in Beijing night (20:00 UTC = 04:00 CST)', () => {
      const date = new Date('2026-08-19T20:00:00Z')
      const status = getPeakStatus(date, { scheduleType: 'legacy_beijing' })

      expect(status.state).toBe('OFF_PEAK')
      expect(status.isPeak).toBe(false)
      expect(status.discountPercent).toBe(50)
    })

    it('correctly detects legacy daytime peak (04:00 UTC = 12:00 CST)', () => {
      const date = new Date('2026-08-19T04:00:00Z')
      const status = getPeakStatus(date, { scheduleType: 'legacy_beijing' })

      expect(status.state).toBe('PEAK')
      expect(status.isPeak).toBe(true)
    })
  })

  describe('Helper Functions', () => {
    it('isPeak helper returns boolean', () => {
      expect(isPeak(new Date('2026-08-19T02:00:00Z'))).toBe(true)
      expect(isPeak(new Date('2026-08-19T05:00:00Z'))).toBe(false)
    })

    it('getTimeInfo returns synchronized timezone strings', () => {
      const date = new Date('2026-08-19T08:30:15Z')
      const info = getTimeInfo(date)

      expect(info.utcTime).toBe('08:30:15')
      expect(info.beijingTime).toBe('16:30:15')
      expect(info.iso).toBe('2026-08-19T08:30:15.000Z')
    })
  })
})
