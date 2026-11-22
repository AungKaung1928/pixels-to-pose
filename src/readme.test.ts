import { describe, expect, it } from 'vitest'
import readme from '../README.md?raw'
import { methods } from './content/detect'

// The README's headline number is the soft-argmax row of the chapter 2 table; the two must not drift apart.
describe('README headline number', () => {
  it('quotes the soft-argmax head parameters and median error from src/content/detect.ts', () => {
    const m = methods.find((x) => x.id === 'softargmax')!
    expect(readme).toContain(`${m.params / 1000}k-parameter soft-argmax head finds the cube to ${m.median} mm median error`)
  })
})
