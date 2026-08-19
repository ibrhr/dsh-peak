//#region src/core/types.d.ts
/**
 * Peak and off-peak status state enumeration.
 */
type PeakState = 'PEAK' | 'OFF_PEAK';
/**
 * Supported schedule configurations for DeepSeek API pricing.
 * - `official_utc`: Official UTC schedule (Peak: 01:00-04:00 & 06:00-10:00 UTC)
 * - `legacy_beijing`: Classic UTC+8 schedule (Off-peak: 00:30-08:30 Beijing time)
 */
type ScheduleType = 'official_utc' | 'legacy_beijing';
/**
 * A time window representation in UTC minutes from start of day (0 to 1440).
 */
interface ScheduleWindow {
  /** Start time in UTC "HH:mm" */
  start: string;
  /** End time in UTC "HH:mm" */
  end: string;
  /** Start time in minutes from UTC midnight (0..1439) */
  startMinute: number;
  /** End time in minutes from UTC midnight (1..1440) */
  endMinute: number;
  /** Whether this window represents a Peak or Off-Peak window */
  state: PeakState;
  /** Description or label */
  label?: string;
}
/**
 * Clock timestamps across UTC, Beijing (UTC+8), and Local system time.
 */
interface TimeInfo {
  /** Current date object */
  timestamp: Date;
  /** ISO string */
  iso: string;
  /** UTC 24h formatted time string "HH:mm:ss" */
  utcTime: string;
  /** Beijing (UTC+8) formatted time string "HH:mm:ss" */
  beijingTime: string;
  /** Local system / browser formatted time string */
  localTime: string;
  /** Local timezone name or offset */
  timeZone: string;
}
/**
 * Comprehensive status evaluation result.
 */
interface PeakStatusResult {
  /** Current peak state: 'PEAK' or 'OFF_PEAK' */
  state: PeakState;
  /** True if currently in a Peak pricing window */
  isPeak: boolean;
  /** Discount percentage during current window (e.g. 50 during OFF_PEAK, 0 during PEAK) */
  discountPercent: number;
  /** Current active window */
  currentWindow: ScheduleWindow;
  /** Next upcoming window transition */
  nextWindow: ScheduleWindow;
  /** Date timestamp of next transition */
  nextTransitionTime: Date;
  /** Milliseconds remaining until next transition */
  timeToNextChangeMs: number;
  /** Formatted human-readable countdown to next transition (e.g. "1h 24m") */
  formattedCountdown: string;
  /** Schedule type used */
  scheduleType: ScheduleType;
  /** Time information */
  timeInfo: TimeInfo;
}
/**
 * Token pricing details per 1 Million (1M) tokens in USD.
 */
interface ModelPricing {
  modelId: string;
  name: string;
  currency: string;
  peak: {
    inputCacheHit: number;
    inputCacheMiss: number;
    output: number;
  };
  offPeak: {
    inputCacheHit: number;
    inputCacheMiss: number;
    output: number;
  };
  discountPercent: number;
}
/**
 * Configuration options for the Peak schedule evaluator.
 */
interface PeakScheduleConfig {
  scheduleType: ScheduleType;
  /** Optional custom peak windows in UTC HH:mm */
  customWindows?: Array<{
    start: string;
    end: string;
  }>;
}
interface CostCalculationParams {
  inputTokens: number;
  outputTokens: number;
  cacheHitRatio?: number;
  modelId?: string;
}
interface CostEstimateResult {
  modelName: string;
  peakCostUSD: number;
  offPeakCostUSD: number;
  savingsUSD: number;
  savingsPercent: number;
}
//#endregion
//#region src/core/schedule.d.ts
/**
 * Standard DeepSeek Official API Windows (UTC).
 * - Peak 1: 01:00 - 04:00 UTC (09:00 - 12:00 Beijing UTC+8)
 * - Peak 2: 06:00 - 10:00 UTC (14:00 - 18:00 Beijing UTC+8)
 * - Off-Peak: 00:00 - 01:00, 04:00 - 06:00, 10:00 - 24:00 UTC (50% token discount)
 */
