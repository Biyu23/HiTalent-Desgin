import { CloseOutlined, ExpandOutlined } from '@ant-design/icons';
import { Button, Flex } from 'antd';
import React, { memo, useEffect, useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Draggable from 'react-draggable';
import { useLocale } from '../../configProvider/useLocale';
import useDragBounds from '../../hooks/useDragBounds';
import { useModalContext } from './ModalContext';
import type { MinimizePosition } from './type';

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

/**
 * 获取已存在的 scroll wrapper 元素。
 * 每个容器内部包含一个 scroll wrapper 用于溢出滚动，
 * 所有 dock 通过 portal 渲染进 scroll wrapper 而非直接渲染进容器。
 */
const getExistingScrollWrapper = (
  position: MinimizePosition,
  prefixCls: string,
): HTMLElement | null => {
  if (typeof document === 'undefined') return null;
  const containerId = `${prefixCls}-minimize-container-${position}`;
  const container = document.getElementById(containerId);
  if (!container) return null;
  return container.querySelector(
    `.${prefixCls}-minimize-scroll-wrapper`,
  ) as HTMLElement | null;
};

/**
 * 确保容器及其 scroll wrapper 存在，返回 scroll wrapper。
 *
 * DOM 结构：
 *   container (position:fixed, pointer-events:none)
 *     └── scroll-wrapper (overflow-y:auto, pointer-events:auto)
 *           ├── dock-1  ← portal target
 *           ├── dock-2
 *           └── dock-N
 */
const ensureScrollWrapper = (
  position: MinimizePosition,
  prefixCls: string,
): HTMLElement | null => {
  if (typeof document === 'undefined') return null;
  const existing = getExistingScrollWrapper(position, prefixCls);
  if (existing) return existing;

  const containerId = `${prefixCls}-minimize-container-${position}`;
  const container = document.createElement('div');
  container.id = containerId;
  container.className = `${prefixCls}-minimize-dock-container ${prefixCls}-minimize-dock-${position}`;

  const scrollWrapper = document.createElement('div');
  scrollWrapper.className = `${prefixCls}-minimize-scroll-wrapper`;
  container.appendChild(scrollWrapper);

  document.body.appendChild(container);
  return scrollWrapper;
};

/** 内层实现：仅在 open && isMinimized 时渲染，可安全使用 hooks */
const MinimizedDockInner = memo(() => {
  const { title, prefixCls, minimizePosition, onRestore, onClose } =
    useModalContext();

  const { dragRef, bounds, onStart } = useDragBounds();
  const modalLocale = useLocale('Modal');
  const [scrollWrapperEl, setScrollWrapperEl] = useState<HTMLElement | null>(
    () => getExistingScrollWrapper(minimizePosition, prefixCls),
  );

  useLayoutEffect(() => {
    const el = ensureScrollWrapper(minimizePosition, prefixCls);
    if (el !== scrollWrapperEl) {
      setScrollWrapperEl(el);
    }
  }, [scrollWrapperEl, minimizePosition, prefixCls]);

  useEffect(() => {
    const containerId = `${prefixCls}-minimize-container-${minimizePosition}`;
    incrementRefCount(containerId);
    return () => {
      const remaining = decrementRefCount(containerId);
      if (remaining <= 0) {
        const container = document.getElementById(containerId);
        container?.remove();
      }
    };
  }, [prefixCls, minimizePosition]);

  if (!scrollWrapperEl) return null;

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
              aria-label={modalLocale.restore}
            />
            <Button
              size="small"
              type="text"
              onClick={onClose}
              icon={<CloseOutlined />}
              aria-label={modalLocale.close}
            />
          </Flex>
        </div>
      </div>
    </Draggable>,
    scrollWrapperEl,
  );
});

const MinimizedDock = memo(() => {
  const { open, isMinimized } = useModalContext();

  if (!open || !isMinimized) return null;
  return <MinimizedDockInner />;
});

export default MinimizedDock;
