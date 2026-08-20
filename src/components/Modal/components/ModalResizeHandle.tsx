import clsx from 'clsx';
import React, { memo } from 'react';
import { useLocale } from '../../../configProvider/useLocale';

interface ModalResizeHandleProps {
  prefixCls: string;
  hashId?: string;
  onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
}

const stopMouseDownPropagation = (event: React.MouseEvent<HTMLDivElement>) => {
  event.preventDefault();
  event.stopPropagation();
};

const ModalResizeHandle = memo<ModalResizeHandleProps>(
  ({ prefixCls, hashId, onPointerDown }) => {
    const modalLocale = useLocale('Modal');

    return (
      <div
        className={clsx(`${prefixCls}-resize-handle`, hashId)}
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
