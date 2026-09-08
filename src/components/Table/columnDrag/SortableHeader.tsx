import React from 'react';
import { useStyles } from '../style';
import type { TableColumnKey } from '../type';

interface SortableHeaderProps {
  columnKey: TableColumnKey;
  fixed: boolean;
  children: React.ReactNode;
}

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
        touchAction: fixed ? undefined : 'none',
      }}
    >
      {children}
    </div>
  );
}
