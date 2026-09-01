import { CloseOutlined, ExpandOutlined } from '@ant-design/icons';
import { Button, Flex } from 'antd';
import React, { memo } from 'react';
import { useStackStyles } from '../style';
import type { DockItem } from '../type';

export interface DockCardProps {
  item: DockItem;
  interactive: boolean;
  draggable: boolean;
  elevated?: boolean;
  count?: number;
}

export const DockCard = memo<DockCardProps>(
  ({ item, interactive, draggable, elevated, count }) => {
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
          className={cx(
            styles.header,
            !draggable && styles.headerStatic,
            !interactive && styles.cardContentHidden,
          )}
        >
          <Flex align="center" className={styles.title}>
            <span className={styles.titleText}>{item.title}</span>
            {count !== undefined && (
              <span className={styles.badge}>{count}</span>
            )}
          </Flex>
          <Flex gap={8} align="center" className={styles.actions}>
            <Button
              size="small"
              type="text"
              tabIndex={interactive ? undefined : -1}
              onClick={item.onRestore}
              icon={<ExpandOutlined />}
            />
            <Button
              size="small"
              type="text"
              tabIndex={interactive ? undefined : -1}
              onClick={item.onClose}
              icon={<CloseOutlined />}
            />
          </Flex>
        </div>
      </div>
    );
  },
);

export default DockCard;
