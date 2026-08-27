import React, { memo } from 'react';
import { useLocale } from '../../../configProvider/useLocale';
import { useStyles } from '../style';
import type { DrawerPlacement } from '../type';

interface DrawerResizeHandleProps {
  placement: DrawerPlacement;
  className?: string;
  style?: React.CSSProperties;
  resizing: boolean;
  onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
}

const placementStyleKeyMap = {
  left: 'resizeHandleLeft',
  right: 'resizeHandleRight',
  top: 'resizeHandleTop',
  bottom: 'resizeHandleBottom',
} as const;

const DrawerResizeHandle = memo<DrawerResizeHandleProps>(
  ({ placement, className, style, resizing, onPointerDown }) => {
    const { styles: drawerStyles, cx } = useStyles();
    const drawerLocale = useLocale('Drawer');
    const horizontal = placement === 'left' || placement === 'right';
    const ariaLabels = {
      left: drawerLocale.resizeLeft,
      right: drawerLocale.resizeRight,
      top: drawerLocale.resizeTop,
      bottom: drawerLocale.resizeBottom,
    };

    return (
      <div
        className={cx(
          drawerStyles.resizeHandle,
          drawerStyles[placementStyleKeyMap[placement]],
          resizing && drawerStyles.resizeHandleResizing,
          className,
        )}
        style={style}
        role="separator"
        aria-label={ariaLabels[placement]}
        aria-orientation={horizontal ? 'vertical' : 'horizontal'}
        data-resizing={resizing ? 'true' : undefined}
        onPointerDown={onPointerDown}
      />
    );
  },
);

export default DrawerResizeHandle;
