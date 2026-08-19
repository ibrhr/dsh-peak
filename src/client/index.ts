/**
 * dsh-peak client plugin entry for DeepSeek Harness (Browser half).
 *
 * Places a minimal, lowkey status indicator in the top-right header actions bar (left of Session log).
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
 * Locate placement target: Top-Right header actions, immediately to the LEFT of "Session log".
 */
function findHeaderMountTarget(): { parent: Element; insertBeforeNode: Node | null } | null {
  const header = document.querySelector('header')
  if (!header) return null

  // 1. Search for "Session log" button or link within header
  const headerElements = header.querySelectorAll('*')
  for (const el of headerElements) {
    if (
      el.children.length === 0 &&
      el.textContent &&
      el.textContent.toLowerCase().includes('session log')
    ) {
      const sessionLogBtn = el.closest('button, a, [class*="action"], [class*="button"]') || el
      if (sessionLogBtn.parentElement) {
        return { parent: sessionLogBtn.parentElement, insertBeforeNode: sessionLogBtn }
      }
    }
  }

  // 2. Look for trailing header action bar
  const trailingActions = header.querySelector(
    ':is([class*="action"], [class*="trailing"], [class*="right"], [class*="end"], [data-slot*="action"])'
  )
  if (trailingActions && trailingActions !== header) {
    return { parent: trailingActions, insertBeforeNode: trailingActions.firstChild }
  }

  // 3. Fallback: append to header itself
  return { parent: header, insertBeforeNode: null }
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

  // 3. Mount indicator to DOM inline in header top-right
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
    mountContainer.style.marginRight = '8px'
    mountContainer.style.verticalAlign = 'middle'
    mountContainer.style.flexShrink = '0'

    let unmount: (() => void) | null = null

    const attach = () => {
      const target = findHeaderMountTarget()
      if (target) {
        try {
          if (mountContainer.parentElement !== target.parent || mountContainer.nextSibling !== target.insertBeforeNode) {
            if (target.insertBeforeNode && target.insertBeforeNode.parentNode === target.parent) {
              target.parent.insertBefore(mountContainer, target.insertBeforeNode)
            } else {
              target.parent.appendChild(mountContainer)
            }
          }
        } catch {
          // ignore DOM insertion race
        }
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
