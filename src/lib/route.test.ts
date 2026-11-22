import { describe, expect, it } from 'vitest'
import { CHAPTER_IDS, parseRoute } from './route'

describe('parseRoute', () => {
  it('opens every chapter by its id', () => {
    for (const id of CHAPTER_IDS) expect(parseRoute(`#/${id}`)).toBe(id)
  })
  it('returns the overview for empty, bare or unknown hashes', () => {
    for (const h of ['', '#', '#/', '#/nope', '#camera', '#/camera/2', '#/CAMERA']) expect(parseRoute(h)).toBeNull()
  })
})
