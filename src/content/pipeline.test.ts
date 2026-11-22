import { describe, expect, it } from 'vitest'
import { CHAPTER_IDS } from '../lib/route'
import { CHAPTER_NODE, EDGES, KIND_LABEL, NODES, NODE_KINDS } from './pipeline'

describe('pipeline diagram data', () => {
  const ids = NODES.map((n) => n.id)
  it('every chapter lights a node that exists and says what it does in both languages', () => {
    for (const c of CHAPTER_IDS) {
      expect(ids).toContain(CHAPTER_NODE[c].node)
      expect(CHAPTER_NODE[c].en).not.toBe('')
      expect(CHAPTER_NODE[c].ja).not.toBe(CHAPTER_NODE[c].en)
    }
  })
  it('node ids are unique and every kind used has a legend entry', () => {
    expect(new Set(ids).size).toBe(ids.length)
    for (const n of NODES) expect(NODE_KINDS).toContain(n.kind)
    for (const k of NODE_KINDS) expect(KIND_LABEL[k].ja).not.toBe('')
  })
  it('edges chain the nodes left to right', () => {
    expect(EDGES).toHaveLength(NODES.length - 1)
    EDGES.forEach(([a, b], i) => expect([a, b]).toEqual([ids[i], ids[i + 1]]))
  })
})
