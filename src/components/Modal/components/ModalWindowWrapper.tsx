import React, { memo, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { DraggableData, DraggableEvent } from 'react-draggable';
import ReactDraggable from 'react-draggable';
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
  }, [children]);

  if (!draggable && !resizable) return <>{children}</>;

  const handleDrag = (_event: DraggableEvent, data: DraggableData) => {
    setWindowPosition({ x: data.x, y: data.y });
  };
  const handleSelector = `.${prefixCls}-header-wrapper, .ant-modal-footer`;
  const cancelSelector = [
    `.${prefixCls}-header-actions`,
    `.${prefixCls}-resize-handle`,
    '[data-modal-no-drag]',
    'button',
    'a',
    'input',
    'textarea',
    'select',
    '[contenteditable]',
    '.ant-checkbox-wrapper',
    '.ant-radio-wrapper',
    '.ant-select',
    '.ant-picker',
    '.ant-upload',
    '.ant-slider',
    '.ant-switch',
  ].join(', ');

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
        className={`${prefixCls}-window-wrapper`}
        data-dragging={draggable && !isMaximized ? 'true' : undefined}
      >
        {children}
        {resizeActive && modalContent
          ? createPortal(
              <ModalResizeHandle
                prefixCls={prefixCls}
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
