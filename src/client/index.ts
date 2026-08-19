/**
 * dsh-peak client plugin entry for DeepSeek Harness (Browser half).
 *
 * Provides real-time visual indicator of DeepSeek API peak vs off-peak status,
 * transition countdowns, multi-timezone clocks, and token rate cards.
 */

import React from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { PeakBadge, type PeakBadgeProps } from './PeakBadge.tsx'
import { PeakPopover, type PeakPopoverProps } from './PeakPopover.tsx'
import { en, zh, type PeakLocaleKey } from './locales.ts'
import type { PeakScheduleConfig, PeakStatusResult } from '../core/types.ts'

export { PeakBadge, PeakPopover }
export type { PeakBadgeProps, PeakPopoverProps, PeakLocaleKey }

/** Dictionary namespace owned by this plugin */
const NS = 'peak'

/** Required services declared for DSH client runtime */
export const inject = ['slots', 'locale']

export interface MountOptions {
  locale?: 'en' | 'zh'
  config?: Partial<PeakScheduleConfig>
  compact?: boolean
  className?: string
  style?: React.CSSProperties
}

/**
 * Programmatic mounting helper for custom containers or test harnesses.
 */
export function mountPeakBadge(
  container: HTMLElement,
  options: MountOptions = {}
): () => void {
  const root: Root = createRoot(container)
  root.render(React.createElement(PeakBadge, options))

  return () => {
    root.unmount()
  }
}

/**
 * Main Client Plugin apply() entry for DeepSeek Harness / Cordis client context.
 * Sets up slot injection and fallback DOM mount with strict Cordis lifecycle cleanup.
 */
export function apply(ctx: any): void {
  const disposers: Array<() => void> = []

  // 1. Register i18n dictionaries if ctx.locale service is available
  if (ctx && ctx.locale && typeof ctx.locale.register === 'function') {
    if (typeof ctx.effect === 'function') {
      ctx.effect(() => {
        ctx.locale.register(NS, { zh, en })
      }, 'dsh-peak: locale registration')
    } else {
      ctx.locale.register(NS, { zh, en })
    }
  }

  // 2. Inject into DSH UI slots if ctx.slots service is available
  if (ctx && ctx.slots && typeof ctx.slots.inject === 'function') {
    try {
      ctx.slots.inject('conversation.chat.turnStatus', () =>
        ctx.slots.register(
          {
            name: 'conversation.chat.turnStatus',
            locale: NS,
          },
          PeakBadge
        )
      )
    } catch {
      // Graceful fallback if slot injection differs in older harness versions
    }
  }

  // 3. Mount overlay to DOM if running in a browser environment
  if (typeof document !== 'undefined' && typeof window !== 'undefined') {
    const MOUNT_ID = 'dsh-peak-indicator-root'

    // Remove any existing instance to guarantee single-instance idempotency
    const existing = document.getElementById(MOUNT_ID)
    if (existing) {
      existing.remove()
    }

    const mountContainer = document.createElement('div')
    mountContainer.id = MOUNT_ID
    mountContainer.dataset.dshPlugin = 'dsh-peak'
    mountContainer.style.position = 'fixed'
    mountContainer.style.top = '12px'
    mountContainer.style.right = '70px'
    mountContainer.style.zIndex = '9998'

    document.body.appendChild(mountContainer)

    const unmount = mountPeakBadge(mountContainer, {
      locale:
        typeof navigator !== 'undefined' &&
        navigator.language &&
        navigator.language.startsWith('zh')
          ? 'zh'
          : 'en',
    })

    disposers.push(() => {
      unmount()
      if (mountContainer.parentNode) {
        mountContainer.parentNode.removeChild(mountContainer)
      }
    })
  }

  // 4. Register Cordis effect disposal
  if (ctx && typeof ctx.effect === 'function') {
    ctx.effect(() => () => {
      for (const dispose of disposers) {
        try {
          dispose()
        } catch {
          // ignore cleanup errors
        }
      }
    })
  }
}