declare const OFFICIAL_UTC_WINDOWS: ScheduleWindow[];
/**
 * Legacy DeepSeek API Windows (Beijing Time UTC+8: 00:30-08:30 Off-Peak).
 * Converted to UTC:
 * - 00:00 - 00:30 UTC: Off-Peak (08:00 - 08:30 CST)
 * - 00:30 - 16:30 UTC: Peak (08:30 - 00:30 CST)
 * - 16:30 - 24:00 UTC: Off-Peak (00:30 - 08:00 CST)
 */
declare const LEGACY_BEIJING_WINDOWS: ScheduleWindow[];
/**
 * Get the windows list for a given schedule type.
 */
declare function getScheduleWindows(scheduleType?: ScheduleType): ScheduleWindow[];
/**
 * Get synchronized time information across UTC, Beijing, and Local timezones.
 */
declare function getTimeInfo(date?: Date): TimeInfo;
/**
 * Core function: evaluates the Peak / Off-Peak status at any given timestamp.
 */
declare function getPeakStatus(targetDate?: Date, config?: Partial<PeakScheduleConfig>, locale?: 'en' | 'zh'): PeakStatusResult;
/**
 * Convenient shorthand boolean check.
 */
declare function isPeak(targetDate?: Date, config?: Partial<PeakScheduleConfig>): boolean;
//#endregion
//#region src/core/pricing.d.ts
/**
 * Official DeepSeek API Model Rate Cards (USD per 1M tokens).
 * Off-peak hours receive a 50% discount across cache hit, cache miss, and output tokens.
 */
declare const DEEPSEEK_MODELS: Record<string, ModelPricing>;
/**
 * Calculate token costs and estimated savings between Peak and Off-Peak.
 */
declare function calculateTokenSavings(params: CostCalculationParams): CostEstimateResult;
//#endregion
//#region src/core/format.d.ts
/**
 * Formatting utilities for time, countdowns, and token pricing.
 */
/**
 * Format milliseconds remaining into a concise human-readable countdown.
 * Examples:
 * - "2h 15m" (en) / "2小时15分" (zh)
 * - "45m 20s" (en) / "45分20秒" (zh)
 * - "< 1m" (en) / "< 1分钟" (zh)
 */
declare function formatCountdown(ms: number, locale?: 'en' | 'zh', includeSeconds?: boolean): string;
/**
 * Format a Date object to "HH:mm:ss" in specified timeZone.
 */
declare function formatClockTime(date: Date, timeZone?: string, includeSeconds?: boolean): string;
/**
 * Format USD price per 1M tokens.
 * Example: 0.014 -> "$0.014 / 1M"
 */
declare function formatPrice(amount: number, currency?: string): string;
//#endregion
//#region src/index.d.ts
interface PeakService {
  /** Check if currently in peak hours */
  isPeak(targetDate?: Date, config?: Partial<PeakScheduleConfig>): boolean;
  /** Get full status evaluation */
  getStatus(targetDate?: Date, config?: Partial<PeakScheduleConfig>, locale?: 'en' | 'zh'): PeakStatusResult;
  /** Calculate estimated savings */
  calculateSavings(params: CostCalculationParams): CostEstimateResult;
  /** Get all windows */
  getWindows(scheduleType?: ScheduleType): ScheduleWindow[];
  /** Get current clock times across UTC, Beijing, and Local */
  getTimeInfo(date?: Date): TimeInfo;
  /** Model rates */
  models: typeof DEEPSEEK_MODELS;
}
/**
 * Creates an instance of the PeakService API.
 */
declare function createPeakService(): PeakService;
/**
 * Cordis Host Plugin Lifecycle:
 * Registers the 'peak' service into the host context when loaded.
 */
declare function apply(ctx: any): void;
//#endregion
export { type CostCalculationParams, type CostEstimateResult, DEEPSEEK_MODELS, LEGACY_BEIJING_WINDOWS, OFFICIAL_UTC_WINDOWS, type PeakScheduleConfig, PeakService, type PeakState, type PeakStatusResult, type ScheduleType, type ScheduleWindow, type TimeInfo, apply, calculateTokenSavings, createPeakService, formatClockTime, formatCountdown, formatPrice, getPeakStatus, getScheduleWindows, getTimeInfo, isPeak };