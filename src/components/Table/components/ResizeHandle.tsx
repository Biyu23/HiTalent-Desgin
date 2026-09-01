import React, { memo, useContext } from 'react';
import { useStyles } from '../style';
import TableContext from '../TableContext';

interface ResizeHandleProps {
  isResizing: boolean;
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
}

const ResizeHandle: React.FC<ResizeHandleProps> = ({
  isResizing,
  onPointerDown,
}) => {
  const context = useContext(TableContext);
  const { styles, cx } = useStyles();

  return (
    <div
      className={cx(
        styles.resizeHandle,
        isResizing && styles.resizeHandleActive,
        context.classNames?.resizeHandle,
      )}
      onPointerDown={onPointerDown}
      onClick={(e) => e.stopPropagation()}
    />
  );
};

export default memo(ResizeHandle);
