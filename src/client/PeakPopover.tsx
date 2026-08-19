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
          {isOffPeak ? (
            <span className={styles.scheduleTagOffPeak}>50% OFF</span>
          ) : (
            <span className={styles.scheduleTagPeak}>PEAK</span>
          )}
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
          <span>{t.morningPeak}</span>
          <span className={styles.scheduleTagPeak}>{t.peak}</span>
        </div>
        <div className={styles.scheduleRow}>
          <span>{t.afternoonPeak}</span>
          <span className={styles.scheduleTagPeak}>{t.peak}</span>
        </div>
        <div className={styles.scheduleRow}>
          <span>{t.offPeakAllOther}</span>
          <span className={styles.scheduleTagOffPeak}>{t.discountBadge}</span>
        </div>
      </div>

      {/* Token Rates Table */}
      <div className={styles.pricingTableContainer}>
        <div style={{ fontSize: '11px', fontWeight: 700, opacity: 0.9, letterSpacing: '0.2px' }}>
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
                <td className={styles.modelName}>{m.name}</td>
                <td>
                  <span className={isOffPeak ? styles.peakPrice : ''}>
                    ${m.peak.inputCacheHit}
                  </span>
                  {isOffPeak && (
                    <span className={styles.offPeakPrice}>
                      ${m.offPeak.inputCacheHit}
                    </span>
                  )}
                </td>
                <td>
                  <span className={isOffPeak ? styles.peakPrice : ''}>
                    ${m.peak.inputCacheMiss}
                  </span>
                  {isOffPeak && (
                    <span className={styles.offPeakPrice}>
                      ${m.offPeak.inputCacheMiss}
                    </span>
                  )}
                </td>
                <td>
                  <span className={isOffPeak ? styles.peakPrice : ''}>
                    ${m.peak.output}
                  </span>
                  {isOffPeak && (
                    <span className={styles.offPeakPrice}>
                      ${m.offPeak.output}
                    </span>
                  )}
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
