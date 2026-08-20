import clsx from 'clsx';
import React, { memo, useContext } from 'react';
import { useNamespace } from '../../../configProvider/usePrefixCls';
import { useColumnResize } from '../hooks/useColumnResize';
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

  const { e } = useNamespace('table');
  const context = useContext(TableContext);
  const { hashId } = context;
  const currentControlledWidth =
    context.columnWidths[columnId] ??
    (typeof column.width === 'number' && Number.isFinite(column.width)
      ? column.width
      : undefined);

  const { isResizing, handlePointerDown } = useColumnResize({
    columnId,
    minWidth: column.minWidth ?? 80,
    currentWidth: currentControlledWidth,
    onResize: context.onColumnWidthChange,
    onResizeEnd: context.onColumnResizeEnd,
  });

  const showResizeHandle = enableColumnResize && column.resizable !== false;

  const cellContent = (
    <div className={clsx(e('header-cell'), hashId)}>
      <span className={clsx(e('header-cell-title'), hashId)}>{children}</span>
    </div>
  );

  const wrappedContent = enableColumnDrag ? (
    <HeaderCellWrapper columnId={columnId}>{cellContent}</HeaderCellWrapper>
  ) : (
    cellContent
  );

  const mergedClassName = clsx(
    className,
    hashId,
    showResizeHandle ? e('resizable-th') : '',
  );

  return (
    <CellComponent className={mergedClassName} {...restThProps}>
      {wrappedContent}
      {showResizeHandle && (
        <ResizeHandle
          hashId={hashId}
          isResizing={isResizing}
          onPointerDown={handlePointerDown}
        />
      )}
    </CellComponent>
  );
}

export default memo(EnhancedHeaderCell) as typeof EnhancedHeaderCell;
