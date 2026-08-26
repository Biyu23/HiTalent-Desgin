import clsx from 'clsx';
import React, { memo } from 'react';
import { useLocale } from '../../../configProvider/useLocale';
import { useComponentNamespace } from '../../_util/namespace';
import type { DrawerPlacement } from '../type';

interface DrawerResizeHandleProps {
  placement: DrawerPlacement;
  className?: string;
  style?: React.CSSProperties;
  resizing: boolean;
  onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
}

const DrawerResizeHandle = memo<DrawerResizeHandleProps>(
  ({ placement, className, style, resizing, onPointerDown }) => {
    const { e, em, hashId } = useComponentNamespace();
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
          e('resize-handle'),
          em('resize-handle', placement),
          hashId,
          { [em('resize-handle', 'resizing')]: resizing },
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
