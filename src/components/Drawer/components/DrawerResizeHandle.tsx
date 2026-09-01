import React, { memo } from 'react';
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

    return (
      <div
        className={cx(
          drawerStyles.resizeHandle,
          drawerStyles[placementStyleKeyMap[placement]],
          resizing && drawerStyles.resizeHandleResizing,
          className,
        )}
        style={style}
        data-resizing={resizing ? 'true' : undefined}
        onPointerDown={onPointerDown}
      />
    );
  },
);

export default DrawerResizeHandle;
