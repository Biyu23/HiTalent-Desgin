import React, { useContext } from 'react';
import { useStyles } from '../style';
import TableContext from '../TableContext';

interface ResizeHandleProps {
  active: boolean;
  disabled?: boolean;
  onPointerDown: React.PointerEventHandler<HTMLDivElement>;
}

function stopHeaderAction(event: React.MouseEvent<HTMLDivElement>) {
  event.preventDefault();
  event.stopPropagation();
}

export default function ResizeHandle({
  active,
  disabled = false,
  onPointerDown,
}: ResizeHandleProps) {
  const table = useContext(TableContext);
  const { styles, cx } = useStyles();
  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-disabled={disabled}
      style={
        disabled ? { visibility: 'hidden', pointerEvents: 'none' } : undefined
      }
      className={cx(
        styles.resizeHandle,
        active && styles.resizeHandleActive,
        table.classNames?.resizeHandle,
      )}
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
