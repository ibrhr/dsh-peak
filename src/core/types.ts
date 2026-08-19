/**
 * Schedule window representing a start and end time in UTC (HH:MM).
 */
export interface PeakWindow {
  /** Start time in "HH:MM" 24h format (UTC) */
  start: string
  /** End time in "HH:MM" 24h format (UTC) */
  end: string
  /** Description or label */
  label?: string
}

/**
 * Peak state identifier.
 */
export type PeakState = 'OFF_PEAK' | 'PEAK'

/**
 * Time and timezone information.
 */
export interface TimeInfo {
  utcTime: string
  beijingTime: string
  localTime: string
  currentDate: Date
}

/**
 * Result of evaluating current peak/off-peak status.
 */
export interface PeakStatusResult {
  state: PeakState
  isOffPeak: boolean
  isPeak: boolean
  discountPercent: number
  activeWindow?: PeakWindow
  nextTransitionTime: Date
  secondsToNextTransition: number
  formattedCountdown: string
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
  mode?: 'official_utc' | 'legacy_cst'
  customWindows?: PeakWindow[]
}
