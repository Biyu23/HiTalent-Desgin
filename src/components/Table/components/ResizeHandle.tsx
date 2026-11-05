import React from 'react';
import { useStyles } from '../style';

interface ResizeHandleProps {
  active: boolean;
  disabled?: boolean;
  onPointerDown: React.PointerEventHandler<HTMLDivElement>;
}

/** 手柄操作不能冒泡成表头排序或双击行为。 */
function stopHeaderAction(event: React.MouseEvent<HTMLDivElement>) {
  event.preventDefault();
  event.stopPropagation();
}

/** 列宽交互入口；测量、参考线与提交交给 useColumnResize。 */
export default function ResizeHandle({
  active,
  disabled = false,
  onPointerDown,
}: ResizeHandleProps) {
  const { styles, cx } = useStyles();
  return (
    <div
      data-table-resize-handle
      style={
        disabled ? { visibility: 'hidden', pointerEvents: 'none' } : undefined
      }
      className={cx(styles.resizeHandle, active && styles.resizeHandleActive)}
      onPointerDown={
        disabled
          ? undefined
          : (event) => {
              if (event.pointerType === 'mouse') onPointerDown(event);
            }
      }
      onClick={stopHeaderAction}
      onDoubleClick={stopHeaderAction}
    />
  );
}
