import { describe, it, expect } from 'vitest'
import { apply, name } from '../src/index.ts'

describe('Plugin Host Entry', () => {
  it('exports correct plugin name and apply function', () => {
    expect(name).toBe('@dsh-external/dsh-peak')
    expect(typeof apply).toBe('function')

    const mockCtx: any = {}
    expect(() => apply(mockCtx)).not.toThrow()
  })
})
