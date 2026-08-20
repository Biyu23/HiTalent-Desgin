import clsx from 'clsx';
import React, { memo, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { DraggableData, DraggableEvent } from 'react-draggable';
import ReactDraggable from 'react-draggable';
import { useNamespace } from '../../../configProvider/usePrefixCls';
import { useModalContext } from '../ModalContext';
import { useModalResize } from '../hooks/useModalResize';
import ModalResizeHandle from './ModalResizeHandle';

export interface ModalWindowWrapperProps {
  children: React.ReactNode;
}

const Draggable = ReactDraggable as any;

const ModalWindowWrapper = memo<ModalWindowWrapperProps>(({ children }) => {
  const {
    prefixCls,
    hashId,
    draggable,
    resizable,
    open,
    isMaximized,
    isMinimized,
    isResizing,
    windowPosition,
    setWindowPosition,
    setWindowSize,
    setResizing,
  } = useModalContext();
  const { e } = useNamespace('modal', prefixCls);
  const dragRef = useRef<HTMLDivElement>(null);
  const modalContentRef = useRef<HTMLElement | null>(null);
  const [modalContent, setModalContent] = useState<HTMLElement | null>(null);
  const resizeActive = !!resizable && !!open && !isMaximized && !isMinimized;
  const { handlePointerDown, resizingRef } = useModalResize({
    modalRef: modalContentRef,
    resizable,
    active: resizeActive,
    setSize: setWindowSize,
    setResizing,
  });

  useLayoutEffect(() => {
    const content =
      dragRef.current?.querySelector<HTMLElement>('.ant-modal-content');
    modalContentRef.current = content || dragRef.current;
    setModalContent((current) =>
      current === (content || null) ? current : content || null,
    );
  }, [children, open]);

  if (!draggable && !resizable) return <>{children}</>;

  const handleDrag = (_event: DraggableEvent, data: DraggableData) => {
    setWindowPosition({ x: data.x, y: data.y });
  };
  const handleSelector = `.${e('header')}, .ant-modal-footer`;
  const cancelSelector =
    '[data-modal-no-drag], button, a, input, textarea, select, [contenteditable]';

  const handleDragStart = (event: DraggableEvent): boolean | void => {
    const target = event.target;
    if (
      resizingRef.current ||
      (target instanceof Element && target.closest(cancelSelector))
    ) {
      return false;
    }
  };

  return (
    <Draggable
      disabled={!draggable || isMaximized || isResizing}
      nodeRef={dragRef}
      handle={handleSelector}
      cancel={cancelSelector}
      position={isMaximized ? { x: 0, y: 0 } : windowPosition}
      onStart={handleDragStart}
      onDrag={handleDrag}
    >
      <div
        ref={dragRef}
        className={clsx(e('window'), hashId)}
        data-dragging={draggable && !isMaximized ? 'true' : undefined}
      >
        {children}
        {resizeActive && modalContent
          ? createPortal(
              <ModalResizeHandle
                prefixCls={prefixCls}
                hashId={hashId}
                onPointerDown={handlePointerDown}
              />,
              modalContent,
            )
          : null}
      </div>
    </Draggable>
  );
});

export default ModalWindowWrapper;
