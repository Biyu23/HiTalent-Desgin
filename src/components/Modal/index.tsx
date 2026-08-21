import { Modal as AntdModal } from 'antd';
import clsx from 'clsx';
import React, {
  forwardRef,
  memo,
  useCallback,
  useContext,
  useImperativeHandle,
  useMemo,
} from 'react';
import { ConfigContext } from '../../configProvider/context';
import { useLocale } from '../../configProvider/useLocale';
import { usePrefixCls } from '../../configProvider/usePrefixCls';
import MinimizedDock from '../_util/minimize/MinimizedDock';
import {
  ComponentNamespaceProvider,
  useResolvedComponentNamespace,
} from '../_util/namespace';
import { useSemanticRootStyle } from '../_util/useSemanticRootStyle';
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
import { useStyle } from './style';
import type { ModalProps, ModalRef, ModalStaticMethods } from './type';

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

  const prefixCls = usePrefixCls('modal', customPrefixCls);
  const { antdPrefixCls } = useContext(ConfigContext);
  const modalLocale = useLocale('Modal');
  const { wrapSSR, hashId } = useStyle(prefixCls, antdPrefixCls);
  const namespace = useResolvedComponentNamespace(
    'modal',
    customPrefixCls,
    hashId,
  );
  const { element: e, modifier: m, elementModifier: em } = namespace;
  const semanticRoot = useSemanticRootStyle('Modal', prefixCls, styles?.root);

  const minimizedDockClassName = classNames?.minimizedDock;
  const minimizedDockStyle = styles?.minimizedDock;
  const antdClassNames = useMemo(
    () => ({
      mask: classNames?.mask,
      wrapper: classNames?.wrapper,
      content: classNames?.content,
      body: classNames?.body,
      footer: classNames?.footer,
    }),
    [classNames],
  );
  const antdStyles = useMemo(
    () => ({
      mask: styles?.mask,
      wrapper: styles?.wrapper,
      content: styles?.content,
      body: styles?.body,
      footer: styles?.footer,
    }),
    [styles],
  );

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

  const operationsValue: ModalOperationsContextValue = useMemo(
    () => ({
      draggable,
      minimizable,
      maximizable,
      closable,
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

  return semanticRoot.wrapSSR(
    wrapSSR(
      <ComponentNamespaceProvider value={namespace}>
        <ModalOperationsContext.Provider value={operationsValue}>
          <ModalWindowContext.Provider value={windowValue}>
            <AntdModal
              {...restProps}
              rootClassName={clsx(
                prefixCls,
                hashId,
                rootClassName,
                classNames?.root,
                semanticRoot.className,
              )}
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
                  draggable ||
                  Boolean(resizable) ||
                  isMaximized ||
                  !!windowSize,
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
          </ModalWindowContext.Provider>
        </ModalOperationsContext.Provider>
      </ComponentNamespaceProvider>,
    ),
  );
});

const ModalWithStatics: React.MemoExoticComponent<
  React.ForwardRefExoticComponent<ModalProps & React.RefAttributes<ModalRef>>
> &
  ModalStaticMethods = memo(Modal) as unknown as React.MemoExoticComponent<
  React.ForwardRefExoticComponent<ModalProps & React.RefAttributes<ModalRef>>
> &
  ModalStaticMethods;

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
