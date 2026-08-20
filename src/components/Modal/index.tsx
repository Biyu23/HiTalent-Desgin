import { Modal as AntdModal } from 'antd';
import clsx from 'clsx';
import React, {
  forwardRef,
  memo,
  useCallback,
  useImperativeHandle,
  useMemo,
} from 'react';
import { useLocale } from '../../configProvider/useLocale';
import { useNamespace } from '../../configProvider/usePrefixCls';
import MinimizedDock from '../_util/minimize/MinimizedDock';
import ModalHeader from './components/ModalHeader';
import ModalWindowWrapper from './components/ModalWindowWrapper';
import { useDestroyRegister } from './hooks/useDestroyRegister';
import { useModalState } from './hooks/useModalState';
import { useModalWindowState } from './hooks/useModalWindowState';
import ModalContext, { ModalContextValue } from './ModalContext';
import { useStyle } from './style';
import type { ModalProps, ModalRef, ModalStaticMethods } from './type';
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
    prefixCls: customPrefixCls,
    open,
    title,
    draggable = false,
    resizable = false,
    minimizable = false,
    maximizable = false,
    destroyOnClose,
    destroyOnHidden,
    minimized: controlledMinimized,
    maximized: controlledMaximized,
    minimizePosition = 'bottom-right',
    closable = true,
    className,
    rootClassName,
    wrapClassName,
    classNames,
    styles,
    style,
    centered = false,
    children,
    onCancel,
    modalRender,
    onMinimizeChange,
    onMaximizedChange,
    ...restProps
  } = props;

  const { prefixCls, e, m, em } = useNamespace('modal', customPrefixCls);
  const modalLocale = useLocale('Modal');
  const { wrapSSR, hashId } = useStyle(prefixCls);

  const { minimizedDock: minimizedDockClassName, ...antdClassNames } =
    classNames || {};
  const { minimizedDock: minimizedDockStyle, ...antdStyles } = styles || {};

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
    resetPosition: resetWindowPosition,
    resetSize: resetWindowSize,
  } = useModalWindowState();

  // 最小化模式下隐藏时保留 DOM，防止表单数据丢失；彻底关闭时遵循传入配置
  const resolvedDestroyOnClose = isMinimized ? false : destroyOnClose;
  const resolvedDestroyOnHidden = isMinimized ? false : destroyOnHidden;

  const handleClose = useCallback(
    (e?: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>) => {
      if (isMinimized) handleRestore();
      if (isMaximized) handleUnmaximize();
      handleReset();
      onCancel?.(e);
    },
    [
      onCancel,
      isMinimized,
      isMaximized,
      handleRestore,
      handleUnmaximize,
      handleReset,
    ],
  );

  // 注册销毁回调，供 destroyAll 使用
  useDestroyRegister(!!open, handleClose);

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
      resetPosition: resetWindowPosition,
      resetSize: resetWindowSize,
    }),
    [
      handleRestore,
      handleMinimize,
      handleMaximize,
      handleUnmaximize,
      resetWindowPosition,
      resetWindowSize,
    ],
  );

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
      ...antdStyles,
      content: {
        ...(antdStyles?.content || {}),
        ...(windowSize && !isMaximized ? { height: windowSize.height } : {}),
      },
    }),
    [antdStyles, windowSize, isMaximized],
  );

  const contextValue: ModalContextValue = useMemo(
    () => ({
      prefixCls,
      hashId,
      draggable,
      resizable,
      minimizable,
      maximizable,
      closable,
      open,
      centered,
      isMaximized,
      isMinimized,
      windowPosition,
      windowPositionRef,
      windowSize,
      isResizing,
      setWindowPosition,
      setWindowSize,
      setResizing,
      resetPosition: resetWindowPosition,
      resetSize: resetWindowSize,
      onMinimize: handleMinimize,
      onToggleMaximize: handleToggleMaximize,
      onClose: handleClose,
    }),
    [
      prefixCls,
      hashId,
      draggable,
      resizable,
      minimizable,
      maximizable,
      closable,
      open,
      centered,
      isMaximized,
      isMinimized,
      windowPosition,
      windowPositionRef,
      windowSize,
      isResizing,
      setWindowPosition,
      setWindowSize,
      setResizing,
      resetWindowPosition,
      resetWindowSize,
      handleMinimize,
      handleToggleMaximize,
      handleClose,
    ],
  );

  return wrapSSR(
    <ModalContext.Provider value={contextValue}>
      <AntdModal
        {...restProps}
        rootClassName={rootClassName}
        classNames={antdClassNames}
        destroyOnClose={resolvedDestroyOnClose}
        destroyOnHidden={resolvedDestroyOnHidden}
        width={modalWidth}
        centered={centered}
        open={open && !isMinimized}
        closable={false}
        modalRender={finalModalRender}
        onCancel={handleClose}
        style={mergedStyle}
        styles={mergedStyles}
        wrapClassName={clsx(wrapClassName, e('wrap'), hashId, {
          [em('wrap', 'constrained')]:
            draggable || Boolean(resizable) || isMaximized || !!windowSize,
        })}
        className={clsx(prefixCls, hashId, className, {
          [m('maximized')]: isMaximized,
          [m('manual-size')]: !!windowSize && !isMaximized,
          [m('resizing')]: isResizing,
          [m('draggable')]: draggable && !isMaximized,
          [m('resizable')]: Boolean(resizable) && !isMaximized,
          [m('transition-active')]: !isResizing,
        })}
        title={<ModalHeader title={title} />}
      >
        {children}
      </AntdModal>
      <MinimizedDock
        open={open}
        minimized={isMinimized}
        title={title}
        position={minimizePosition}
        className={minimizedDockClassName}
        style={minimizedDockStyle}
        locale={modalLocale}
        onRestore={handleRestore}
        onClose={handleClose}
      />
    </ModalContext.Provider>,
  );
});

/**
 * 组装静态方法到 memo 包装后的组件上。
 * destroyAll() 依次调用每个活跃实例的 handleClose。
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
