import clsx from 'clsx';
import React, { memo } from 'react';
import { useNamespace } from '../../../configProvider/usePrefixCls';

interface ResizeHandleProps {
  isResizing: boolean;
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
}

const ResizeHandle: React.FC<ResizeHandleProps> = ({
  isResizing,
  onPointerDown,
}) => {
  const { e, em } = useNamespace('table');
  return (
    <div
      className={clsx(e('resize-handle'), {
        [em('resize-handle', 'active')]: isResizing,
      })}
      onPointerDown={onPointerDown}
      onClick={(e) => e.stopPropagation()}
      role="separator"
      aria-orientation="vertical"
      aria-label="resize column"
    />
  );
};

export default memo(ResizeHandle);
