import {
  CloseOutlined,
  CompressOutlined,
  ExpandOutlined,
  MinusOutlined,
} from '@ant-design/icons';
import { Button, Flex } from 'antd';
import clsx from 'clsx';
import React, { memo, useEffect, useRef } from 'react';
import { useLocale } from '../../configProvider/useLocale';
import { useModalContext } from './ModalContext';

export interface ModalHeaderProps {
  /** 弹窗标题（ReactNode 以支持富文本标题） */
  title?: React.ReactNode;
  /** 自定义额外 className，用于覆盖或扩展默认样式 */
  className?: string;
}

/**
 * 全局 mouseup 监听器——多实例共享模式。
 *
 * 问题：如果每个 ModalHeader 独立注册 `window.addEventListener('mouseup', ...)`，
 * N 个弹窗实例会产生 N 个无意义的重复监听器。
 *
 * 方案：
 * 1. `GlobalMouseUpManager` 单例管理所有实例的 isMouseDownRef。
 * 2. `document` 上只维护一个全局 mouseup 处理器，遍历所有 ref 并重置。
 * 3. 实例挂载时注册 ref，卸载时注销；当 Set 为空时自动移除全局监听器。
 */
class GlobalMouseUpManager {
  private refs = new Set<React.MutableRefObject<boolean>>();
  private listener: (() => void) | null = null;

  register(ref: React.MutableRefObject<boolean>) {
    this.refs.add(ref);
    this.ensureListening();
  }

  unregister(ref: React.MutableRefObject<boolean>) {
    this.refs.delete(ref);
    if (this.refs.size === 0) {
      this.dispose();
    }
  }

  private ensureListening() {
    if (this.listener) return;
    this.listener = () => {
      this.refs.forEach((ref) => {
        if (ref.current) ref.current = false;
      });
    };
    document.addEventListener('mouseup', this.listener);
  }

  private dispose() {
    if (!this.listener) return;
    document.removeEventListener('mouseup', this.listener);
    this.listener = null;
  }
}

const globalMouseUpManager = new GlobalMouseUpManager();

/**
 * Modal 标题栏组件。
 *
 * 通过 useModalContext 自动获取父级 Modal 的所有共享状态与操作，
 * 无需手动传递 props，彻底消除 Props Drilling（props 从 10 个减至 2 个）。
 */
const ModalHeader = memo<ModalHeaderProps>(({ title, className }) => {
  const {
    prefixCls,
    isMaximized,
    disabledDrag,
    draggable,
    minimizable,
    maximizable,
    closable,
    onMinimize,
    onToggleMaximize,
    onClose,
    setDisabledDrag,
  } = useModalContext();

  const modalLocale = useLocale('Modal');

  const needCustomHeader = draggable || minimizable || maximizable || closable;

  // 追踪鼠标是否按在标题栏上，防止拖拽过程中 mouseLeave 误禁用拖拽
  const isMouseDownRef = useRef(false);

  useEffect(() => {
    globalMouseUpManager.register(isMouseDownRef);
    return () => {
      globalMouseUpManager.unregister(isMouseDownRef);
    };
  }, []);

  if (!needCustomHeader) return <>{title}</>;

  const actions = [
    minimizable && (
      <Button
        key="minimize"
        size="small"
        type="text"
        onClick={onMinimize}
        icon={<MinusOutlined />}
        aria-label={modalLocale.minimize}
      />
    ),
    maximizable && (
      <Button
        key="maximize"
        size="small"
        type="text"
        onClick={onToggleMaximize}
        icon={isMaximized ? <CompressOutlined /> : <ExpandOutlined />}
        aria-label={isMaximized ? modalLocale.unmaximize : modalLocale.maximize}
      />
    ),
    closable && (
      <Button
        key="close"
        size="small"
        type="text"
        onClick={onClose}
        icon={<CloseOutlined />}
        aria-label={modalLocale.close}
      />
    ),
  ].filter(Boolean);

  return (
    <div
      className={clsx(`${prefixCls}-header-wrapper`, className, {
        [`${prefixCls}-header-wrapper-draggable`]: draggable,
      })}
      role="button"
      aria-label={draggable ? modalLocale.dragHandle : undefined}
      aria-pressed={draggable && !disabledDrag}
      onMouseDown={() => {
        isMouseDownRef.current = true;
      }}
      onMouseEnter={() =>
        draggable && !isMaximized && disabledDrag && setDisabledDrag(false)
      }
      onMouseLeave={() =>
        draggable &&
        !isMaximized &&
        !disabledDrag &&
        !isMouseDownRef.current &&
        setDisabledDrag(true)
      }
    >
      <div className={`${prefixCls}-title-text`}>{title}</div>
      <Flex
        hidden={actions.length === 0}
        className={`${prefixCls}-header-actions`}
        gap={8}
        align="center"
        onClick={(e) => e.stopPropagation()}
      >
        {actions}
      </Flex>
    </div>
  );
});

export default ModalHeader;
