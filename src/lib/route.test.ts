import { describe, expect, it } from 'vitest'
import { CHAPTER_IDS, neighbours, parseRoute } from './route'

describe('parseRoute', () => {
  it('opens every chapter by its id', () => {
    for (const id of CHAPTER_IDS) expect(parseRoute(`#/${id}`)).toBe(id)
  })
  it('returns the overview for empty, bare or unknown hashes', () => {
    for (const h of ['', '#', '#/', '#/nope', '#camera', '#/camera/2', '#/CAMERA']) expect(parseRoute(h)).toBeNull()
  })
})

describe('neighbours', () => {
  it('links each chapter to the ones before and after, and the ends to the overview (null)', () => {
    expect(neighbours('camera')).toEqual([null, 'detect'])
    expect(neighbours('map')).toEqual(['keypoints', 'peaks'])
    expect(neighbours('int8')).toEqual(['real', null])
  })
  it('walks every chapter exactly once going forward', () => {
    const seen = []
    for (let id: (typeof CHAPTER_IDS)[number] | null = 'camera'; id; id = neighbours(id)[1]) seen.push(id)
    expect(seen).toEqual([...CHAPTER_IDS])
  })
})
