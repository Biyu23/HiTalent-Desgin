import clsx from 'clsx';
import React, { memo } from 'react';
import { useLocale } from '../../../configProvider/useLocale';
import type { DrawerPlacement } from '../type';

interface DrawerResizeHandleProps {
  prefixCls: string;
  hashId?: string;
  placement: DrawerPlacement;
  className?: string;
  style?: React.CSSProperties;
  resizing: boolean;
  onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
}

const DrawerResizeHandle = memo<DrawerResizeHandleProps>(
  ({
    prefixCls,
    hashId,
    placement,
    className,
    style,
    resizing,
    onPointerDown,
  }) => {
    const drawerLocale = useLocale('Drawer');
    const horizontal = placement === 'left' || placement === 'right';
    const handleCls = `${prefixCls}-resize-handle`;
    const ariaLabels = {
      left: drawerLocale.resizeLeft,
      right: drawerLocale.resizeRight,
      top: drawerLocale.resizeTop,
      bottom: drawerLocale.resizeBottom,
    };

    return (
      <div
        className={clsx(
          handleCls,
          `${handleCls}-${placement}`,
          hashId,
          { [`${handleCls}-resizing`]: resizing },
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
