// Where a value sits along a range input, 0 at min and 1 at max, clamped.
export const markPos = (v: number, min: number, max: number) => Math.min(1, Math.max(0, (v - min) / (max - min)))
