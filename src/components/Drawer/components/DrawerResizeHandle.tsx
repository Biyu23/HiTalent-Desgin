import clsx from 'clsx';
import React, { memo } from 'react';
import { useLocale } from '../../../configProvider/useLocale';
import type { DrawerPlacement } from '../type';

interface DrawerResizeHandleProps {
  prefixCls: string;
  placement: DrawerPlacement;
  className?: string;
  style?: React.CSSProperties;
  resizing: boolean;
  onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
}

const DrawerResizeHandle = memo<DrawerResizeHandleProps>(
  ({ prefixCls, placement, className, style, resizing, onPointerDown }) => {
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
        className={clsx(
          `${prefixCls}-resize-handle`,
          `${prefixCls}-resize-handle-${placement}`,
          { [`${prefixCls}-resize-handle-resizing`]: resizing },
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
