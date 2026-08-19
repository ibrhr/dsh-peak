import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { PeakBadge } from '../src/client/PeakBadge.tsx'
import { mountPeakBadge, apply } from '../src/client/index.ts'

describe('Client UI Plugin', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders PeakBadge in OFF_PEAK state with clean indicator', () => {
    const offPeakDate = new Date('2026-08-19T00:30:00Z')
    render(<PeakBadge initialDate={offPeakDate} />)

    expect(screen.getByText('Off-peak')).toBeDefined()
  })

  it('renders PeakBadge in PEAK state', () => {
    const peakDate = new Date('2026-08-19T02:00:00Z')
    render(<PeakBadge initialDate={peakDate} />)

    expect(screen.getByText('Peak')).toBeDefined()
  })

  it('renders Chinese copy when locale="zh"', () => {
    const offPeakDate = new Date('2026-08-19T00:30:00Z')
    render(<PeakBadge initialDate={offPeakDate} locale="zh" />)

    expect(screen.getByText('优惠时段')).toBeDefined()
  })

  it('opens and closes popover on click', () => {
    const offPeakDate = new Date('2026-08-19T00:30:00Z')
    render(<PeakBadge initialDate={offPeakDate} />)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(screen.getByText('DeepSeek API Pricing Status')).toBeDefined()
    expect(screen.getByText('DeepSeek-V4 Flash')).toBeDefined()
    expect(screen.getByText('DeepSeek-V4 Pro')).toBeDefined()

    // Close button
    const closeBtn = screen.getByLabelText('Close')
    fireEvent.click(closeBtn)

    expect(screen.queryByText('DeepSeek API Pricing Status')).toBeNull()
  })

  it('mounts and unmounts programmatically via mountPeakBadge', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    let unmount: (() => void) | undefined
    await act(async () => {
      unmount = mountPeakBadge(container)
    })

    expect(container.innerHTML).toContain('data-dsh-peak-state')

    await act(async () => {
      unmount?.()
    })
    expect(container.innerHTML).toBe('')
  })

  it('registers Cordis apply and cleans up DOM completely on effect disposal', async () => {
    let effectDisposer: (() => void) | undefined

    const mockCtx = {
      locale: {
        register: () => {},
      },
      slots: {
        inject: () => {},
        register: () => {},
      },
      effect: (cb: () => () => void) => {
        effectDisposer = cb()
      },
    }

    await act(async () => {
      apply(mockCtx)
    })

    const mounted = document.getElementById('dsh-peak-indicator-root')
    expect(mounted).not.toBeNull()

    // Trigger Cordis disposal
    await act(async () => {
      if (effectDisposer) {
        effectDisposer()
      }
    })

    const removed = document.getElementById('dsh-peak-indicator-root')
    expect(removed).toBeNull()
  })
})
