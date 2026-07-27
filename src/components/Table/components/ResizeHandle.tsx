import React, { memo } from 'react';
import { usePrefixCls } from '../../../configProvider/usePrefixCls';

interface ResizeHandleProps {
  isResizing: boolean;
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
}

const ResizeHandle: React.FC<ResizeHandleProps> = ({
  isResizing,
  onPointerDown,
}) => {
  const prefixCls = usePrefixCls('table-resize-handle');
  return (
    <div
      className={`${prefixCls}${isResizing ? ` ${prefixCls}-active` : ''}`}
      onPointerDown={onPointerDown}
      role="separator"
      aria-orientation="vertical"
      aria-label="resize column"
    />
  );
};

export default memo(ResizeHandle);
