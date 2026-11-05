import React from 'react';
import { useStyles } from '../style';
import type { TableColumnKey } from '../type';

interface SortableHeaderProps {
  columnKey: TableColumnKey;
  fixed: boolean;
  children: React.ReactNode;
}

/** 提供拖拽测量标记和光标，事件会话由表级 Provider 统一维护。 */
export default function SortableHeader({
  columnKey,
  fixed,
  children,
}: SortableHeaderProps) {
  const { styles } = useStyles();

  return (
    <div
      data-column-drag-key={columnKey}
      className={styles.dragContainer}
      style={{
        cursor: fixed ? 'default' : 'move',
      }}
    >
      {children}
    </div>
  );
}
