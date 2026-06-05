import {
  CloseOutlined,
  CompressOutlined,
  ExpandOutlined,
  MinusOutlined,
} from '@ant-design/icons';
import { Button, Flex } from 'antd';
import clsx from 'clsx';
import React, { memo } from 'react';
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

  const needCustomHeader = draggable || minimizable || maximizable || closable;

  if (!needCustomHeader) return <>{title}</>;

  const actions = [
    minimizable && (
      <Button
        key="minimize"
        size="small"
        type="text"
        onClick={onMinimize}
        icon={<MinusOutlined />}
        aria-label="最小化"
      />
    ),
    maximizable && (
      <Button
        key="maximize"
        size="small"
        type="text"
        onClick={onToggleMaximize}
        icon={isMaximized ? <CompressOutlined /> : <ExpandOutlined />}
        aria-label={isMaximized ? '还原' : '最大化'}
      />
    ),
    closable && (
      <Button
        key="close"
        size="small"
        type="text"
        onClick={onClose}
        icon={<CloseOutlined />}
        aria-label="关闭"
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
      onMouseOver={() =>
        draggable && !isMaximized && disabledDrag && setDisabledDrag?.(false)
      }
      onMouseOut={() => draggable && !disabledDrag && setDisabledDrag?.(true)}
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
