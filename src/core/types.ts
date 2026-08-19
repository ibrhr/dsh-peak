/**
 * Peak state identifier.
 */
export type PeakState = 'OFF_PEAK' | 'PEAK'

/**
 * Schedule rule system.
 */
export type ScheduleType = 'official_utc' | 'legacy_beijing'

/**
 * Schedule window representing a start and end time.
 */
export interface ScheduleWindow {
  start: string
  end: string
  startMinute: number
  endMinute: number
  state: PeakState
  label: string
}

/**
 * Time and timezone information.
 */
export interface TimeInfo {
  timestamp: Date
  iso: string
  utcTime: string
  beijingTime: string
  localTime: string
  timeZone: string
}

/**
 * Result of evaluating current peak/off-peak status.
 */
export interface PeakStatusResult {
  state: PeakState
  isPeak: boolean
  discountPercent: number
  currentWindow: ScheduleWindow
  nextWindow: ScheduleWindow
  nextTransitionTime: Date
  timeToNextChangeMs: number
  formattedCountdown: string
  scheduleType: ScheduleType
  timeInfo: TimeInfo
}

/**
 * Pricing rates for a single model (USD per 1M tokens).
 */
export interface ModelPricing {
  modelId: string
  name: string
  currency: '$'
  discountPercent: number
  peak: {
    inputCacheHit: number
    inputCacheMiss: number
    output: number
  }
  offPeak: {
    inputCacheHit: number
    inputCacheMiss: number
    output: number
  }
}

/**
 * Config options for schedule calculations.
 */
export interface PeakScheduleConfig {
  scheduleType?: ScheduleType
}
