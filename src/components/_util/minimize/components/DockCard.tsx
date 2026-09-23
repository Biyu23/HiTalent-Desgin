import { CloseOutlined, ExpandOutlined } from '@ant-design/icons';
import { Button, Flex } from 'antd';
import React, { memo, useRef } from 'react';
import { useStackStyles } from '../style';
import type { DockItem } from '../type';

export interface DockCardProps {
  item: DockItem;
  entering: boolean;
  interactive: boolean;
  draggable: boolean;
  elevated?: boolean;
  count?: number;
}

export const DockCard = memo<DockCardProps>(
  ({ item, entering, interactive, draggable, elevated, count }) => {
    const { styles, cx } = useStackStyles();
    // 入场资格固定在本次挂载，后续更新不打断正在播放的动画。
    const enteringRef = useRef(entering);

    return (
      <div
        className={cx(
          styles.stackCard,
          elevated && styles.stackCardElevated,
          item.className,
        )}
        style={{
          ...item.style,
          ...(!enteringRef.current && { animation: 'none' }),
        }}
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
