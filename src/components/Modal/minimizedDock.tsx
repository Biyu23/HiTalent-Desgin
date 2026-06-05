import { CloseOutlined, ExpandOutlined } from '@ant-design/icons';
import { Button, Flex } from 'antd';
import React, { memo, useEffect, useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Draggable from 'react-draggable';
import useDragBounds from '../../hooks/useDragBounds';
import { MinimizedDockProps, MinimizePosition } from './type';

/**
 * 获取或创建最小化容器 DOM 节点。
 * 使用惰性初始化（仅读取）保证在并发模式下安全；
 * 实际的 DOM 写入在 useLayoutEffect 中完成。
 */
const getExistingContainer = (
  position: MinimizePosition,
  prefixCls: string,
): HTMLElement | null => {
  const containerId = `${prefixCls}-minimize-container-${position}`;
  return document.getElementById(containerId);
};

const createContainer = (
  position: MinimizePosition,
  prefixCls: string,
): HTMLElement => {
  const containerId = `${prefixCls}-minimize-container-${position}`;
  const container = document.createElement('div');
  container.id = containerId;
  container.className = `${prefixCls}-minimize-dock-container ${prefixCls}-minimize-dock-${position}`;
  document.body.appendChild(container);
  return container;
};

/** 内层实现：仅在 open && isMinimized 时渲染，可安全使用 hooks */
const MinimizedDockInner = memo((props: MinimizedDockProps) => {
  const {
    title,
    prefixCls,
    minimizePosition = 'bottom-right',
    onRestore,
    onClose,
  } = props;
  const { dragRef, bounds, onStart } = useDragBounds();
  const [containerEl, setContainerEl] = useState<HTMLElement | null>(() =>
    getExistingContainer(minimizePosition, prefixCls!),
  );

  useLayoutEffect(() => {
    if (!containerEl) {
      setContainerEl(createContainer(minimizePosition, prefixCls!));
    }
  }, [containerEl, minimizePosition, prefixCls]);

  if (!containerEl) return null;

  return createPortal(
    <Draggable
      nodeRef={dragRef}
      bounds={bounds}
      onStart={onStart}
      handle={`.${prefixCls}-minimized-header`}
    >
      <div className={`${prefixCls}-minimized-dock`} ref={dragRef}>
        <div className={`${prefixCls}-minimized-header`}>
          <div className={`${prefixCls}-title-text`}>{title}</div>
          <Flex
            gap={8}
            align="center"
            className={`${prefixCls}-minimized-actions`}
          >
            <Button
              size="small"
              type="text"
              onClick={onRestore}
              icon={<ExpandOutlined />}
              aria-label="还原"
            />
            <Button
              size="small"
              type="text"
              onClick={onClose}
              icon={<CloseOutlined />}
              aria-label="关闭"
            />
          </Flex>
        </div>
      </div>
    </Draggable>,
    containerEl,
  );
});

/** 外层：条件渲染，避免在不需要时运行 hooks */
const MinimizedDock = memo((props: MinimizedDockProps) => {
  const { open, isMinimized } = props;

  // 组件卸载时清理空容器
  const { prefixCls, minimizePosition = 'bottom-right' } = props;
  useEffect(() => {
    return () => {
      const containerId = `${prefixCls}-minimize-container-${minimizePosition}`;
      const container = document.getElementById(containerId);
      if (container && container.childElementCount === 0) {
        container.remove();
      }
    };
  }, [prefixCls, minimizePosition]);

  if (!open || !isMinimized) return null;
  return <MinimizedDockInner {...props} />;
});

export default MinimizedDock;
