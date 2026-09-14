import React, { memo } from 'react';
import { useStyles } from '../style';

interface ModalResizeHandleProps {
  onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
}

const stopMouseDownPropagation = (event: React.MouseEvent<HTMLDivElement>) => {
  event.preventDefault();
  event.stopPropagation();
};

const ModalResizeHandle = memo<ModalResizeHandleProps>(({ onPointerDown }) => {
  const { styles } = useStyles();

  return (
    <div
      className={styles.resizeHandle}
      data-modal-no-drag
      onMouseDown={stopMouseDownPropagation}
      onPointerDown={onPointerDown}
    />
  );
});

export default ModalResizeHandle;
