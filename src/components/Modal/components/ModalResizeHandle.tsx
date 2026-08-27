import React, { memo } from 'react';
import { useLocale } from '../../../configProvider/useLocale';
import { useStyles } from '../style';

interface ModalResizeHandleProps {
  onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
  className?: string;
  style?: React.CSSProperties;
}

const stopMouseDownPropagation = (event: React.MouseEvent<HTMLDivElement>) => {
  event.preventDefault();
  event.stopPropagation();
};

const ModalResizeHandle = memo<ModalResizeHandleProps>(
  ({ onPointerDown, className, style }) => {
    const modalLocale = useLocale('Modal');
    const { styles, cx } = useStyles();

    return (
      <div
        className={cx(styles.resizeHandle, className)}
        style={style}
        data-modal-no-drag
        role="separator"
        aria-label={modalLocale.resizeBottomRight}
        onMouseDown={stopMouseDownPropagation}
        onPointerDown={onPointerDown}
      />
    );
  },
);

export default ModalResizeHandle;
