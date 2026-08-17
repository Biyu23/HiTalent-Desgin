import type { DrawerAxis, DrawerSize } from '../type';

export const DEFAULT_DRAWER_SIZE = 378;
export const LARGE_DRAWER_SIZE = 736;
export const DEFAULT_MIN_DRAWER_SIZE = 100;

export function resolveDrawerSize(
  size: DrawerSize | undefined,
): number | string | undefined {
  if (size === 'default') return DEFAULT_DRAWER_SIZE;
  if (size === 'large') return LARGE_DRAWER_SIZE;
  return size;
}

export function getResizeCursor(axis: DrawerAxis): string {
  return axis === 'horizontal' ? 'col-resize' : 'row-resize';
}

export function getPointerPosition(
  event: Pick<PointerEvent, 'clientX' | 'clientY'>,
  axis: DrawerAxis,
): number {
  return axis === 'horizontal' ? event.clientX : event.clientY;
}

export function getAxisSize(rect: DOMRect, axis: DrawerAxis): number {
  return axis === 'horizontal' ? rect.width : rect.height;
}

export function toValidNumber(value: number | undefined): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? value
    : undefined;
}

export function clampSize(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
