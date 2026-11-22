import type { ChapterId } from '../lib/route'
import { thumb } from '../lib/thumbs'

// The picture in an overview frame: the chapter's own data as a bar strip, the bars it is about in its kind colour.
export function Thumb({ id }: { id: ChapterId }) {
  const { bars, lit } = thumb(id)
  const w = 100 / bars.length
  return (
    <svg className="ov-thumb" viewBox="0 0 100 32" preserveAspectRatio="none" aria-hidden="true">
      {bars.map((b, i) => (
        <rect key={i} className={lit.includes(i) ? 'on' : undefined} x={i * w + w * 0.15} y={32 - Math.max(b * 30, 0.6)} width={w * 0.7} height={Math.max(b * 30, 0.6)} />
      ))}
    </svg>
  )
}
