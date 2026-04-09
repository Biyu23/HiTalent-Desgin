import { Modal } from 'antd';
import clsx from 'clsx';
import { usePrefixCls } from 'myui/configProvider/usePrefixCls';
import useDragBounds from 'myui/hooks/useDragBounds';
import React, { memo, useState } from 'react';
import Draggable from 'react-draggable';
import './index.less';
import MinimizedDock from './minimizedDock';
import ModalHeader from './modalHeader';
import { ProModalProps } from './type';

const ProModal: React.FC<ProModalProps> = (props) => {
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

  const prefixCls = usePrefixCls('pro-modal');
  //最大化
  const [isMaximized, setIsMaximized] = useState(false);
  //最小化
  const [isMinimized, setIsMinimized] = useState(false);
  //拖拽
  const [disabledDrag, setDisabledDrag] = useState(!draggable);

  const {
    dragRef: modalDragRef,
    bounds: modalBounds,
    onStart: onModalDragStart,
  } = useDragBounds();

  // 处理关闭
  const handleClose = (e: React.MouseEvent<any>) => {
    setIsMinimized(false);
    setIsMaximized(false);
    onCancel?.(e as any);
  };

  const customModalRender = (modalNode: React.ReactNode) => {
    const node = modalRender ? modalRender(modalNode) : modalNode;
    //如果没有开启拖拽 或者 已经最大化了不允许拖拽
    if (!draggable || isMaximized) return node;
    return (
      <Draggable
        disabled={disabledDrag}
        bounds={modalBounds}
        nodeRef={modalDragRef}
        onStart={onModalDragStart}
      >
        <div ref={modalDragRef} className={`${prefixCls}-draggable-wrapper`}>
          {node}
        </div>
      </Draggable>
    );
  };

  return (
    <>
      <Modal
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
      </Modal>
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
export default memo(ProModal);
