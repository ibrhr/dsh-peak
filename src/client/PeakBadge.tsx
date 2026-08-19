import React, { useState, useEffect, useRef } from 'react'
import { getPeakStatus } from '../core/schedule.ts'
import type { PeakScheduleConfig, PeakStatusResult } from '../core/types.ts'
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
  className = '',
  style,
}) => {
  const [status, setStatus] = useState<PeakStatusResult>(() =>
    getPeakStatus(initialDate || new Date(), config, locale)
  )
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Update status every second
  useEffect(() => {
    const update = () => {
      setStatus(getPeakStatus(new Date(), config, locale))
    }

    const timer = setInterval(update, 1000)
    return () => clearInterval(timer)
  }, [config, locale])

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isPopoverOpen && buttonRef.current) {
      setAnchorRect(buttonRef.current.getBoundingClientRect())
      setIsPopoverOpen(true)
    } else {
      setIsPopoverOpen(false)
    }
  }

  const isOffPeak = status.state === 'OFF_PEAK'

  return (
    <div
      className={`${styles.badgeContainer} ${className}`}
      style={style}
      data-dsh-peak-state={status.state.toLowerCase()}
    >
      <button
        ref={buttonRef}
        type="button"
        className={`${styles.pill} ${isOffPeak ? styles.offPeak : styles.peak}`}
        onClick={handleToggle}
        title={isOffPeak ? `Off-peak (50% off) · Ends in ${status.formattedCountdown}` : `Peak hours · Off-peak in ${status.formattedCountdown}`}
        aria-expanded={isPopoverOpen}
        aria-haspopup="dialog"
      >
        <span className={styles.dot} />
        <span>{isOffPeak ? 'Off-peak' : 'Peak'}</span>
        <span style={{ opacity: 0.35 }}>·</span>
        <span className={styles.countdown}>{status.formattedCountdown}</span>
      </button>

      {isPopoverOpen && (
        <PeakPopover
          status={status}
          anchorRect={anchorRect}
          locale={locale}
          onClose={() => setIsPopoverOpen(false)}
        />
      )}
    </div>
  )
}
