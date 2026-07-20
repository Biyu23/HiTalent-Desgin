import React, { memo, useCallback, useContext } from 'react';
import { usePrefixCls } from '../../../configProvider/usePrefixCls';
import { useColumnResize } from '../hooks/useColumnResize';
import TableContext from '../TableContext';
import type { EnhancedColumnType } from '../type';
import ResizeHandle from './ResizeHandle';
import SearchIcon from './SearchIcon';

interface EnhancedHeaderCellProps<RecordType = any> {
  children: React.ReactNode;
  column: EnhancedColumnType<RecordType>;
  columnKey: string;
  enableColumnResize: boolean;
}

/**
 * EnhancedHeaderCell — 增强表头 Cell
 *
 * 在 antd 原生 th 基础上叠加：
 * - 列宽拖拽手柄（ResizeHandle）
 * - 搜索图标（SearchIcon）
 * - 列拖拽手柄 handle 渲染（由 useColumnDrag HeaderCellWrapper 注入）
 */
function EnhancedHeaderCell<RecordType = any>(
  props: EnhancedHeaderCellProps<RecordType>,
) {
  const { children, column, columnKey, enableColumnResize } = props;
  const prefixCls = usePrefixCls('table-header-cell');
  const context = useContext(TableContext);

  // 列宽调整
  const { isResizing, handleMouseDown } = useColumnResize({
    columnKey,
    minWidth: column.minWidth ?? 80,
    onResize: context.onColumnWidthChange,
  });

  const showResizeHandle = enableColumnResize && column.resizable !== false;

  const showSearch = column.searchable === true;

  // 搜索回调：从 context 获取 onColumnSearch
  const handleSearch = useCallback(
    (_colKey: string, _searchText: string) => {
      context.onColumnSearch?.(_colKey, _searchText);
    },
    [context.onColumnSearch],
  );

  return (
    <div className={prefixCls}>
      {/* 搜索图标（左边） */}
      {showSearch && (
        <SearchIcon
          columnKey={columnKey}
          placeholder={column.searchPlaceholder}
          onSearch={handleSearch}
        />
      )}

      {/* 列头文字区域 */}
      <span className={`${prefixCls}-title`}>{children}</span>

      {/* 列宽调整手柄（右边） */}
      {showResizeHandle && (
        <ResizeHandle isResizing={isResizing} onMouseDown={handleMouseDown} />
      )}
    </div>
  );
}

export default memo(EnhancedHeaderCell) as typeof EnhancedHeaderCell;
