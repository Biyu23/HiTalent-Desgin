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
import { ModalHeaderProps } from './type';

const ModalHeader = memo((props: ModalHeaderProps) => {
  const {
    title,
    prefixCls,
    draggable,
    isMaximized,
    disabledDrag,
    setDisabledDrag,
    minimizable,
    maximizable,
    closable,
    onMinimize,
    onToggleMaximize,
    onClose,
  } = props;

  const modalLocale = useLocale('Modal');

  const needCustomHeader = draggable || minimizable || maximizable || closable;

  // 追踪鼠标是否按在标题栏上，防止拖拽过程中 mouseLeave 误禁用拖拽
  const isMouseDownRef = useRef(false);
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      isMouseDownRef.current = false;
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
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
      className={clsx({
        [`${prefixCls}-header-wrapper`]: true,
        [`${prefixCls}-header-wrapper-draggable`]: draggable,
      })}
      role="button"
      aria-pressed={draggable && !disabledDrag}
      onMouseDown={() => {
        isMouseDownRef.current = true;
      }}
      onMouseEnter={() =>
        draggable && !isMaximized && disabledDrag && setDisabledDrag?.(false)
      }
      onMouseLeave={() =>
        draggable &&
        !isMaximized &&
        !disabledDrag &&
        !isMouseDownRef.current &&
        setDisabledDrag?.(true)
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
