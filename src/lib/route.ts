// Chapter order is the reading order; every chapter list in the app is keyed by these ids.
export const CHAPTER_IDS = ['camera', 'detect', 'keypoints', 'map', 'peaks', 'real', 'int8'] as const
export type ChapterId = (typeof CHAPTER_IDS)[number]

// "#/<chapter>" opens that chapter; anything else (empty, "#/", unknown id) is the overview, returned as null.
export function parseRoute(hash: string): ChapterId | null {
  const id = hash.match(/^#\/([a-z0-9]+)$/)?.[1]
  return CHAPTER_IDS.find((c) => c === id) ?? null
}
