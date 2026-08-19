import { formatClockTime, formatCountdown } from './format.ts'
import type {
  PeakScheduleConfig,
  PeakState,
  PeakStatusResult,
  ScheduleType,
  ScheduleWindow,
  TimeInfo,
} from './types.ts'

/**
 * Standard DeepSeek Official API Windows (UTC).
 * - Peak 1: 01:00 - 04:00 UTC (09:00 - 12:00 Beijing UTC+8)
 * - Peak 2: 06:00 - 10:00 UTC (14:00 - 18:00 Beijing UTC+8)
 * - Off-Peak: 00:00 - 01:00, 04:00 - 06:00, 10:00 - 24:00 UTC (50% token discount)
 */
export const OFFICIAL_UTC_WINDOWS: ScheduleWindow[] = [
  {
    start: '00:00',
    end: '01:00',
    startMinute: 0,
    endMinute: 60,
    state: 'OFF_PEAK',
    label: 'Early Morning Off-Peak (50% OFF)',
  },
  {
    start: '01:00',
    end: '04:00',
    startMinute: 60,
    endMinute: 240,
    state: 'PEAK',
    label: 'Morning Peak Window (09:00–12:00 CST)',
  },
  {
    start: '04:00',
    end: '06:00',
    startMinute: 240,
    endMinute: 360,
    state: 'OFF_PEAK',
    label: 'Midday Off-Peak (50% OFF)',
  },
  {
    start: '06:00',
    end: '10:00',
    startMinute: 360,
    endMinute: 600,
    state: 'PEAK',
    label: 'Afternoon Peak Window (14:00–18:00 CST)',
  },
  {
    start: '10:00',
    end: '24:00',
    startMinute: 600,
    endMinute: 1440,
    state: 'OFF_PEAK',
    label: 'Evening & Night Off-Peak (50% OFF)',
  },
]

/**
 * Legacy DeepSeek API Windows (Beijing Time UTC+8: 00:30-08:30 Off-Peak).
 * Converted to UTC:
 * - 00:00 - 00:30 UTC: Off-Peak (08:00 - 08:30 CST)
 * - 00:30 - 16:30 UTC: Peak (08:30 - 00:30 CST)
 * - 16:30 - 24:00 UTC: Off-Peak (00:30 - 08:00 CST)
 */
export const LEGACY_BEIJING_WINDOWS: ScheduleWindow[] = [
  {
    start: '00:00',
    end: '00:30',
    startMinute: 0,
    endMinute: 30,
    state: 'OFF_PEAK',
    label: 'Legacy Early Morning Off-Peak',
  },
  {
    start: '00:30',
    end: '16:30',
    startMinute: 30,
    endMinute: 990,
    state: 'PEAK',
    label: 'Legacy Daytime Peak (08:30–00:30 CST)',
  },
  {
    start: '16:30',
    end: '24:00',
    startMinute: 990,
    endMinute: 1440,
    state: 'OFF_PEAK',
    label: 'Legacy Overnight Off-Peak (50% OFF)',
  },
]

/**
 * Get the windows list for a given schedule type.
 */
export function getScheduleWindows(scheduleType: ScheduleType = 'official_utc'): ScheduleWindow[] {
  return scheduleType === 'legacy_beijing' ? LEGACY_BEIJING_WINDOWS : OFFICIAL_UTC_WINDOWS
}

/**
 * Get synchronized time information across UTC, Beijing, and Local timezones.
 */
export function getTimeInfo(date: Date = new Date()): TimeInfo {
  let localTz = 'UTC'
  try {
    localTz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  } catch {
    localTz = 'UTC'
  }

  return {
    timestamp: date,
    iso: date.toISOString(),
    utcTime: formatClockTime(date, 'UTC', true),
    beijingTime: formatClockTime(date, 'Asia/Shanghai', true),
    localTime: formatClockTime(date, localTz, true),
    timeZone: localTz,
  }
}

/**
 * Core function: evaluates the Peak / Off-Peak status at any given timestamp.
 */
export function getPeakStatus(
  targetDate: Date = new Date(),
  config: Partial<PeakScheduleConfig> = {},
  locale: 'en' | 'zh' = 'en'
): PeakStatusResult {
  const scheduleType: ScheduleType = config.scheduleType || 'official_utc'
  const windows = getScheduleWindows(scheduleType)

  const utcHours = targetDate.getUTCHours()
  const utcMinutes = targetDate.getUTCMinutes()
  const utcSeconds = targetDate.getUTCSeconds()
  const utcMs = targetDate.getUTCMilliseconds()

  // Current minute progress from UTC midnight as a continuous float
  const currentMinuteFloat = utcHours * 60 + utcMinutes + (utcSeconds + utcMs / 1000) / 60

  // Find the currently active window
  let currentIndex = windows.findIndex(
    (w) => currentMinuteFloat >= w.startMinute && currentMinuteFloat < w.endMinute
  )

  if (currentIndex === -1) {
    currentIndex = 0
  }

  const currentWindow = windows[currentIndex]
  const isPeak = currentWindow.state === 'PEAK'
  const state: PeakState = currentWindow.state
  const discountPercent = state === 'OFF_PEAK' ? 50 : 0

  // Find next window
  const nextIndex = (currentIndex + 1) % windows.length
  const nextWindow = windows[nextIndex]

  // Calculate remaining time until the end of current window
  const endMinute = currentWindow.endMinute
  const minutesRemaining = endMinute - currentMinuteFloat
  const timeToNextChangeMs = Math.max(0, Math.floor(minutesRemaining * 60 * 1000))

  // Exact next transition timestamp
  const nextTransitionTime = new Date(targetDate.getTime() + timeToNextChangeMs)

  const formattedCountdown = formatCountdown(timeToNextChangeMs, locale)

  return {
    state,
    isPeak,
    discountPercent,
    currentWindow,
    nextWindow,
    nextTransitionTime,
    timeToNextChangeMs,
    formattedCountdown,
    scheduleType,
    timeInfo: getTimeInfo(targetDate),
  }
}

/**
 * Convenient shorthand boolean check.
 */
export function isPeak(
  targetDate: Date = new Date(),
  config: Partial<PeakScheduleConfig> = {}
): boolean {
  return getPeakStatus(targetDate, config).isPeak
}
