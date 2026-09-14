import {
  CloseOutlined,
  CompressOutlined,
  ExpandOutlined,
  MinusOutlined,
} from '@ant-design/icons';
import { Button, Flex } from 'antd';
import React, { memo } from 'react';
import { useModalOperations } from '../contexts';
import { useStyles } from '../style';
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
  } = useModalOperations();

  const { styles, cx } = useStyles();

  const {
    showClose,
    closeIcon: resolvedCloseIcon,
    disabled: closeDisabled,
  } = resolveClosable(closable, closeIcon);

  const actions = [
    minimizable && (
      <Button
        key="minimize"
        type="text"
        onClick={onMinimize}
        icon={<MinusOutlined />}
      />
    ),
    maximizable && (
      <Button
        key="maximize"
        type="text"
        onClick={onToggleMaximize}
        icon={isMaximized ? <CompressOutlined /> : <ExpandOutlined />}
      />
    ),
    showClose && (
      <Button
        key="close"
        type="text"
        disabled={closeDisabled}
        onClick={onClose}
        icon={resolvedCloseIcon || <CloseOutlined />}
      />
    ),
  ].filter(Boolean);

  return (
    <div
      className={cx(
        styles.header,
        draggable && styles.headerDraggable,
        className,
      )}
      onDoubleClick={maximizable ? onToggleMaximize : undefined}
    >
      <div className={styles.title}>{title}</div>
      {actions.length > 0 && (
        <Flex
          className={styles.actions}
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
