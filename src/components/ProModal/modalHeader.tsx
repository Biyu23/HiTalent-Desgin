import {
  CloseOutlined,
  CompressOutlined,
  ExpandOutlined,
  MinusOutlined,
} from '@ant-design/icons';
import { Button, Flex } from 'antd';
import clsx from 'clsx';
import { isFunction } from 'lodash-es';
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

  let element = isFunction(title) ? title() : title;
  const needCustomHeader = draggable || minimizable || maximizable || closable;

  const renderMinusOutlined = () => {
    if (!minimizable) return null;
    return (
      <Button
        size="small"
        type="text"
        onClick={onMinimize}
        icon={<MinusOutlined />}
      />
    );
  };

  const renderMaximizable = () => {
    if (!maximizable) return null;
    return (
      <Button
        size="small"
        type="text"
        onClick={onToggleMaximize}
        icon={isMaximized ? <CompressOutlined /> : <ExpandOutlined />}
      />
    );
  };

  const renderClosable = () => {
    if (!closable) return null;
    return (
      <Button
        size="small"
        type="text"
        onClick={onClose}
        icon={<CloseOutlined onClick={onClose} />}
      />
    );
  };

  const actions = [
    renderMinusOutlined(),
    renderMaximizable(),
    renderClosable(),
  ].filter((item) => item);

  if (!needCustomHeader) return <>{element}</>;

  return (
    <div
      className={clsx({
        [`${prefixCls}-header-wrapper`]: true,
        [`${prefixCls}-header-wrapper-draggable`]: draggable,
      })}
      onMouseOver={() =>
        draggable && !isMaximized && disabledDrag && setDisabledDrag(false)
      }
      onMouseOut={() => draggable && !disabledDrag && setDisabledDrag(true)}
    >
      <div className={`${prefixCls}-title-text`}>{element}</div>
      <Flex
        hidden={!!!actions.length}
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
