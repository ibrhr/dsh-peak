import React, { useState, useEffect, useRef } from 'react'
import { getPeakStatus } from '../core/schedule.ts'
import type { PeakScheduleConfig, PeakStatusResult } from '../core/types.ts'
import { en, zh, type PeakLocaleKey } from './locales.ts'
import { PeakPopover } from './PeakPopover.tsx'
import styles from './PeakBadge.module.css'

export interface PeakBadgeProps {
  initialDate?: Date
  config?: Partial<PeakScheduleConfig>
  locale?: 'en' | 'zh'
  compact?: boolean
  className?: string
  style?: React.CSSProperties
}

export const PeakBadge: React.FC<PeakBadgeProps> = ({
  initialDate,
  config,
  locale = 'en',
  compact = false,
  className = '',
  style,
}) => {
  const [status, setStatus] = useState<PeakStatusResult>(() =>
    getPeakStatus(initialDate || new Date(), config, locale)
  )
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Update status every second
  useEffect(() => {
    const update = () => {
      setStatus(getPeakStatus(new Date(), config, locale))
    }

    const timer = setInterval(update, 1000)
    return () => clearInterval(timer)
  }, [config, locale])

  // Close popover when clicking outside
  useEffect(() => {
    if (!isPopoverOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsPopoverOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isPopoverOpen])

  const t: PeakLocaleKey = locale === 'zh' ? zh : en
  const isOffPeak = status.state === 'OFF_PEAK'

  return (
    <div
      ref={containerRef}
      className={`${styles.badgeContainer} ${className}`}
      style={style}
      data-dsh-peak-state={status.state.toLowerCase()}
    >
      <button
        type="button"
        className={`${styles.pill} ${isOffPeak ? styles.offPeak : styles.peak}`}
        onClick={() => setIsPopoverOpen((prev) => !prev)}
        title={`${isOffPeak ? t.offPeak : t.peak} - ${isOffPeak ? t.endsIn : t.nextOffPeakIn} ${status.formattedCountdown}`}
        aria-expanded={isPopoverOpen}
      >
        <span className={styles.dot} />
        <span>{isOffPeak ? t.offPeak : t.peak}</span>

        {isOffPeak && !compact && (
          <span className={styles.discountTag}>{t.discountBadge}</span>
        )}

        <span className={styles.countdownText}>
          {isOffPeak ? t.endsIn : t.nextOffPeakIn} {status.formattedCountdown}
        </span>
      </button>

      {isPopoverOpen && (
        <PeakPopover
          status={status}
          locale={locale}
          onClose={() => setIsPopoverOpen(false)}
        />
      )}
    </div>
  )
}
