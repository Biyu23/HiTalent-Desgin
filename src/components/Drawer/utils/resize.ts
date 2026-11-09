export const DEFAULT_DRAWER_SIZE = 378;
export const LARGE_DRAWER_SIZE = 736;
export const DEFAULT_MIN_DRAWER_SIZE = 100;

export function toValidNumber(value: number | undefined): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? value
    : undefined;
}

export function clampSize(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
