import clsx from 'clsx';
import React, { memo, useContext } from 'react';
import { useComponentNamespace } from '../../_util/namespace';
import { useColumnPointerResize } from '../hooks/useColumnPointerResize';
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

  const namespace = useComponentNamespace();
  const e = namespace.element;
  const context = useContext(TableContext);
  const { hashId } = context;
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
    <div
      className={clsx(e('header-cell'), hashId, context.classNames?.headerCell)}
      style={context.styles?.headerCell}
    >
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
          isResizing={isResizing}
          onPointerDown={handlePointerDown}
        />
      )}
    </CellComponent>
  );
}

export default memo(EnhancedHeaderCell) as typeof EnhancedHeaderCell;
