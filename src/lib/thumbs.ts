import { DEFAULT, RESOLUTIONS } from '../content/camera'
import { methods } from '../content/detect'
import { rows } from '../content/int8'
import { KP_DEFAULT } from '../content/keypoints'
import { PEAK_GRID } from '../content/peaks'
import { realGap } from '../content/real'
import { metresPerPixel } from './camera'
import { measured } from './iou'
import { heatmap, peaks } from './maxpool'
import type { ChapterId } from './route'
import { blob, softmax } from './softargmax'

// A tiny bar strip per chapter for the overview frames, drawn from the data the chapter shows at its
// opening setting. bars are scaled to 0..1 (tallest = 1); lit are the bars the chapter is about.
export interface Thumb {
  bars: number[]
  lit: number[]
}

const scale = (v: number[]): number[] => {
  const top = Math.max(...v)
  return v.map((x) => x / top)
}
const at = (i: number) => (i < 0 ? [] : [i])

export function thumb(id: ChapterId): Thumb {
  switch (id) {
    case 'camera': // mm per pixel at each image size; lit: the measured size
      return {
        bars: scale(RESOLUTIONS.map((r) => metresPerPixel(DEFAULT.d, DEFAULT.fov, r))),
        lit: at(RESOLUTIONS.indexOf(DEFAULT.res)),
      }
    case 'detect': // median error per method; lit: the soft-argmax CNN
      return { bars: scale(methods.map((m) => m.median)), lit: at(methods.findIndex((m) => m.id === 'softargmax')) }
    case 'keypoints': {
      // softmax weights over the cells; lit: the strongest cell
      const w = softmax(blob(KP_DEFAULT.cells, KP_DEFAULT.x0), KP_DEFAULT.beta)
      return { bars: scale(w), lit: at(w.indexOf(Math.max(...w))) }
    }
    case 'map': // measured mAP per box shift; lit: 7 px, the overview card's shift
      return { bars: scale(measured.map((m) => m.map)), lit: at(measured.findIndex((m) => m.d === 7)) }
    case 'peaks': {
      // heatmap row through the two centres; lit: the cells the max-pool keeps
      const [x, y] = PEAK_GRID.first
      const h = heatmap(PEAK_GRID.n, [[x, y], [x + PEAK_GRID.sep, y]], PEAK_GRID.sigma)
      return { bars: scale(h[y]), lit: peaks(h, PEAK_GRID.thr).flatMap(([px, py]) => (py === y ? [px] : [])) }
    }
    case 'real': {
      // AP per IoU threshold, renders then real photos side by side; lit: renders (the real bars are near 0)
      const { sim, real } = realGap.hard
      return { bars: scale(sim.flatMap((s, i) => [s, real[i]])), lit: sim.map((_, i) => 2 * i) }
    }
    case 'int8': // one-thread model time per variant; lit: INT8 static
      return { bars: scale(rows.map((r) => r.ms1)), lit: at(rows.findIndex((r) => r.id === 'int8-static')) }
  }
}
