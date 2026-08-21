import clsx from 'clsx';
import React, { memo } from 'react';
import { useLocale } from '../../../configProvider/useLocale';
import { useComponentNamespace } from '../../_util/namespace';

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
    const namespace = useComponentNamespace();

    return (
      <div
        className={clsx(
          namespace.element('resize-handle'),
          namespace.hashId,
          className,
        )}
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
