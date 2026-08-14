import type { DrawerAxis, DrawerPlacement } from '../type';

export function getDrawerAxis(placement: DrawerPlacement): DrawerAxis {
  return placement === 'left' || placement === 'right'
    ? 'horizontal'
    : 'vertical';
}
