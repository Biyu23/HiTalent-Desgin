import { CloseOutlined, ExpandOutlined } from '@ant-design/icons';
import { Button, Flex } from 'antd';
import React, { memo, useEffect, useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import ReactDraggable from 'react-draggable';
import { useLocale } from '../../../configProvider/useLocale';
import useDragBounds from '../../../hooks/useDragBounds';
import { useModalContext } from '../ModalContext';
import {
  decrementRefCount,
  ensureScrollWrapper,
  getExistingScrollWrapper,
  incrementRefCount,
} from '../utils/minimizedDockUtils';

const Draggable = ReactDraggable as any;

/**
 * 内层实现：仅在 open && isMinimized 时渲染，可安全使用 hooks。
 * 通过 createPortal 将 dock 渲染至全局 scroll wrapper 容器，
 * 支持拖拽移动、恢复和关闭操作。
 */
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

/**
 * 最小化悬浮窗入口。
 * 当弹窗处于 open && isMinimized 状态时，渲染 MinimizedDockInner 到
 * 全局固定定位的容器中（按 minimizePosition 分组）。
 */
const MinimizedDock = memo(() => {
  const { open, isMinimized } = useModalContext();

  if (!open || !isMinimized) return null;
  return <MinimizedDockInner />;
});

export default MinimizedDock;
