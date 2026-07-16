import { Modal as AntdModal } from 'antd';
import clsx from 'clsx';
import React, {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import { usePrefixCls } from '../../configProvider/usePrefixCls';
import destroyFns from './destroyFns';
import DraggableWrapper from './DraggableWrapper';
import './index.less';
import MinimizedDock from './minimizedDock';
import ModalContext, { ModalContextValue } from './ModalContext';
import ModalHeader from './modalHeader';
import { ModalProps, ModalRef, ModalStaticMethods } from './type';
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

  // ✅ 维护最新的 handleClose 引用，供 destroyAll 闭包读取，
  // 避免 React 18 自动批处理下的闭包陷阱。
  const handleCloseRef = useRef(handleClose);
  handleCloseRef.current = handleClose;

  // 注册/注销销毁回调：open 变为 true 时推入 destroyFns，
  // 组件卸载或 open 变为 false 时从 destroyFns 中移除。
  useEffect(() => {
    if (!open) return;

    const destroyFn = () => {
      handleCloseRef.current?.(
        undefined as unknown as React.MouseEvent<HTMLElement>,
      );
    };

    destroyFns.push(destroyFn);

    return () => {
      const idx = destroyFns.indexOf(destroyFn);
      if (idx >= 0) destroyFns.splice(idx, 1);
    };
  }, [open]);

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

/**
 * 销毁所有已打开的 Modal 实例（包括最小化悬浮窗）。
 *
 * 内部依次调用每个实例的 handleClose，触发完整关闭流程：
 * 恢复最小化 → 退出最大化 → 重置状态 → 调用 onCancel。
 * 调用完成后 destroyFns 数组会被清空。
 *
 * @example
 * // 在路由切换、页面跳转等场景中一键清理所有弹窗
 * Modal.destroyAll();
 */
const ModalWithStatics: React.MemoExoticComponent<
  React.ForwardRefExoticComponent<ModalProps & React.RefAttributes<ModalRef>>
> &
  ModalStaticMethods = memo(Modal) as any;

ModalWithStatics.destroyAll = () => {
  // 先 splice(0) 取出所有 callback 再同步调用，清空原数组，
  // 防止每个 callback 在 clean-up 中 splice 自身时产生索引错乱。
  const fns = destroyFns.splice(0);
  fns.forEach((fn) => fn());
};

export default ModalWithStatics;
