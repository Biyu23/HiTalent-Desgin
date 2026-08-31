import type { MinimizePosition } from '../type';

export const isBottomPosition = (position: MinimizePosition): boolean =>
  position === 'bottom-left' ||
  position === 'bottom-right' ||
  position === 'bottom';
