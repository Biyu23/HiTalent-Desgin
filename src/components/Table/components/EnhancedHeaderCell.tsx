import React, { memo, useContext } from 'react';
import { usePrefixCls } from '../../../configProvider/usePrefixCls';
import { useColumnResize } from '../hooks/useColumnResize';
import TableContext from '../TableContext';
import type { EnhancedColumnType } from '../type';
import ResizeHandle from './ResizeHandle';

interface EnhancedHeaderCellProps<RecordType = unknown>
  extends React.ThHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
  column: EnhancedColumnType<RecordType>;
  columnKey: string;
  enableColumnResize: boolean;
  enableColumnDrag: boolean;
  HeaderCellWrapper: React.FC<{
    children: React.ReactNode;
    columnKey: string;
  }>;
}

function EnhancedHeaderCell<RecordType = unknown>(
  props: EnhancedHeaderCellProps<RecordType>,
) {
  const {
    children,
    column,
    columnKey,
    enableColumnResize,
    enableColumnDrag,
    HeaderCellWrapper,
    className,
    ...restThProps
  } = props;

  const tablePrefixCls = usePrefixCls('table');
  const prefixCls = `${tablePrefixCls}-header-cell`;
  const context = useContext(TableContext);
  const currentControlledWidth =
    context.columnWidths[columnKey] ?? (column.width as number);

  // 列宽调整
  const { isResizing, handlePointerDown } = useColumnResize({
    columnKey,
    minWidth: column.minWidth ?? 80,
    currentWidth: currentControlledWidth,
    onResize: context.onColumnWidthChange,
    onResizeEnd: context.onColumnResizeEnd,
  });

  const showResizeHandle = enableColumnResize && column.resizable !== false;

  // 内部文字区域
  const cellContent = (
    <div className={prefixCls}>
      <span className={`${prefixCls}-title`}>{children}</span>
    </div>
  );

  // 拖拽包裹区域
  const wrappedContent = enableColumnDrag ? (
    <HeaderCellWrapper columnKey={columnKey}>{cellContent}</HeaderCellWrapper>
  ) : (
    cellContent
  );

  // 注入特定的样式类以控制 Antd 的分割线
  const mergedClassName = [
    className,
    showResizeHandle ? `${tablePrefixCls}-resizable-th` : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <th className={mergedClassName} {...restThProps}>
      {wrappedContent}
      {showResizeHandle && (
        <ResizeHandle
          isResizing={isResizing}
          onPointerDown={handlePointerDown}
        />
      )}
    </th>
  );
}

export default memo(EnhancedHeaderCell) as typeof EnhancedHeaderCell;
