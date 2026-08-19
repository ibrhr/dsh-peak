import React from 'react'
import type { PeakStatusResult } from '../core/types.ts'
import { DEEPSEEK_MODELS } from '../core/pricing.ts'
import { en, zh, type PeakLocaleKey } from './locales.ts'
import styles from './PeakBadge.module.css'

export interface PeakPopoverProps {
  status: PeakStatusResult
  onClose: () => void
  locale?: 'en' | 'zh'
}

export const PeakPopover: React.FC<PeakPopoverProps> = ({
  status,
  onClose,
  locale = 'en',
}) => {
  const t: PeakLocaleKey = locale === 'zh' ? zh : en
  const isOffPeak = status.state === 'OFF_PEAK'

  return (
    <div
      className={styles.popover}
      role="dialog"
      aria-label={t.statusTitle}
      onClick={(e) => e.stopPropagation()}
    >
      <div className={styles.popoverHeader}>
        <div className={styles.popoverTitle}>
          <span>{isOffPeak ? '🌙' : '⚡'}</span>
          <span>{t.statusTitle}</span>
        </div>
        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label={t.close}
        >
          ✕
        </button>
      </div>

      {/* Clocks Row */}
      <div className={styles.clocksGrid}>
        <div className={styles.clockItem}>
          <span className={styles.clockLabel}>{t.utcClock}</span>
          <span className={styles.clockValue}>{status.timeInfo.utcTime}</span>
        </div>
        <div className={styles.clockItem}>
          <span className={styles.clockLabel}>{t.beijingClock}</span>
          <span className={styles.clockValue}>{status.timeInfo.beijingTime}</span>
        </div>
        <div className={styles.clockItem}>
          <span className={styles.clockLabel}>{t.localClock}</span>
          <span className={styles.clockValue}>{status.timeInfo.localTime}</span>
        </div>
      </div>

      {/* Schedule Summary */}
      <div className={styles.scheduleSection}>
        <div className={styles.scheduleHeading}>
          <span>📅</span>
          <span>{t.officialSchedule}</span>
        </div>
        <div className={styles.scheduleRow}>
          <span>• {t.morningPeak}</span>
          <span style={{ color: '#ef4444', fontWeight: 600 }}>{t.peak}</span>
        </div>
        <div className={styles.scheduleRow}>
          <span>• {t.afternoonPeak}</span>
          <span style={{ color: '#ef4444', fontWeight: 600 }}>{t.peak}</span>
        </div>
        <div className={styles.scheduleRow}>
          <span>• {t.offPeakAllOther}</span>
          <span className={styles.discountCol}>{t.discountBadge}</span>
        </div>
      </div>

      {/* Token Rates Table */}
      <div style={{ marginTop: '8px' }}>
        <div style={{ fontSize: '11px', fontWeight: 600, opacity: 0.8 }}>
          {t.pricingTitle}
        </div>
        <table className={styles.pricingTable}>
          <thead>
            <tr>
              <th>{t.model}</th>
              <th>{t.cacheHit}</th>
              <th>{t.cacheMiss}</th>
              <th>{t.output}</th>
            </tr>
          </thead>
          <tbody>
            {Object.values(DEEPSEEK_MODELS).map((m) => (
              <tr key={m.modelId}>
                <td style={{ fontWeight: 500 }}>{m.name}</td>
                <td>
                  <span style={{ textDecoration: isOffPeak ? 'line-through' : 'none', opacity: isOffPeak ? 0.6 : 1 }}>
                    ${m.peak.inputCacheHit}
                  </span>
                  {isOffPeak && <span className={styles.discountCol}> ${m.offPeak.inputCacheHit}</span>}
                </td>
                <td>
                  <span style={{ textDecoration: isOffPeak ? 'line-through' : 'none', opacity: isOffPeak ? 0.6 : 1 }}>
                    ${m.peak.inputCacheMiss}
                  </span>
                  {isOffPeak && <span className={styles.discountCol}> ${m.offPeak.inputCacheMiss}</span>}
                </td>
                <td>
                  <span style={{ textDecoration: isOffPeak ? 'line-through' : 'none', opacity: isOffPeak ? 0.6 : 1 }}>
                    ${m.peak.output}
                  </span>
                  {isOffPeak && <span className={styles.discountCol}> ${m.offPeak.output}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Tip Box */}
      <div className={styles.tipBox}>
        <strong>💡 {t.tipHeading}</strong>
        {t.tipText}
      </div>
    </div>
  )
}
