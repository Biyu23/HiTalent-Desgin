import type { DrawerAxis, DrawerPlacement, DrawerProps } from '../type';

export function getDrawerAxis(placement: DrawerPlacement): DrawerAxis {
  return placement === 'left' || placement === 'right'
    ? 'horizontal'
    : 'vertical';
}

/**
 * 解析抽屉最小化模式下的 closable 配置，保证关闭按钮靠右对齐 (placement: 'end')
 */
export const resolveMinimizableClosable = (
  closable: DrawerProps['closable'],
  closeIcon: DrawerProps['closeIcon'],
): DrawerProps['closable'] => {
  if (closable === false || closeIcon === false || closeIcon === null) {
    return false;
  }
  if (typeof closable === 'object') {
    return { ...closable, placement: 'end' };
  }
  return { placement: 'end' };
};
