/**
 * dsh-peak client plugin entry for DeepSeek Harness (Browser half).
 *
 * Provides a minimal, lowkey status indicator for DeepSeek API peak vs off-peak hours.
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
 * Programmatic mounting helper.
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
 * Locate the exact element representing the session mode / title in the header row.
 */
function findHeaderMountTarget(): { parent: Element; insertBeforeNode: Node | null } | null {
  // 1. Search for element containing "mode" text within header
  const headerElements = document.querySelectorAll('header *')
  for (const el of headerElements) {
    if (
      el.children.length === 0 &&
      el.textContent &&
      el.textContent.toLowerCase().includes('mode')
    ) {
      const modeContainer = el.closest('button, [class*="mode"], [class*="badge"], [data-slot*="mode"], div') || el
      if (modeContainer.parentElement) {
        return { parent: modeContainer.parentElement, insertBeforeNode: modeContainer.nextSibling }
      }
    }
  }

  // 2. Search for explicit mode selectors
  const modeSelector = document.querySelector('header :is([class*="mode"], [data-slot*="mode"], button:has([class*="mode"]))')
  if (modeSelector && modeSelector.parentElement) {
    return { parent: modeSelector.parentElement, insertBeforeNode: modeSelector.nextSibling }
  }

  // 3. Search for title row container
  const titleEl = document.querySelector('header :is([class*="title"], [class*="session"], h1, h2, [data-slot*="title"])')
  if (titleEl && titleEl.parentElement) {
    return { parent: titleEl.parentElement, insertBeforeNode: titleEl.nextSibling }
  }

  // 4. Header inner flex row
  const header = document.querySelector('header')
  if (header) {
    const row = header.querySelector(':is([class*="row"], [class*="bar"], [class*="content"], div)') || header
    return { parent: row, insertBeforeNode: null }
  }

  return null
}

/**
 * Main Client Plugin apply() entry for DeepSeek Harness / Cordis client context.
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
      // Graceful fallback
    }
  }

  // 3. Mount indicator to DOM inline in header
  if (typeof document !== 'undefined' && typeof window !== 'undefined') {
    const MOUNT_ID = 'dsh-peak-indicator-root'

    const existing = document.getElementById(MOUNT_ID)
    if (existing) {
      existing.remove()
    }

    const mountContainer = document.createElement('div')
    mountContainer.id = MOUNT_ID
    mountContainer.dataset.dshPlugin = 'dsh-peak'
    mountContainer.style.display = 'inline-flex'
    mountContainer.style.alignItems = 'center'
    mountContainer.style.alignSelf = 'center'
    mountContainer.style.marginLeft = '8px'
    mountContainer.style.verticalAlign = 'middle'
    mountContainer.style.flexShrink = '0'

    let unmount: (() => void) | null = null

    const attach = () => {
      const target = findHeaderMountTarget()
      if (target && mountContainer.parentElement !== target.parent) {
        target.parent.insertBefore(mountContainer, target.insertBeforeNode)
        if (!unmount) {
          unmount = mountPeakBadge(mountContainer, {
            locale:
              typeof navigator !== 'undefined' &&
              navigator.language &&
              navigator.language.startsWith('zh')
                ? 'zh'
                : 'en',
          })
        }
      }
    }

    attach()

    // Observer to re-position when DSH header re-renders dynamically
    let observer: MutationObserver | null = null
    if (typeof MutationObserver !== 'undefined') {
      observer = new MutationObserver(() => {
        attach()
      })
      observer.observe(document.body, { childList: true, subtree: true })
    }

    disposers.push(() => {
      if (observer) {
        observer.disconnect()
      }
      if (unmount) {
        unmount()
      }
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
          // ignore
        }
      }
    })
  }
}
