import React, { memo } from 'react';
import { useStyles } from '../style';

interface ModalResizeHandleProps {
  onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
}

const ModalResizeHandle = memo<ModalResizeHandleProps>(({ onPointerDown }) => {
  const { styles } = useStyles();

  return (
    <div
      className={styles.resizeHandle}
      data-modal-no-drag
      onPointerDown={onPointerDown}
    />
  );
});

export default ModalResizeHandle;
