import clsx from 'clsx';
import React, { memo, useContext } from 'react';
import { useComponentNamespace } from '../../_util/namespace';
import TableContext from '../TableContext';

interface ResizeHandleProps {
  isResizing: boolean;
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
}

const ResizeHandle: React.FC<ResizeHandleProps> = ({
  isResizing,
  onPointerDown,
}) => {
  const namespace = useComponentNamespace();
  const context = useContext(TableContext);
  const e = namespace.element;
  const em = namespace.elementModifier;
  return (
    <div
      className={clsx(
        e('resize-handle'),
        namespace.hashId,
        context.classNames?.resizeHandle,
        {
          [em('resize-handle', 'active')]: isResizing,
        },
      )}
      style={context.styles?.resizeHandle}
      onPointerDown={onPointerDown}
      onClick={(e) => e.stopPropagation()}
      role="separator"
      aria-orientation="vertical"
      aria-label="resize column"
    />
  );
};

export default memo(ResizeHandle);
