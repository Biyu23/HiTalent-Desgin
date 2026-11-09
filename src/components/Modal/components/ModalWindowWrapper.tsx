import React, {
  memo,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
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
    position: windowPosition,
    setPosition: setWindowPosition,
    setSize: setWindowSize,
    setResizing,
  } = useModalWindow();
  const antdPrefixCls = useAntdPrefixCls();
  const dragRef = useRef<HTMLDivElement>(null);

  const [modalContent, setModalContent] = useState<HTMLElement | null>(null);
  const resizeActive = !!resizable && !!open && !isMaximized && !isMinimized;
  const resize = useModalPointerResize({
    modal: modalContent,
    antdPrefixCls,
    resizable,
    active: resizeActive,
    setSize: setWindowSize,
  });

  useEffect(() => {
    setResizing(resize.resizing);
  }, [resize.resizing, setResizing]);

  useLayoutEffect(() => {
    const content = dragRef.current?.querySelector<HTMLElement>(
      `.${antdPrefixCls}-modal-content`,
    );
    setModalContent(content ?? null);
  }, [children, antdPrefixCls, open]);

  if (!draggable && !resizable) return <>{children}</>;

  return (
    <DraggablePointerContainer
      disabled={!draggable || isMaximized || resize.resizing}
      nodeRef={dragRef}
      handle={`.${antdPrefixCls}-modal-header, .${antdPrefixCls}-modal-footer`}
      position={isMaximized ? { x: 0, y: 0 } : windowPosition}
      onDrag={setWindowPosition}
      data-dragging={draggable && !isMaximized ? 'true' : undefined}
    >
      {children}
      {resizeActive && modalContent
        ? createPortal(
            <ModalResizeHandle onPointerDown={resize.onPointerDown} />,
            modalContent,
          )
        : null}
    </DraggablePointerContainer>
  );
});

export default ModalWindowWrapper;
