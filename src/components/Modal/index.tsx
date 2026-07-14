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
    modalRender,
    draggable = false,
    minimizable = false,
    maximizable = false,
    destroyOnClose,
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

  // ---- 统一状态管理（useReducer 替代散落的 useState） ----
  const {
    isMinimized,
    isMaximized,
    dragDisabled,
    setDisabledDrag,
    handleMinimize,
    handleRestore,
    handleToggleMaximize,
    handleReset,
  } = useModalState({
    draggable,
    minimized: controlledMinimized,
    maximized: controlledMaximized,
    onMinimizeChange,
    onMaximizedChange,
  });

  // ---- destroyOnClose 与 minimizable 互斥 ----
  const resolvedDestroyOnClose = minimizable ? false : destroyOnClose;
  if (process.env.NODE_ENV !== 'production' && minimizable && destroyOnClose) {
    // eslint-disable-next-line no-console
    console.warn(
      '[HiTalent Design] Modal: `destroyOnClose` 与 `minimizable` 互斥。' +
        '当开启 minimizable 时，最小化操作会使 AntdModal 收到 open=false，' +
        '若同时开启 destroyOnClose 会导致弹窗 DOM 被销毁，表单数据丢失。' +
        '组件已自动将 destroyOnClose 覆盖为 false。',
    );
  }

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

  // ---- 暴露命令式方法 ----
  useImperativeHandle(
    ref,
    () => ({
      restore: handleRestore,
      maximize: () => {
        handleRestore();
        onMaximizedChange?.(true);
      },
      unmaximize: () => onMaximizedChange?.(false),
      minimize: handleMinimize,
    }),
    [handleRestore, handleMinimize, onMaximizedChange],
  );

  // ---- modalRender：先让用户自定义渲染，再包裹 DraggableWrapper ----
  const finalModalRender = useCallback(
    (modalNode: React.ReactNode) => {
      const rendered = modalRender ? modalRender(modalNode) : modalNode;
      return <DraggableWrapper>{rendered}</DraggableWrapper>;
    },
    [modalRender],
  );

  // ---- 最大化时通过 JS props 控制尺寸，避免 CSS !important ----
  const maximizedStyle: React.CSSProperties = isMaximized
    ? { top: 0, padding: 0, margin: 0, maxWidth: '100vw' }
    : {};
  const modalWidth = isMaximized ? '100vw' : restProps.width;

  // ---- 构建 Context Value（useMemo 稳定引用，避免子组件无谓重渲染） ----
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
        destroyOnClose={resolvedDestroyOnClose}
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
        title={<ModalHeader title={title} />}
      >
        {children}
      </AntdModal>
      <MinimizedDock />
    </ModalContext.Provider>
  );
});

export default memo(Modal);
