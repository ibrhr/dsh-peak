import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import type { PeakStatusResult } from '../core/types.ts'
import { DEEPSEEK_MODELS } from '../core/pricing.ts'
import styles from './PeakBadge.module.css'

export interface PeakPopoverProps {
  status: PeakStatusResult
  anchorRect: DOMRect | null
  onClose: () => void
  locale?: 'en' | 'zh'
}

export const PeakPopover: React.FC<PeakPopoverProps> = ({
  status,
  anchorRect,
  onClose,
}) => {
  const popoverRef = useRef<HTMLDivElement>(null)
  const isOffPeak = status.state === 'OFF_PEAK'

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  // Close on click outside popover
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    const timer = setTimeout(() => {
      document.addEventListener('click', handleClickOutside)
    }, 10)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('click', handleClickOutside)
    }
  }, [onClose])

  // Positioning
  let popoverStyle: React.CSSProperties = {
    top: '48px',
    left: '20px',
  }

  if (anchorRect && typeof window !== 'undefined') {
    const popoverWidth = 300
    let top = anchorRect.bottom + 6
    let left = anchorRect.left

    if (left + popoverWidth > window.innerWidth - 12) {
      left = window.innerWidth - popoverWidth - 12
    }
    if (left < 12) {
      left = 12
    }

    popoverStyle = {
      top: `${top}px`,
      left: `${left}px`,
    }
  }

  const content = (
    <div
      ref={popoverRef}
      className={styles.popover}
      style={popoverStyle}
      role="dialog"
      aria-label="DeepSeek Pricing"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className={styles.popoverHeader}>
        <span className={styles.popoverTitle}>DeepSeek Pricing</span>
        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
      </div>

      {/* Status Summary */}
      <div className={styles.statusLine}>
        <span className={styles.statusLabel}>
          <span className={`${styles.dot} ${isOffPeak ? styles.offPeak : styles.peak}`} />
          {isOffPeak ? '50% discount active' : 'Peak hours'}
        </span>
        <span className={styles.statusDuration}>
          {isOffPeak ? `Ends in ${status.formattedCountdown}` : `Off-peak in ${status.formattedCountdown}`}
        </span>
      </div>

      {/* Peak Schedule */}
      <div className={styles.scheduleBlock}>
        <div className={styles.sectionLabel}>Peak Windows (UTC)</div>
        <div className={styles.scheduleList}>
          <div className={styles.scheduleItem}>
            <span>01:00 – 04:00</span>
            <span>09:00 – 12:00 CST</span>
          </div>
          <div className={styles.scheduleItem}>
            <span>06:00 – 10:00</span>
            <span>14:00 – 18:00 CST</span>
          </div>
        </div>
      </div>

      {/* Model Rates */}
      <div className={styles.ratesBlock}>
        <div className={styles.sectionLabel}>
          Rate per 1M tokens {isOffPeak ? '(50% off)' : '(standard)'}
        </div>
        <table className={styles.ratesTable}>
          <thead>
            <tr>
              <th>Model</th>
              <th>Hit</th>
              <th>Miss</th>
              <th>Out</th>
            </tr>
          </thead>
          <tbody>
            {Object.values(DEEPSEEK_MODELS).map((m) => {
              const rates = isOffPeak ? m.offPeak : m.peak
              return (
                <tr key={m.modelId}>
                  <td>{m.name.replace('DeepSeek-', '')}</td>
                  <td className={isOffPeak ? styles.discountedRate : ''}>${rates.inputCacheHit}</td>
                  <td className={isOffPeak ? styles.discountedRate : ''}>${rates.inputCacheMiss}</td>
                  <td className={isOffPeak ? styles.discountedRate : ''}>${rates.output}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Quiet Clocks Footer */}
      <div className={styles.clocksFooter}>
        <span>UTC {status.timeInfo.utcTime.slice(0, 5)}</span>
        <span>CST {status.timeInfo.beijingTime.slice(0, 5)}</span>
        <span>Local {status.timeInfo.localTime.slice(0, 5)}</span>
      </div>
    </div>
  )

  if (typeof document !== 'undefined' && document.body) {
    return createPortal(content, document.body)
  }

  return content
}
