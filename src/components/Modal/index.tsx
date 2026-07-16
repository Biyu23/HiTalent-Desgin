import { Modal as AntdModal } from 'antd';
import clsx from 'clsx';
import React, {
  forwardRef,
  memo,
  useCallback,
  useImperativeHandle,
  useMemo,
} from 'react';
import { usePrefixCls } from '../../configProvider/usePrefixCls';
import DraggableWrapper from './DraggableWrapper';
import './index.less';
import MinimizedDock from './minimizedDock';
import ModalContext, { ModalContextValue } from './ModalContext';
import ModalHeader from './modalHeader';
import { ModalProps, ModalRef } from './type';
import { useModalState } from './useModalState';

const Modal = forwardRef<ModalRef, ModalProps>((props, ref) => {
  const {
    open,
    title,
    draggable = false,
    minimizable = false,
    maximizable = false,
    destroyOnHidden,
    minimized: controlledMinimized,
    maximized: controlledMaximized,
    minimizePosition = 'bottom-right',
    closable = true,
    className,
    style,
    children,
    onCancel,
    modalRender,
    onMinimizeChange,
    onMaximizedChange,
    ...restProps
  } = props;

  const prefixCls = usePrefixCls('modal');

  const {
    isMinimized,
    isMaximized,
    dragDisabled,
    setDisabledDrag,
    handleMinimize,
    handleRestore,
    handleToggleMaximize,
    handleMaximize,
    handleUnmaximize,
    handleReset,
  } = useModalState({
    draggable,
    minimized: controlledMinimized,
    maximized: controlledMaximized,
    onMinimizeChange,
    onMaximizedChange,
  });

  const resolvedDestroyOnHidden = minimizable ? false : destroyOnHidden;

  const handleClose = useCallback(
    (e: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) => {
      if (isMinimized) handleRestore();
      if (isMaximized) onMaximizedChange?.(false);
      handleReset();
      onCancel?.(e);
    },
    [
      onCancel,
      isMinimized,
      isMaximized,
      handleRestore,
      handleReset,
      onMaximizedChange,
    ],
  );

  useImperativeHandle(
    ref,
    () => ({
      restore: handleRestore,
      maximize: () => {
        handleRestore();
        handleMaximize();
      },
      unmaximize: handleUnmaximize,
      minimize: handleMinimize,
    }),
    [handleRestore, handleMinimize, handleMaximize, handleUnmaximize],
  );

  const finalModalRender = useCallback(
    (modalNode: React.ReactNode) => {
      const rendered = modalRender ? modalRender(modalNode) : modalNode;
      return <DraggableWrapper>{rendered}</DraggableWrapper>;
    },
    [modalRender],
  );

  // 最大化时强制全宽，非最大化时透传用户配置的 width
  const modalWidth = isMaximized ? '100%' : restProps.width;

  // 最大化时覆盖 antd 默认定位样式（top/max-width/margin/paddingBottom），
  // 确保弹窗完全撑满视口
  const mergedStyle: React.CSSProperties = useMemo(
    () => ({
      ...style,
      ...(isMaximized
        ? {
            top: 0,
            maxWidth: '100vw',
            margin: 0,
            paddingBottom: 0,
          }
        : {}),
    }),
    [style, isMaximized],
  );

  const contextValue: ModalContextValue = useMemo(
    () => ({
      prefixCls,
      draggable,
      minimizable,
      maximizable,
      closable,
      minimizePosition,
      open,
      isMaximized,
      isMinimized,
      disabledDrag: dragDisabled,
      title,
      onMinimize: handleMinimize,
      onRestore: handleRestore,
      onToggleMaximize: handleToggleMaximize,
      onClose: handleClose,
      setDisabledDrag,
    }),
    [
      prefixCls,
      draggable,
      minimizable,
      maximizable,
      closable,
      minimizePosition,
      open,
      isMaximized,
      isMinimized,
      dragDisabled,
      title,
      handleMinimize,
      handleRestore,
      handleToggleMaximize,
      handleClose,
      setDisabledDrag,
    ],
  );

  return (
    <ModalContext.Provider value={contextValue}>
      <AntdModal
        {...restProps}
        destroyOnHidden={resolvedDestroyOnHidden}
        width={modalWidth}
        open={open && !isMinimized}
        closable={false}
        modalRender={finalModalRender}
        onCancel={handleClose}
        style={mergedStyle}
        className={clsx(prefixCls, className, {
          [`${prefixCls}-maximized`]: isMaximized,
          [`${prefixCls}-transition-active`]: true,
        })}
        title={<ModalHeader title={title} />}
      >
        {children}
      </AntdModal>
      <MinimizedDock />
    </ModalContext.Provider>
  );
});

export default memo(Modal);
