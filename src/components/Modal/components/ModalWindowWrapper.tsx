import clsx from 'clsx';
import React, { memo, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { DraggableData, DraggableEvent } from 'react-draggable';
import ReactDraggable from 'react-draggable';
import { useComponentNamespace } from '../../_util/namespace';
import { useModalWindow } from '../contexts';
import { useModalPointerResize } from '../hooks/useModalPointerResize';
import ModalResizeHandle from './ModalResizeHandle';

export interface ModalWindowWrapperProps {
  children: React.ReactNode;
}

const Draggable = ReactDraggable;

const ModalWindowWrapper = memo<ModalWindowWrapperProps>(({ children }) => {
  const {
    draggable,
    resizable,
    open,
    isMaximized,
    isMinimized,
    isResizing,
    position: windowPosition,
    setPosition: setWindowPosition,
    setSize: setWindowSize,
    setResizing,
    classNames,
    styles,
  } = useModalWindow();
  const namespace = useComponentNamespace();
  const e = namespace.element;
  const dragRef = useRef<HTMLDivElement>(null);
  const modalContentRef = useRef<HTMLElement | null>(null);
  const [modalContent, setModalContent] = useState<HTMLElement | null>(null);
  const resizeActive = !!resizable && !!open && !isMaximized && !isMinimized;
  const resize = useModalPointerResize({
    modalRef: modalContentRef,
    antdPrefixCls: namespace.antdPrefixCls,
    resizable,
    active: resizeActive,
    setSize: setWindowSize,
  });

  React.useEffect(() => {
    setResizing(resize.resizing);
  }, [resize.resizing, setResizing]);

  useLayoutEffect(() => {
    const content = dragRef.current?.querySelector<HTMLElement>(
      `.${namespace.antdPrefixCls}-modal-content`,
    );
    modalContentRef.current = content || dragRef.current;
    setModalContent((current) =>
      current === (content || null) ? current : content || null,
    );
  }, [children, namespace.antdPrefixCls, open]);

  if (!draggable && !resizable) return <>{children}</>;

  const handleDrag = (_event: DraggableEvent, data: DraggableData) => {
    setWindowPosition({ x: data.x, y: data.y });
  };
  const handleSelector = `.${e('header')}, .${
    namespace.antdPrefixCls
  }-modal-footer`;
  const cancelSelector =
    '[data-modal-no-drag], button, a, input, textarea, select, [contenteditable]';

  const handleDragStart = (event: DraggableEvent): false | void => {
    const target = event.target;
    if (
      resize.resizing ||
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
        className={clsx(e('window'), namespace.hashId)}
        data-dragging={draggable && !isMaximized ? 'true' : undefined}
      >
        {children}
        {resizeActive && modalContent
          ? createPortal(
              <ModalResizeHandle
                onPointerDown={resize.onPointerDown}
                className={classNames?.resizeHandle}
                style={styles?.resizeHandle}
              />,
              modalContent,
            )
          : null}
      </div>
    </Draggable>
  );
});

export default ModalWindowWrapper;
