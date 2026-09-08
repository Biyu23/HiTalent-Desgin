import React, { memo, useContext } from 'react';
import { ColumnDragContext } from '../columnDrag/ColumnDragProvider';
import SortableHeader from '../columnDrag/SortableHeader';
import { useColumnResize } from '../hooks/useColumnResize';
import type { ColumnMeta } from '../internal';
import { useStyles } from '../style';
import TableContext from '../TableContext';
import ResizeHandle from './ResizeHandle';

interface EnhancedHeaderCellProps<RecordType>
  extends React.ThHTMLAttributes<HTMLTableCellElement> {
  meta: ColumnMeta<RecordType>;
  resizeEnabled: boolean;
  dragEnabled: boolean;
  cellComponent?: React.ElementType;
}

function EnhancedHeaderCell<RecordType>({
  meta,
  resizeEnabled,
  dragEnabled,
  cellComponent: Cell = 'th',
  className,
  children,
  ...cellProps
}: EnhancedHeaderCellProps<RecordType>) {
  const context = useContext(TableContext);
  const drag = useContext(ColumnDragContext);
  const { styles, cx } = useStyles();
  const resize = useColumnResize({
    columnKey: meta.key,
    minWidth: meta.column.minWidth,
    onResize: context.previewColumnWidth,
    onResizeEnd: context.commitColumnWidth,
    onCancel: context.cancelColumnPreview,
  });
  const canResize = resizeEnabled && meta.resizable;
  const content = (
    <div className={cx(styles.headerCell, context.classNames?.headerCell)}>
      <span className={styles.headerCellTitle}>{children}</span>
    </div>
  );

  return (
    <Cell
      {...cellProps}
      onPointerDown={(event: React.PointerEvent<HTMLElement>) => {
        cellProps.onPointerDown?.(
          event as React.PointerEvent<HTMLTableCellElement>,
        );
        if (dragEnabled && !event.defaultPrevented) drag.start(event, meta.key);
      }}
      onClickCapture={(event: React.MouseEvent<HTMLTableCellElement>) => {
        if (dragEnabled && drag.consumeClick()) {
          event.preventDefault();
          event.stopPropagation();
        } else cellProps.onClickCapture?.(event);
      }}
      data-table-column-key={dragEnabled ? meta.key : undefined}
      data-table-column-fixed={meta.column.fixed ? '' : undefined}
      className={cx(className, canResize && styles.resizableHeader)}
    >
      {dragEnabled ? (
        <SortableHeader columnKey={meta.key} fixed={Boolean(meta.column.fixed)}>
          {content}
        </SortableHeader>
      ) : (
        content
      )}
      {canResize ? (
        <ResizeHandle
          disabled={drag.activeKey !== null}
          active={resize.resizing}
          onPointerDown={resize.onPointerDown}
        />
      ) : null}
    </Cell>
  );
}

export default memo(EnhancedHeaderCell) as typeof EnhancedHeaderCell;
