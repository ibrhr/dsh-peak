/**
 * Peak and off-peak status state enumeration.
 */
export type PeakState = 'PEAK' | 'OFF_PEAK'

/**
 * Supported schedule configurations for DeepSeek API pricing.
 * - `official_utc`: Official UTC schedule (Peak: 01:00-04:00 & 06:00-10:00 UTC)
 * - `legacy_beijing`: Classic UTC+8 schedule (Off-peak: 00:30-08:30 Beijing time)
 */
export type ScheduleType = 'official_utc' | 'legacy_beijing'

/**
 * A time window representation in UTC minutes from start of day (0 to 1440).
 */
export interface ScheduleWindow {
  /** Start time in UTC "HH:mm" */
  start: string
  /** End time in UTC "HH:mm" */
  end: string
  /** Start time in minutes from UTC midnight (0..1439) */
  startMinute: number
  /** End time in minutes from UTC midnight (1..1440) */
  endMinute: number
  /** Whether this window represents a Peak or Off-Peak window */
  state: PeakState
  /** Description or label */
  label?: string
}

/**
 * Clock timestamps across UTC, Beijing (UTC+8), and Local system time.
 */
export interface TimeInfo {
  /** Current date object */
  timestamp: Date
  /** ISO string */
  iso: string
  /** UTC 24h formatted time string "HH:mm:ss" */
  utcTime: string
  /** Beijing (UTC+8) formatted time string "HH:mm:ss" */
  beijingTime: string
  /** Local system / browser formatted time string */
  localTime: string
  /** Local timezone name or offset */
  timeZone: string
}

/**
 * Comprehensive status evaluation result.
 */
export interface PeakStatusResult {
  /** Current peak state: 'PEAK' or 'OFF_PEAK' */
  state: PeakState
  /** True if currently in a Peak pricing window */
  isPeak: boolean
  /** Discount percentage during current window (e.g. 50 during OFF_PEAK, 0 during PEAK) */
  discountPercent: number
  /** Current active window */
  currentWindow: ScheduleWindow
  /** Next upcoming window transition */
  nextWindow: ScheduleWindow
  /** Date timestamp of next transition */
  nextTransitionTime: Date
  /** Milliseconds remaining until next transition */
  timeToNextChangeMs: number
  /** Formatted human-readable countdown to next transition (e.g. "1h 24m") */
  formattedCountdown: string
  /** Schedule type used */
  scheduleType: ScheduleType
  /** Time information */
  timeInfo: TimeInfo
}

/**
 * Token pricing details per 1 Million (1M) tokens in USD.
 */
export interface ModelPricing {
  modelId: string
  name: string
  currency: string
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
  discountPercent: number
}

/**
 * Configuration options for the Peak schedule evaluator.
 */
export interface PeakScheduleConfig {
  scheduleType: ScheduleType
  /** Optional custom peak windows in UTC HH:mm */
  customWindows?: Array<{ start: string; end: string }>
}

export interface CostCalculationParams {
  inputTokens: number
  outputTokens: number
  cacheHitRatio?: number // 0.0 to 1.0 (default: 0.5)
  modelId?: string
}

export interface CostEstimateResult {
  modelName: string
  peakCostUSD: number
  offPeakCostUSD: number
  savingsUSD: number
  savingsPercent: number
}
