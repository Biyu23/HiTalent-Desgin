import { CloseOutlined, ExpandOutlined } from '@ant-design/icons';
import { Button, Flex } from 'antd';
import React, { memo } from 'react';
import { useStackStyles } from '../style';
import type { DockItem } from '../type';

export interface DockCardProps {
  item: DockItem;
  draggable: boolean;
  elevated?: boolean;
  count?: number;
}

export const DockCard = memo<DockCardProps>(
  ({ item, draggable, elevated, count }) => {
    const { styles, cx } = useStackStyles();

    return (
      <div
        className={cx(
          styles.stackCard,
          elevated && styles.stackCardElevated,
          item.className,
        )}
        style={item.style}
      >
        <div
          className={cx(styles.header, !draggable && styles.headerStatic)}
          role="group"
          aria-label={item.locale.minimizedDockDragHandle}
        >
          <Flex align="center" className={styles.title}>
            <span className={styles.titleText}>{item.title}</span>
            {count !== undefined && (
              <span
                className={styles.badge}
                aria-label={`${item.locale.minimizedDockLabel}: ${count}`}
              >
                {count}
              </span>
            )}
          </Flex>
          <Flex gap={8} align="center" className={styles.actions}>
            <Button
              size="small"
              type="text"
              onClick={item.onRestore}
              icon={<ExpandOutlined />}
              aria-label={item.locale.restore}
            />
            <Button
              size="small"
              type="text"
              onClick={item.onClose}
              icon={<CloseOutlined />}
              aria-label={item.locale.close}
            />
          </Flex>
        </div>
      </div>
    );
  },
);

export default DockCard;
