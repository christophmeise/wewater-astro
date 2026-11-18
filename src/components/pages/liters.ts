/**
 * The home page's litre counter, unchanged from the old site (LiterCounter.tsx): an estimate of
 * the drinking water our filters in use provide per year, based on 15.4 litres per minute since
 * a reference date, ticking up by 0.1899 litres every second.
 */
const REFERENCE = Date.UTC(2021, 11, 22); // 2021-12-22
const OFFSET_MS = 88_790_842_706;
const LITERS_PER_MINUTE = 15.4;

/** Litres per tick of the live counter (one tick per second). */
export const LITERS_PER_TICK = 0.1899;

export function litersAt(time: number): number {
  return ((time - REFERENCE + OFFSET_MS) / 1000 / 60) * LITERS_PER_MINUTE;
}
