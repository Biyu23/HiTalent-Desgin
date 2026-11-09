import {
  CloseOutlined,
  CompressOutlined,
  ExpandOutlined,
  MinusOutlined,
} from '@ant-design/icons';
import { Button, Flex } from 'antd';
import React, { memo } from 'react';
import { useStyles } from '../style';
import type { ModalProps } from '../type';

export interface ModalHeaderProps {
  title?: React.ReactNode;
  draggable: boolean;
  minimizable: boolean;
  maximizable: boolean;
  isMaximized: boolean;
  showClose: boolean;
  closeIcon?: React.ReactNode;
  closeDisabled?: boolean;
  onMinimize: () => void;
  onToggleMaximize: () => void;
  onClose: ModalProps['onCancel'];
}

const ModalHeader = memo<ModalHeaderProps>(
  ({
    title,
    isMaximized,
    draggable,
    minimizable,
    maximizable,
    showClose,
    closeIcon,
    closeDisabled,
    onMinimize,
    onToggleMaximize,
    onClose,
  }) => {
    const { styles, cx } = useStyles();

    return (
      <div
        className={cx(styles.header, draggable && styles.headerDraggable)}
        onDoubleClick={maximizable ? onToggleMaximize : undefined}
      >
        <div className={styles.title}>{title}</div>
        {(minimizable || maximizable || showClose) && (
          <Flex
            className={styles.actions}
            data-modal-no-drag
            gap={8}
            align="center"
            onDoubleClick={(e) => e.stopPropagation()}
          >
            {minimizable && (
              <Button
                type="text"
                onClick={onMinimize}
                icon={<MinusOutlined />}
              />
            )}
            {maximizable && (
              <Button
                type="text"
                onClick={onToggleMaximize}
                icon={isMaximized ? <CompressOutlined /> : <ExpandOutlined />}
              />
            )}
            {showClose && (
              <Button
                type="text"
                disabled={closeDisabled}
                onClick={onClose}
                icon={closeIcon || <CloseOutlined />}
              />
            )}
          </Flex>
        )}
      </div>
    );
  },
);

export default ModalHeader;
