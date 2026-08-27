import React, { memo, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAntdPrefixCls } from '../../../configProvider/usePrefixCls';
import DraggablePointerContainer from '../../_util/DraggablePointerContainer';
import { useModalWindow } from '../contexts';
import { useModalPointerResize } from '../hooks/useModalPointerResize';
import ModalResizeHandle from './ModalResizeHandle';

export interface ModalWindowWrapperProps {
  children: React.ReactNode;
}

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
  const antdPrefixCls = useAntdPrefixCls();
  const dragRef = useRef<HTMLDivElement>(null);

  const modalContentRef = useRef<HTMLElement | null>(null);
  const [modalContent, setModalContent] = useState<HTMLElement | null>(null);
  const resizeActive = !!resizable && !!open && !isMaximized && !isMinimized;
  const resize = useModalPointerResize({
    modalRef: modalContentRef,
    antdPrefixCls,
    resizable,
    active: resizeActive,
    setSize: setWindowSize,
  });

  React.useEffect(() => {
    setResizing(resize.resizing);
  }, [resize.resizing, setResizing]);

  useLayoutEffect(() => {
    const content = dragRef.current?.querySelector<HTMLElement>(
      `.${antdPrefixCls}-modal-content`,
    );
    modalContentRef.current = content || dragRef.current;
    setModalContent((current) =>
      current === (content || null) ? current : content || null,
    );
  }, [children, antdPrefixCls, open]);

  if (!draggable && !resizable) return <>{children}</>;

  const handleDrag = (pos: { x: number; y: number }) => {
    setWindowPosition(pos);
  };

  const handleSelector = `.${antdPrefixCls}-modal-header, .${antdPrefixCls}-modal-footer`;
  const cancelSelector =
    '[data-modal-no-drag], button, a, input, textarea, select, [contenteditable]';

  return (
    <DraggablePointerContainer
      disabled={!draggable || isMaximized || isResizing}
      nodeRef={dragRef}
      handle={handleSelector}
      cancel={cancelSelector}
      position={isMaximized ? { x: 0, y: 0 } : windowPosition}
      onDrag={handleDrag}
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
    </DraggablePointerContainer>
  );
});

export default ModalWindowWrapper;
