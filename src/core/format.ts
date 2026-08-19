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
export function formatCountdown(
  ms: number,
  locale: 'en' | 'zh' = 'en',
  includeSeconds = false
): string {
  if (ms <= 0) {
    return locale === 'zh' ? '即将切换' : 'Now'
  }

  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  if (hours > 0) {
    if (includeSeconds) {
      return locale === 'zh'
        ? `${hours}小时${minutes}分${seconds}秒`
        : `${hours}h ${minutes}m ${seconds}s`
    }
    return locale === 'zh'
      ? `${hours}小时${minutes}分`
      : `${hours}h ${minutes}m`
  }

  if (minutes > 0) {
    if (includeSeconds) {
      return locale === 'zh'
        ? `${minutes}分${seconds}秒`
        : `${minutes}m ${seconds}s`
    }
    return locale === 'zh' ? `${minutes}分钟` : `${minutes}m`
  }

  if (includeSeconds && seconds > 0) {
    return locale === 'zh' ? `${seconds}秒` : `${seconds}s`
  }

  return locale === 'zh' ? '< 1分钟' : '< 1m'
}

/**
 * Format a Date object to "HH:mm:ss" in specified timeZone.
 */
export function formatClockTime(
  date: Date,
  timeZone?: string,
  includeSeconds = true
): string {
  try {
    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      second: includeSeconds ? '2-digit' : undefined,
      hour12: false,
      timeZone,
    }
    return new Intl.DateTimeFormat('en-GB', options).format(date)
  } catch {
    // Fallback if timezone not recognized
    const h = String(date.getUTCHours()).padStart(2, '0')
    const m = String(date.getUTCMinutes()).padStart(2, '0')
    const s = String(date.getUTCSeconds()).padStart(2, '0')
    return includeSeconds ? `${h}:${m}:${s}` : `${h}:${m}`
  }
}

/**
 * Format USD price per 1M tokens.
 * Example: 0.014 -> "$0.014 / 1M"
 */
export function formatPrice(amount: number, currency = '$'): string {
  return `${currency}${amount.toFixed(amount < 0.1 ? 3 : 2)}`
}
