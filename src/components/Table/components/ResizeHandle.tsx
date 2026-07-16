import React, { memo } from 'react';
import { usePrefixCls } from '../../../configProvider/usePrefixCls';

interface ResizeHandleProps {
  /** 是否正在调整大小 */
  isResizing: boolean;
  /** mousedown */
  onMouseDown: (e: React.MouseEvent) => void;
  /** 双击 */
  onDoubleClick?: (e: React.MouseEvent) => void;
}

/**
 * ResizeHandle — 列宽调整手柄
 *
 * 绝对定位在 th 右侧边缘，hover 时显示蓝色指示线
 */
const ResizeHandle: React.FC<ResizeHandleProps> = ({
  isResizing,
  onMouseDown,
  onDoubleClick,
}) => {
  const prefixCls = usePrefixCls('table-resize-handle');

  return (
    <div
      className={`${prefixCls}${isResizing ? ` ${prefixCls}-active` : ''}`}
      onMouseDown={onMouseDown}
      onDoubleClick={onDoubleClick}
      role="separator"
      aria-orientation="vertical"
      aria-label="调整列宽"
    />
  );
};

export default memo(ResizeHandle);
