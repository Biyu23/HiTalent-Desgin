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
import MinimizedDock from './components/MinimizedDock';
import ModalHeader from './components/ModalHeader';
import ModalWindowWrapper from './components/ModalWindowWrapper';
import { useDestroyRegister } from './hooks/useDestroyRegister';
import { useModalState } from './hooks/useModalState';
import { useModalWindowState } from './hooks/useModalWindowState';
import './index.less';
import ModalContext, { ModalContextValue } from './ModalContext';
import { ModalProps, ModalRef, ModalStaticMethods } from './type';
import destroyFns from './utils/destroyFns';

/**
 * Modal 组件
 *
 * 在 Ant Design Modal 基础上增强：
 * - 拖拽移动（draggable）
 * - 最小化至全局角落悬浮窗（minimizable）
 * - 最大化全屏（maximizable）
 * - 命令式 ref 控制（ModalRef）
 * - 静态方法 destroyAll 一键销毁所有实例
 */
const Modal = forwardRef<ModalRef, ModalProps>((props, ref) => {
  const {
    open,
    title,
    draggable = false,
    resizable = false,
    minimizable = false,
    maximizable = false,
    destroyOnHidden,
    minimized: controlledMinimized,
    maximized: controlledMaximized,
    minimizePosition = 'bottom-right',
    closable = true,
    className,
    wrapClassName,
    style,
    centered = false,
    children,
    onCancel,
    modalRender,
    onMinimizeChange,
    onMaximizedChange,
    ...restProps
  } = props;

  const prefixCls = usePrefixCls('modal');

  // ---- 状态管理 ----
  const {
    isMinimized,
    isMaximized,
    handleMinimize,
    handleRestore,
    handleToggleMaximize,
    handleMaximize,
    handleUnmaximize,
    handleReset,
  } = useModalState({
    minimized: controlledMinimized,
    maximized: controlledMaximized,
    onMinimizeChange,
    onMaximizedChange,
  });

  const {
    position: windowPosition,
    positionRef: windowPositionRef,
    size: windowSize,
    isResizing,
    setPosition: setWindowPosition,
    setSize: setWindowSize,
    setResizing,
  } = useModalWindowState();

  // minimizable 模式下关闭不销毁 DOM，保留表单数据
  const resolvedDestroyOnHidden = minimizable ? false : destroyOnHidden;

  // ---- 关闭处理 ----
  const handleClose = useCallback(
    (e?: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) => {
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

  // 注册销毁回调，供 destroyAll 使用
  useDestroyRegister(!!open, handleClose);

  // ---- 命令式 API ----
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

  // ---- 渲染相关 ----
  const finalModalRender = useCallback(
    (modalNode: React.ReactNode) => {
      const rendered = modalRender ? modalRender(modalNode) : modalNode;
      return <ModalWindowWrapper>{rendered}</ModalWindowWrapper>;
    },
    [modalRender],
  );

  const modalWidth = isMaximized
    ? '100%'
    : windowSize?.width || restProps.width;

  const mergedStyle: React.CSSProperties = useMemo(
    () => ({
      ...style,
      ...(isMaximized
        ? { top: 0, maxWidth: '100vw', margin: 0, paddingBottom: 0 }
        : {}),
    }),
    [style, isMaximized],
  );

  const mergedStyles = useMemo(
    () => ({
      ...(restProps.styles || {}),
      content: {
        ...(restProps.styles?.content || {}),
        ...(windowSize && !isMaximized ? { height: windowSize.height } : {}),
      },
    }),
    [restProps.styles, windowSize, isMaximized],
  );

  // ---- Context 值 ----
  const contextValue: ModalContextValue = useMemo(
    () => ({
      prefixCls,
      draggable,
      resizable: Boolean(resizable),
      minimizable,
      maximizable,
      closable,
      minimizePosition,
      open,
      centered,
      isMaximized,
      isMinimized,
      windowPosition,
      windowPositionRef,
      windowSize,
      isResizing,
      title,
      setWindowPosition,
      setWindowSize,
      setResizing,
      onMinimize: handleMinimize,
      onRestore: handleRestore,
      onToggleMaximize: handleToggleMaximize,
      onClose: handleClose,
    }),
    [
      prefixCls,
      draggable,
      resizable,
      minimizable,
      maximizable,
      closable,
      minimizePosition,
      open,
      centered,
      isMaximized,
      isMinimized,
      windowPosition,
      windowPositionRef,
      windowSize,
      isResizing,
      title,
      setWindowPosition,
      setWindowSize,
      setResizing,
      handleMinimize,
      handleRestore,
      handleToggleMaximize,
      handleClose,
    ],
  );

  return (
    <ModalContext.Provider value={contextValue}>
      <AntdModal
        {...restProps}
        destroyOnHidden={resolvedDestroyOnHidden}
        width={modalWidth}
        centered={centered}
        open={open && !isMinimized}
        closable={false}
        modalRender={finalModalRender}
        onCancel={handleClose}
        style={mergedStyle}
        styles={mergedStyles}
        wrapClassName={clsx(wrapClassName, `${prefixCls}-wrap`, {
          [`${prefixCls}-wrap-constrained`]:
            draggable || Boolean(resizable) || isMaximized || !!windowSize,
        })}
        className={clsx(prefixCls, className, {
          [`${prefixCls}-maximized`]: isMaximized,
          [`${prefixCls}-manual-size`]: !!windowSize && !isMaximized,
          [`${prefixCls}-resizing`]: isResizing,
          [`${prefixCls}-draggable`]: draggable && !isMaximized,
          [`${prefixCls}-resizable`]: Boolean(resizable) && !isMaximized,
          [`${prefixCls}-transition-active`]: !isResizing,
        })}
        title={<ModalHeader title={title} />}
      >
        {children}
      </AntdModal>
      <MinimizedDock />
    </ModalContext.Provider>
  );
});

/**
 * 组装静态方法到 memo 包装后的组件上。
 * destroyAll() 依次调用每个活跃实例的 handleClose，
 * 适用于路由切换、页面跳转等一键清理场景。
 */
const ModalWithStatics: React.MemoExoticComponent<
  React.ForwardRefExoticComponent<ModalProps & React.RefAttributes<ModalRef>>
> &
  ModalStaticMethods = memo(Modal) as any;

ModalWithStatics.destroyAll = () => {
  const fns = destroyFns.splice(0);
  fns.forEach((fn) => fn());
};

export default ModalWithStatics;
