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
 * Locate best placement container in DSH UI (header actions or navbar).
 */
function findHeaderMountTarget(): { parent: Element; insertBeforeNode: Node | null } | null {
  const header = document.querySelector('header')
  if (!header) return null

  // Check for trailing header action bar / session log container
  const actionContainer = header.querySelector(
    ":is([class*='action'], [class*='trailing'], [class*='toolbar'], [data-slot*='header'], nav)"
  )
  if (actionContainer) {
    return { parent: actionContainer, insertBeforeNode: actionContainer.firstChild }
  }

  // Fallback to inserting before the last child of header
  if (header.lastElementChild) {
    return { parent: header, insertBeforeNode: header.lastElementChild }
  }

  return { parent: header, insertBeforeNode: null }
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
      // Graceful fallback if slot injection differs
    }
  }

  // 3. Mount overlay to DOM if running in a browser environment
  if (typeof document !== 'undefined' && typeof window !== 'undefined') {
    const MOUNT_ID = 'dsh-peak-indicator-root'

    // Clean up any stale existing instance
    const existing = document.getElementById(MOUNT_ID)
    if (existing) {
      existing.remove()
    }

    const mountContainer = document.createElement('div')
    mountContainer.id = MOUNT_ID
    mountContainer.dataset.dshPlugin = 'dsh-peak'

    const target = findHeaderMountTarget()
    if (target) {
      mountContainer.style.display = 'inline-flex'
      mountContainer.style.alignItems = 'center'
      mountContainer.style.marginRight = '12px'
      mountContainer.style.marginLeft = '8px'
      target.parent.insertBefore(mountContainer, target.insertBeforeNode)
    } else {
      // Non-overlapping fallback position (safely to the left of Session Log)
      mountContainer.style.position = 'fixed'
      mountContainer.style.top = '10px'
      mountContainer.style.right = '175px'
      mountContainer.style.zIndex = '9998'
      document.body.appendChild(mountContainer)
    }

    const unmount = mountPeakBadge(mountContainer, {
      locale:
        typeof navigator !== 'undefined' &&
        navigator.language &&
        navigator.language.startsWith('zh')
          ? 'zh'
          : 'en',
    })

    // Observer to re-position when DSH re-renders the header dynamically
    let observer: MutationObserver | null = null
    if (!target && typeof MutationObserver !== 'undefined') {
      observer = new MutationObserver(() => {
        const newTarget = findHeaderMountTarget()
        if (newTarget && mountContainer.parentNode !== newTarget.parent) {
          mountContainer.style.position = ''
          mountContainer.style.top = ''
          mountContainer.style.right = ''
          mountContainer.style.zIndex = ''
          mountContainer.style.display = 'inline-flex'
          mountContainer.style.alignItems = 'center'
          mountContainer.style.marginRight = '12px'
          mountContainer.style.marginLeft = '8px'
          newTarget.parent.insertBefore(mountContainer, newTarget.insertBeforeNode)
        }
      })
      observer.observe(document.body, { childList: true, subtree: true })
    }

    disposers.push(() => {
      if (observer) {
        observer.disconnect()
      }
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
