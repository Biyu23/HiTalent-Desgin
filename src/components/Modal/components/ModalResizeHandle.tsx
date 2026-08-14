import React, { memo } from 'react';
import { useLocale } from '../../../configProvider/useLocale';

interface ModalResizeHandleProps {
  prefixCls: string;
  onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
}

const stopMouseDownPropagation = (event: React.MouseEvent<HTMLDivElement>) => {
  event.preventDefault();
  event.stopPropagation();
};

const ModalResizeHandle = memo<ModalResizeHandleProps>(
  ({ prefixCls, onPointerDown }) => {
    const modalLocale = useLocale('Modal');

    return (
      <div
        className={`${prefixCls}-resize-handle`}
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
