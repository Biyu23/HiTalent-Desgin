import { Modal as AntdModal } from 'antd';
import clsx from 'clsx';
import React, {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import Draggable from 'react-draggable';
import { usePrefixCls } from '../../configProvider/usePrefixCls';
import useDragBounds from '../../hooks/useDragBounds';
import './index.less';
import MinimizedDock from './minimizedDock';
import ModalHeader from './modalHeader';
import { ModalProps, ModalRef } from './type';

const Modal = forwardRef<ModalRef, ModalProps>((props, ref) => {
  const {
    open,
    title,
    modalRender,
    draggable = false,
    minimizable = false,
    maximizable = false,
    minimized: controlledMinimized,
    maximized: controlledMaximized,
    onMinimizeChange,
    onMaximizedChange,
    minimizePosition = 'bottom-right',
    closable = true,
    onCancel,
    className,
    style,
    children,
    ...restProps
  } = props;

  const prefixCls = usePrefixCls('modal');

  // ---- 受控/非受控状态管理 ----
  const isControlledMinimized = 'minimized' in props;
  const isControlledMaximized = 'maximized' in props;
  const [internalMinimized, setInternalMinimized] = useState(false);
  const [internalMaximized, setInternalMaximized] = useState(false);
  const isMinimized = isControlledMinimized
    ? !!controlledMinimized
    : internalMinimized;
  const isMaximized = isControlledMaximized
    ? !!controlledMaximized
    : internalMaximized;

  // ---- 拖拽状态 ----
  const [disabledDrag, setDisabledDrag] = useState(!draggable);

  useEffect(() => {
    if (!isMaximized) {
      setDisabledDrag(!draggable);
    }
  }, [draggable, isMaximized]);

  const {
    dragRef: modalDragRef,
    bounds: modalBounds,
    onStart: onModalDragStart,
  } = useDragBounds();
  const modalBoundsRef = useRef(modalBounds);
  modalBoundsRef.current = modalBounds;

  // ---- 稳定的状态更新回调 ----
  const updateMinimized = useCallback(
    (next: boolean) => {
      if (!isControlledMinimized) setInternalMinimized(next);
      onMinimizeChange?.(next);
    },
    [isControlledMinimized, onMinimizeChange],
  );

  const updateMaximized = useCallback(
    (next: boolean) => {
      if (!isControlledMaximized) setInternalMaximized(next);
      onMaximizedChange?.(next);
    },
    [isControlledMaximized, onMaximizedChange],
  );

  const handleClose = useCallback(
    (e: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) => {
      updateMinimized(false);
      updateMaximized(false);
      onCancel?.(e);
    },
    [onCancel, updateMinimized, updateMaximized],
  );

  const handleMinimize = useCallback(() => {
    updateMinimized(true);
    updateMaximized(false);
  }, [updateMinimized, updateMaximized]);

  const handleToggleMaximize = useCallback(() => {
    updateMaximized(!isMaximized);
  }, [updateMaximized, isMaximized]);

  const handleRestore = useCallback(() => {
    updateMinimized(false);
  }, [updateMinimized]);

  // ---- 暴露命令式方法 ----
  useImperativeHandle(
    ref,
    () => ({
      restore: handleRestore,
      maximize: () => {
        updateMinimized(false);
        updateMaximized(true);
      },
      unmaximize: () => updateMaximized(false),
      minimize: handleMinimize,
    }),
    [handleRestore, updateMaximized, handleMinimize, updateMinimized],
  );

  // ---- modalRender 组装：先让用户自定义渲染，再包裹 Draggable ----
  const finalModalRender = useCallback(
    (modalNode: React.ReactNode) => {
      const rendered = modalRender ? modalRender(modalNode) : modalNode;

      if (!draggable || isMaximized) return rendered;

      return (
        <Draggable
          disabled={disabledDrag}
          bounds={modalBoundsRef.current}
          nodeRef={modalDragRef}
          onStart={onModalDragStart}
        >
          <div ref={modalDragRef} className={`${prefixCls}-draggable-wrapper`}>
            {rendered}
          </div>
        </Draggable>
      );
    },
    [
      draggable,
      isMaximized,
      disabledDrag,
      modalDragRef,
      onModalDragStart,
      modalRender,
      prefixCls,
    ],
  );

  // ---- 最大化时通过 JS props 控制尺寸，避免 CSS !important ----
  const maximizedStyle: React.CSSProperties = isMaximized
    ? { top: 0, padding: 0, margin: 0, maxWidth: '100vw' }
    : {};
  const modalWidth = isMaximized ? '100vw' : restProps.width;

  return (
    <>
      <AntdModal
        {...restProps}
        width={modalWidth}
        open={open && !isMinimized}
        closable={false}
        modalRender={finalModalRender}
        onCancel={handleClose}
        style={{ ...style, ...maximizedStyle }}
        className={clsx(prefixCls, className, {
          [`${prefixCls}-maximized`]: isMaximized,
          [`${prefixCls}-transition-active`]: true,
        })}
        title={
          <ModalHeader
            title={title}
            prefixCls={prefixCls}
            draggable={draggable}
            isMaximized={isMaximized}
            disabledDrag={disabledDrag}
            setDisabledDrag={setDisabledDrag}
            minimizable={minimizable}
            maximizable={maximizable}
            closable={closable}
            onMinimize={handleMinimize}
            onToggleMaximize={handleToggleMaximize}
            onClose={handleClose}
          />
        }
      >
        {children}
      </AntdModal>
      <MinimizedDock
        open={open}
        isMinimized={isMinimized}
        title={title}
        prefixCls={prefixCls}
        minimizePosition={minimizePosition}
        onRestore={handleRestore}
        onClose={handleClose}
      />
    </>
  );
});

export default memo(Modal);
