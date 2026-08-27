import React, { memo, useContext } from 'react';
import { useColumnPointerResize } from '../hooks/useColumnPointerResize';
import { useStyles } from '../style';
import TableContext from '../TableContext';
import type { EnhancedLeafColumnType } from '../type';
import ResizeHandle from './ResizeHandle';

interface EnhancedHeaderCellProps<RecordType = unknown>
  extends React.ThHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
  column: EnhancedLeafColumnType<RecordType>;
  columnId: string;
  enableColumnResize: boolean;
  enableColumnDrag: boolean;
  HeaderCellWrapper: React.FC<{
    children: React.ReactNode;
    columnId: string;
  }>;
  cellComponent?: React.ElementType;
}

function EnhancedHeaderCell<RecordType = unknown>(
  props: EnhancedHeaderCellProps<RecordType>,
) {
  const {
    children,
    column,
    columnId,
    enableColumnResize,
    enableColumnDrag,
    HeaderCellWrapper,
    cellComponent: CellComponent = 'th',
    className,
    ...restThProps
  } = props;

  const context = useContext(TableContext);
  const { styles, cx } = useStyles();

  const currentControlledWidth =
    context.columnWidths[columnId] ??
    (typeof column.width === 'number' && Number.isFinite(column.width)
      ? column.width
      : undefined);

  const { isResizing, handlePointerDown } = useColumnPointerResize({
    columnId,
    minWidth: column.minWidth ?? 80,
    currentWidth: currentControlledWidth,
    onResize: context.onColumnWidthChange,
    onResizeEnd: context.onColumnResizeEnd,
  });

  const showResizeHandle = enableColumnResize && column.resizable !== false;

  const cellContent = (
    <div className={cx(styles.headerCell, context.classNames?.headerCell)}>
      <span className={styles.headerCellTitle}>{children}</span>
    </div>
  );

  const wrappedContent = enableColumnDrag ? (
    <HeaderCellWrapper columnId={columnId}>{cellContent}</HeaderCellWrapper>
  ) : (
    cellContent
  );

  const mergedClassName = cx(className, showResizeHandle && 'resizable-th');

  return (
    <CellComponent className={mergedClassName} {...restThProps}>
      {wrappedContent}
      {showResizeHandle && (
        <ResizeHandle
          isResizing={isResizing}
          onPointerDown={handlePointerDown}
        />
      )}
    </CellComponent>
  );
}

export default memo(EnhancedHeaderCell) as typeof EnhancedHeaderCell;
