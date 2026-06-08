import { CloseOutlined, ExpandOutlined } from '@ant-design/icons';
import { Button, Flex } from 'antd';
import React, { memo, useEffect, useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Draggable from 'react-draggable';
import useDragBounds from '../../hooks/useDragBounds';
import { MinimizedDockProps, MinimizePosition } from './type';

/**
 * 容器引用计数表：追踪每个容器中挂载的 dock 实例数量。
 * 当计数归零时才真正移除 DOM 节点，避免 React 并发模式下
 * 多个实例同时卸载时的竞态条件。
 */
const containerRefCount = new Map<string, number>();

const incrementRefCount = (containerId: string): void => {
  containerRefCount.set(
    containerId,
    (containerRefCount.get(containerId) || 0) + 1,
  );
};

const decrementRefCount = (containerId: string): number => {
  const next = (containerRefCount.get(containerId) || 1) - 1;
  if (next <= 0) {
    containerRefCount.delete(containerId);
    return 0;
  }
  containerRefCount.set(containerId, next);
  return next;
};

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

  // 挂载时增加引用计数，卸载时减少
  useEffect(() => {
    const containerId = `${prefixCls}-minimize-container-${minimizePosition}`;
    incrementRefCount(containerId);
    return () => {
      const remaining = decrementRefCount(containerId);
      if (remaining <= 0) {
        const container = document.getElementById(containerId);
        if (container) {
          container.remove();
        }
      }
    };
  }, [prefixCls, minimizePosition]);

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

  if (!open || !isMinimized) return null;
  return <MinimizedDockInner {...props} />;
});

export default MinimizedDock;
