import { describe, it, expect } from 'vitest'
import { apply, createPeakService } from '../src/index.ts'

describe('Host Plugin & Service', () => {
  it('createPeakService returns active API instance', () => {
    const service = createPeakService()
    expect(service.isPeak).toBeDefined()
    expect(service.getStatus).toBeDefined()
    expect(service.calculateSavings).toBeDefined()
    expect(service.models).toBeDefined()
  })

  it('registers peak service onto Cordis host context', () => {
    let providedName = ''
    let effectDisposer: (() => void) | undefined

    const mockCtx: any = {
      provide: (name: string) => {
        providedName = name
      },
      effect: (cb: () => () => void) => {
        effectDisposer = cb()
      },
    }

    apply(mockCtx)

    expect(providedName).toBe('peak')
    expect(mockCtx.peak).toBeDefined()
    expect(typeof mockCtx.peak.isPeak).toBe('function')

    // Disposer
    if (effectDisposer) {
      effectDisposer()
    }
    expect(mockCtx.peak).toBeUndefined()
  })
})
