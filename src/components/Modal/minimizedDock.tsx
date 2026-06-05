import { CloseOutlined, ExpandOutlined } from '@ant-design/icons';
import { Button, Flex } from 'antd';
import { isFunction } from 'lodash-es';
import React, { memo } from 'react';
import { createPortal } from 'react-dom';
import Draggable from 'react-draggable';
import useDragBounds from '../../hooks/useDragBounds';
import { MinimizedDockProps, MinimizePosition } from './type';

//创建 Flex 容器防止多个最小化窗口重叠
const getMinimizeContainer = (
  position: MinimizePosition,
  prefixCls: string,
) => {
  const containerId = `${prefixCls}-minimize-container-${position}`;
  let container = document.getElementById(containerId);
  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    container.className = `${prefixCls}-minimize-dock-container ${prefixCls}-minimize-dock-${position}`;
    document.body.appendChild(container);
  }
  return container;
};

const MinimizedDock = memo((props: MinimizedDockProps) => {
  const {
    open,
    isMinimized,
    title,
    prefixCls,
    minimizePosition = 'top-right',
    onRestore,
    onClose,
  } = props;
  const { dragRef, bounds, onStart } = useDragBounds();

  const renderExpandOutlined = () => {
    return (
      <Button
        size="small"
        type="text"
        onClick={onRestore}
        icon={<ExpandOutlined />}
      />
    );
  };

  const renderCloseOutlined = () => {
    return (
      <Button
        size="small"
        type="text"
        onClick={onClose}
        icon={<CloseOutlined />}
      />
    );
  };
  if (!open || !isMinimized) return null;

  return createPortal(
    <Draggable
      nodeRef={dragRef}
      bounds={bounds}
      onStart={onStart}
      handle={`.${prefixCls}-minimized-header`}
    >
      <div className={`${prefixCls}-minimized-dock`} ref={dragRef}>
        <div className={`${prefixCls}-minimized-header`}>
          <div className={`${prefixCls}-title-text`}>
            {isFunction(title) ? title() : title}
          </div>
          <Flex
            gap={8}
            align="center"
            className={`${prefixCls}-minimized-actions`}
          >
            {renderExpandOutlined()}
            {renderCloseOutlined()}
          </Flex>
        </div>
      </div>
    </Draggable>,
    getMinimizeContainer(minimizePosition, prefixCls!),
  );
});

export default MinimizedDock;
