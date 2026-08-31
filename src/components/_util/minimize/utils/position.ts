import type { MinimizePosition } from '../type';

export const isBottomPosition = (position: MinimizePosition): boolean =>
  position === 'bottom-left' ||
  position === 'bottom-right' ||
  position === 'bottom';

export const getStackTransformOrigin = (position: MinimizePosition): string => {
  if (position === 'left' || position.endsWith('-left')) {
    return 'left center';
  }
  if (position === 'right' || position.endsWith('-right')) {
    return 'right center';
  }
  return 'center';
};
