import { Modal as AntdModal } from 'antd';
import clsx from 'clsx';
import React, { memo, useCallback, useEffect, useState } from 'react';
import Draggable from 'react-draggable';
import { usePrefixCls } from '../../configProvider/usePrefixCls';
import useDragBounds from '../../hooks/useDragBounds';
import './index.less';
import MinimizedDock from './minimizedDock';
import ModalHeader from './modalHeader';
import { ModalProps } from './type';

const Modal: React.FC<ModalProps> = (props) => {
  const {
    open,
    title,
    modalRender,
    draggable = false,
    minimizable = false,
    maximizable = false,
    minimizePosition = 'bottom-right',
    closable = true,
    onCancel,
    className,
    children,
    ...restProps
  } = props;

  const prefixCls = usePrefixCls('modal');
  //最大化
  const [isMaximized, setIsMaximized] = useState(false);
  //最小化
  const [isMinimized, setIsMinimized] = useState(false);
  //拖拽
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

  const handleClose = (e: React.MouseEvent<HTMLElement>) => {
    setIsMinimized(false);
    setIsMaximized(false);
    onCancel?.(e as React.MouseEvent<HTMLButtonElement>);
  };

  const customModalRender = useCallback(
    (modalNode: React.ReactNode) => {
      if (!draggable || isMaximized)
        return modalRender ? modalRender(modalNode) : modalNode;
      return (
        <Draggable
          disabled={disabledDrag}
          bounds={modalBounds}
          nodeRef={modalDragRef}
          onStart={onModalDragStart}
        >
          <div ref={modalDragRef} className={`${prefixCls}-draggable-wrapper`}>
            {modalRender ? modalRender(modalNode) : modalNode}
          </div>
        </Draggable>
      );
    },
    [
      draggable,
      isMaximized,
      disabledDrag,
      modalBounds,
      modalDragRef,
      onModalDragStart,
      modalRender,
      prefixCls,
    ],
  );

  return (
    <>
      <AntdModal
        {...restProps}
        open={open && !isMinimized}
        closable={false}
        modalRender={customModalRender}
        onCancel={handleClose}
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
            onMinimize={() => {
              setIsMinimized(true);
              setIsMaximized(false);
            }}
            onToggleMaximize={() => setIsMaximized(!isMaximized)}
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
        onRestore={() => setIsMinimized(false)}
        onClose={handleClose}
      />
    </>
  );
};
export default memo(Modal);
