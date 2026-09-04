import { Modal as AntdModal } from 'antd';
import React, {
  forwardRef,
  memo,
  useCallback,
  useImperativeHandle,
  useMemo,
} from 'react';
import { useLocale } from '../../configProvider/useLocale';
import { usePrefixCls } from '../../configProvider/usePrefixCls';
import MinimizedDock from '../_util/minimize/MinimizedDock';
import ModalHeader from './components/ModalHeader';
import ModalWindowWrapper from './components/ModalWindowWrapper';
import {
  ModalOperationsContext,
  ModalOperationsContextValue,
  ModalWindowContext,
  ModalWindowContextValue,
} from './contexts';
import { useModalState } from './hooks/useModalState';
import { useModalWindowState } from './hooks/useModalWindowState';
import { useStyles } from './style';
import type { ModalProps, ModalRef, ModalStaticMethods } from './type';
import { shouldRenderHeader } from './utils/header';

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
    minimizeStack,
    closable = true,
    closeIcon,
    className,
    rootClassName,
    wrapClassName,
    classNames,
    styles,
    style,
    centered = false,
    maskClosable,
    children,
    onCancel,
    modalRender,
    onMinimizeChange,
    onMaximizedChange,
    ...restProps
  } = props;

  const prefixCls = usePrefixCls('modal', customPrefixCls);
  const modalLocale = useLocale('Modal');
  const { styles: modalStyles, cx } = useStyles(prefixCls);

  const minimizedDockClassName = classNames?.minimizedDock;
  const minimizedDockStyle = styles?.minimizedDock;

  const antdClassNames = useMemo(() => {
    if (!classNames) return undefined;
    const next = { ...classNames } as Record<string, string | undefined>;
    delete next.title;
    delete next.actions;
    delete next.resizeHandle;
    delete next.minimizedDock;
    return next;
  }, [classNames]);

  const antdStyles = useMemo(() => {
    if (!styles) return undefined;
    const next = { ...styles } as Record<
      string,
      React.CSSProperties | undefined
    >;
    delete next.resizeHandle;
    delete next.minimizedDock;
    return next;
  }, [styles]);

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
    size: windowSize,
    isResizing,
    setPosition: setWindowPosition,
    setSize: setWindowSize,
    setResizing,
    resetPosition: resetWindowPosition,
    resetSize: resetWindowSize,
  } = useModalWindowState();

  // 最小化模式下隐藏时保留 DOM，防止表单数据丢失；彻底关闭时遵循传入配置
  const resolvedDestroyOnHidden = isMinimized
    ? false
    : destroyOnHidden ?? destroyOnClose;

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

  useImperativeHandle(
    ref,
    () => ({
      get nativeElement() {
        if (typeof document === 'undefined') return null;
        return (
          (document.querySelector(`.${prefixCls}`) as HTMLDivElement) || null
        );
      },
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
      prefixCls,
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

  const operationsValue: ModalOperationsContextValue = useMemo(
    () => ({
      draggable,
      minimizable,
      maximizable,
      closable,
      closeIcon,
      isMaximized,
      onMinimize: handleMinimize,
      onToggleMaximize: handleToggleMaximize,
      onClose: handleClose,
      classNames,
      styles,
    }),
    [
      draggable,
      minimizable,
      maximizable,
      closable,
      closeIcon,
      isMaximized,
      handleMinimize,
      handleToggleMaximize,
      handleClose,
      classNames,
      styles,
    ],
  );

  const windowValue: ModalWindowContextValue = useMemo(
    () => ({
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
    }),
    [
      classNames,
      draggable,
      isMaximized,
      isMinimized,
      isResizing,
      open,
      resizable,
      setResizing,
      setWindowPosition,
      setWindowSize,
      styles,
      windowPosition,
    ],
  );

  const hasHeader = shouldRenderHeader({
    title,
    minimizable,
    maximizable,
    draggable,
    closable,
    closeIcon,
  });

  const resolvedTitle = hasHeader ? (
    <ModalHeader title={title} />
  ) : title === null ? null : undefined;

  return (
    <ModalOperationsContext.Provider value={operationsValue}>
      <ModalWindowContext.Provider value={windowValue}>
        <AntdModal
          {...restProps}
          maskClosable={maskClosable}
          rootClassName={cx(prefixCls, rootClassName)}
          classNames={antdClassNames}
          destroyOnHidden={resolvedDestroyOnHidden}
          width={modalWidth}
          centered={centered}
          open={open && !isMinimized}
          closable={false}
          modalRender={finalModalRender}
          onCancel={handleClose}
          style={mergedStyle}
          styles={mergedStyles}
          wrapClassName={cx(wrapClassName, {
            [modalStyles.wrapConstrained]:
              draggable || Boolean(resizable) || isMaximized || !!windowSize,
          })}
          className={cx(prefixCls, modalStyles.root, className, {
            maximized: isMaximized,
            'manual-size': !!windowSize && !isMaximized,
            resizing: isResizing,
            draggable: draggable && !isMaximized,
            resizable: Boolean(resizable) && !isMaximized,
            'transition-active': !isResizing,
          })}
          title={resolvedTitle}
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
          stack={minimizeStack}
          locale={modalLocale}
          onRestore={handleRestore}
          onClose={handleClose}
        />
      </ModalWindowContext.Provider>
    </ModalOperationsContext.Provider>
  );
});

type CompoundedModal = React.MemoExoticComponent<
  React.ForwardRefExoticComponent<ModalProps & React.RefAttributes<ModalRef>>
> &
  ModalStaticMethods;

const ModalWithStatics = memo(Modal) as CompoundedModal;

ModalWithStatics.info = AntdModal.info;
ModalWithStatics.success = AntdModal.success;
ModalWithStatics.error = AntdModal.error;
ModalWithStatics.warning = AntdModal.warning;
ModalWithStatics.warn = AntdModal.warn;
ModalWithStatics.confirm = AntdModal.confirm;
ModalWithStatics.useModal = AntdModal.useModal;
ModalWithStatics.destroyAll = AntdModal.destroyAll;
ModalWithStatics.config = AntdModal.config;

export default ModalWithStatics;
