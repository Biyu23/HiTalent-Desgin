import React, { memo } from 'react';
import ReactDraggable from 'react-draggable';
import useDragBounds from '../../../hooks/useDragBounds';
import { useModalContext } from '../ModalContext';

export interface DraggableWrapperProps {
  children: React.ReactNode;
}

const Draggable = ReactDraggable as any;

const DraggableWrapper = memo<DraggableWrapperProps>(({ children }) => {
  const { isMaximized, draggable, disabledDrag, prefixCls } = useModalContext();
  const { dragRef, bounds, onStart } = useDragBounds();

  if (!draggable || isMaximized) return <>{children}</>;

  return (
    <Draggable
      disabled={disabledDrag}
      bounds={bounds}
      nodeRef={dragRef}
      onStart={onStart}
    >
      <div ref={dragRef} className={`${prefixCls}-draggable-wrapper`}>
        {children}
      </div>
    </Draggable>
  );
});

export default DraggableWrapper;
