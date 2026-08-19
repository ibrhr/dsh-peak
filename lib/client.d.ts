import React from "react";
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
//#endregion
//#region src/client/PeakBadge.d.ts
interface PeakBadgeProps {
  initialDate?: Date;
  config?: Partial<PeakScheduleConfig>;
  locale?: 'en' | 'zh';
  compact?: boolean;
  className?: string;
  style?: React.CSSProperties;
}
declare const PeakBadge: React.FC<PeakBadgeProps>;
//#endregion
//#region src/client/PeakPopover.d.ts
interface PeakPopoverProps {
  status: PeakStatusResult;
  onClose: () => void;
  locale?: 'en' | 'zh';
}
declare const PeakPopover: React.FC<PeakPopoverProps>;
//#endregion
//#region src/client/locales.d.ts
declare const en: {
  offPeak: string;
  peak: string;
  discountBadge: string;
  normalRate: string;
  nextOffPeakIn: string;
  endsIn: string;
  utcClock: string;
  beijingClock: string;
  localClock: string;
  officialSchedule: string;
  legacySchedule: string;
  morningPeak: string;
  afternoonPeak: string;
  offPeakAllOther: string;
  pricingTitle: string;
  model: string;
  cacheHit: string;
  cacheMiss: string;
  output: string;
  close: string;
  statusTitle: string;
  tipHeading: string;
  tipText: string;
};
type PeakLocaleKey = typeof en;
//#endregion
//#region src/client/index.d.ts
/** Required services declared for DSH client runtime */
declare const inject: string[];
interface MountOptions {
  locale?: 'en' | 'zh';
  config?: Partial<PeakScheduleConfig>;
  compact?: boolean;
  className?: string;
  style?: React.CSSProperties;
}
/**
 * Programmatic mounting helper for custom containers or test harnesses.
 */
declare function mountPeakBadge(container: HTMLElement, options?: MountOptions): () => void;
/**
 * Main Client Plugin apply() entry for DeepSeek Harness / Cordis client context.
 * Sets up slot injection and fallback DOM mount with strict Cordis lifecycle cleanup.
 */
declare function apply(ctx: any): void;
//#endregion
export { MountOptions, PeakBadge, type PeakBadgeProps, type PeakLocaleKey, PeakPopover, type PeakPopoverProps, apply, inject, mountPeakBadge };
//# sourceMappingURL=client.d.ts.map