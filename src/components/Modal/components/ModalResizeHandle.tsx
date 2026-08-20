import clsx from 'clsx';
import React, { memo } from 'react';
import { useLocale } from '../../../configProvider/useLocale';
import { useNamespace } from '../../../configProvider/usePrefixCls';

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
    const { e } = useNamespace('modal', prefixCls);
    const modalLocale = useLocale('Modal');

    return (
      <div
        className={clsx(e('resize-handle'), hashId)}
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
