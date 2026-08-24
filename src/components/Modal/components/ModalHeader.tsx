import {
  CloseOutlined,
  CompressOutlined,
  ExpandOutlined,
  MinusOutlined,
} from '@ant-design/icons';
import { Button, Flex } from 'antd';
import clsx from 'clsx';
import React, { memo } from 'react';
import { useLocale } from '../../../configProvider/useLocale';
import { useComponentNamespace } from '../../_util/namespace';
import { useModalOperations } from '../contexts';
import { resolveClosable } from '../utils/header';

export interface ModalHeaderProps {
  /** 弹窗标题（ReactNode 以支持富文本标题） */
  title?: React.ReactNode;
  /** 自定义额外 className，用于覆盖或扩展默认样式 */
  className?: string;
}

const ModalHeader = memo<ModalHeaderProps>(({ title, className }) => {
  const {
    isMaximized,
    draggable,
    minimizable,
    maximizable,
    closable,
    closeIcon,
    onMinimize,
    onToggleMaximize,
    onClose,
    classNames,
  } = useModalOperations();

  const namespace = useComponentNamespace();
  const e = namespace.element;
  const em = namespace.elementModifier;
  const modalLocale = useLocale('Modal');

  const {
    showClose,
    closeIcon: resolvedCloseIcon,
    disabled: closeDisabled,
    ariaLabel: closeAriaLabel,
  } = resolveClosable(closable, closeIcon);

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
    showClose && (
      <Button
        key="close"
        size="small"
        type="text"
        disabled={closeDisabled}
        onClick={onClose}
        icon={resolvedCloseIcon || <CloseOutlined />}
        aria-label={closeAriaLabel}
      />
    ),
  ].filter(Boolean);

  return (
    <div
      className={clsx(e('header'), namespace.hashId, className, {
        [em('header', 'draggable')]: draggable,
      })}
      onDoubleClick={maximizable ? onToggleMaximize : undefined}
    >
      <div className={clsx(e('title'), namespace.hashId, classNames?.title)}>
        {title}
      </div>
      {actions.length > 0 && (
        <Flex
          className={clsx(e('actions'), namespace.hashId, classNames?.actions)}
          data-modal-no-drag
          gap={8}
          align="center"
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          onDoubleClick={(e) => e.stopPropagation()}
        >
          {actions}
        </Flex>
      )}
    </div>
  );
});

export default ModalHeader;
