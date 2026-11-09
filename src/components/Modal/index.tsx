import { Modal as AntdModal } from 'antd';
import React, {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import { useLocale } from '../../configProvider/useLocale';
import { usePrefixCls } from '../../configProvider/usePrefixCls';
import MinimizedDock from '../_util/minimize/MinimizedDock';
import ModalHeader from './components/ModalHeader';
import ModalWindowWrapper from './components/ModalWindowWrapper';
import { ModalWindowContext, ModalWindowContextValue } from './contexts';
import { useModalState } from './hooks/useModalState';
import { useModalWindowState } from './hooks/useModalWindowState';
import { useStyles } from './style';
import type { ModalProps, ModalRef } from './type';

const Modal = forwardRef<ModalRef, ModalProps>((props, ref) => {
  const {
    prefixCls: customPrefixCls,
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
    minimizeStack,
    closable = true,
    closeIcon,
    className,
    rootClassName,
    wrapClassName,
    classNames,
    styles,
    children,
    onCancel,
    modalRender,
    onMinimizeChange,
    onMaximizedChange,
    ...restProps
  } = props;

  const nativeElementRef = useRef<HTMLDivElement>(null);
  const prefixCls = usePrefixCls('modal', customPrefixCls);
  const modalLocale = useLocale('Modal');
  const { styles: modalStyles, cx } = useStyles();

  const { minimizedDockClassName, antdClassNames } = useMemo(() => {
    const { minimizedDock, ...antdClassNames } = classNames ?? {};
    return { minimizedDockClassName: minimizedDock, antdClassNames };
  }, [classNames]);

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

  useEffect(() => {
    if (!open) handleReset();
  }, [open, handleReset]);

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
        return nativeElementRef.current;
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
      resetWindowPosition,
      resetWindowSize,
    ],
  );

  const finalModalRender = useCallback(
    (modalNode: React.ReactNode) => (
      <ModalWindowWrapper>
        <div ref={nativeElementRef}>
          {modalRender ? modalRender(modalNode) : modalNode}
        </div>
      </ModalWindowWrapper>
    ),
    [modalRender],
  );

  const { minimizedDockStyle, mergedStyles } = useMemo(() => {
    const { minimizedDock, ...antdStyles } = styles ?? {};
    return {
      minimizedDockStyle: minimizedDock,
      mergedStyles: {
        ...antdStyles,
        content: {
          ...antdStyles.content,
          ...(windowSize && !isMaximized && { height: windowSize.height }),
        },
      },
    };
  }, [styles, windowSize, isMaximized]);

  const windowValue: ModalWindowContextValue = useMemo(
    () => ({
      draggable,
      resizable,
      open,
      isMaximized,
      isMinimized,
      position: windowPosition,
      setPosition: setWindowPosition,
      setSize: setWindowSize,
      setResizing,
    }),
    [
      draggable,
      isMaximized,
      isMinimized,
      open,
      resizable,
      setResizing,
      setWindowPosition,
      setWindowSize,
      windowPosition,
    ],
  );

  const closeConfig = typeof closable === 'object' ? closable : undefined;
  const resolvedCloseIcon =
    closeConfig?.closeIcon !== undefined ? closeConfig.closeIcon : closeIcon;
  const showClose =
    closable !== false &&
    closeIcon !== false &&
    closeIcon !== null &&
    resolvedCloseIcon !== false &&
    resolvedCloseIcon !== null;
  const hasHeader =
    title !== null &&
    (title !== undefined ||
      minimizable ||
      maximizable ||
      draggable ||
      showClose);

  const resolvedTitle = hasHeader ? (
    <ModalHeader
      title={title}
      draggable={draggable}
      minimizable={minimizable}
      maximizable={maximizable}
      isMaximized={isMaximized}
      showClose={showClose}
      closeIcon={
        typeof resolvedCloseIcon === 'boolean' ? undefined : resolvedCloseIcon
      }
      closeDisabled={closeConfig?.disabled}
      onMinimize={handleMinimize}
      onToggleMaximize={handleToggleMaximize}
      onClose={handleClose}
    />
  ) : title === null ? null : undefined;

  return (
    <ModalWindowContext.Provider value={windowValue}>
      <AntdModal
        {...restProps}
        rootClassName={cx(prefixCls, rootClassName)}
        classNames={antdClassNames}
        // 恢复时也保持不销毁，避免 rc-dialog 在更新显示状态前卸载内容。
        destroyOnHidden={open ? false : destroyOnHidden}
        width={isMaximized ? '100%' : windowSize?.width ?? restProps.width}
        open={open && !isMinimized}
        closable={false}
        modalRender={finalModalRender}
        onCancel={handleClose}
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
  );
});

export default Object.assign(memo(Modal), {
  info: AntdModal.info,
  success: AntdModal.success,
  error: AntdModal.error,
  warning: AntdModal.warning,
  warn: AntdModal.warn,
  confirm: AntdModal.confirm,
  useModal: AntdModal.useModal,
  destroyAll: AntdModal.destroyAll,
});
