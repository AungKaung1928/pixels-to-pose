import type { CSSProperties } from 'react'
import { markPos } from '../lib/marks'

// Ticks under a range input at the values a source measured. Positions assume the 16 px thumb set in index.css.
export function Marks({ min, max, values }: { min: number; max: number; values: readonly number[] }) {
  return (
    <span className="marks" aria-hidden="true">
      {values.map((v) => (
        <span key={v} className="mark" style={{ '--p': markPos(v, min, max) } as CSSProperties}>
          {v}
        </span>
      ))}
    </span>
  )
}
