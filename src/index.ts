/**
 * dsh-peak host plugin entry for DeepSeek Harness (Cordis node half).
 *
 * Provides the host-side 'peak' service for background jobs, agents,
 * batch dispatchers, and external integrations to query real-time
 * DeepSeek API peak pricing status and transition schedules.
 */

import {
  getPeakStatus,
  getTimeInfo,
  isPeak,
  getScheduleWindows,
  OFFICIAL_UTC_WINDOWS,
  LEGACY_BEIJING_WINDOWS,
} from './core/schedule.ts'
import {
  calculateTokenSavings,
  DEEPSEEK_MODELS,
} from './core/pricing.ts'
import { formatCountdown, formatClockTime, formatPrice } from './core/format.ts'
import type {
  CostCalculationParams,
  CostEstimateResult,
  PeakScheduleConfig,
  PeakState,
  PeakStatusResult,
  ScheduleType,
  ScheduleWindow,
  TimeInfo,
} from './core/types.ts'

export interface PeakService {
  /** Check if currently in peak hours */
  isPeak(targetDate?: Date, config?: Partial<PeakScheduleConfig>): boolean
  /** Get full status evaluation */
  getStatus(targetDate?: Date, config?: Partial<PeakScheduleConfig>, locale?: 'en' | 'zh'): PeakStatusResult
  /** Calculate estimated savings */
  calculateSavings(params: CostCalculationParams): CostEstimateResult
  /** Get all windows */
  getWindows(scheduleType?: ScheduleType): ScheduleWindow[]
  /** Get current clock times across UTC, Beijing, and Local */
  getTimeInfo(date?: Date): TimeInfo
  /** Model rates */
  models: typeof DEEPSEEK_MODELS
}

/**
 * Creates an instance of the PeakService API.
 */
export function createPeakService(): PeakService {
  return {
    isPeak: (targetDate, config) => isPeak(targetDate, config),
    getStatus: (targetDate, config, locale) => getPeakStatus(targetDate, config, locale),
    calculateSavings: (params) => calculateTokenSavings(params),
    getWindows: (scheduleType) => getScheduleWindows(scheduleType),
    getTimeInfo: (date) => getTimeInfo(date),
    models: DEEPSEEK_MODELS,
  }
}

/**
 * Cordis Host Plugin Lifecycle:
 * Registers the 'peak' service into the host context when loaded.
 */
export function apply(ctx: any): void {
  const peakService = createPeakService()

  if (ctx && typeof ctx.provide === 'function') {
    ctx.provide('peak')
    ctx.peak = peakService
  } else if (ctx && typeof ctx.set === 'function') {
    ctx.set('peak', peakService)
  }

  // Register clean disposal if effect is available
  if (ctx && typeof ctx.effect === 'function') {
    ctx.effect(() => () => {
      if (ctx.peak === peakService) {
        delete ctx.peak
      }
    })
  }
}

// Re-export all core types and functions
export {
  getPeakStatus,
  getTimeInfo,
  isPeak,
  getScheduleWindows,
  OFFICIAL_UTC_WINDOWS,
  LEGACY_BEIJING_WINDOWS,
  calculateTokenSavings,
  DEEPSEEK_MODELS,
  formatCountdown,
  formatClockTime,
  formatPrice,
}

export type {
  CostCalculationParams,
  CostEstimateResult,
  PeakScheduleConfig,
  PeakState,
  PeakStatusResult,
  ScheduleType,
  ScheduleWindow,
  TimeInfo,
}
