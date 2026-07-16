import React from 'react';
import type { TableContextValue } from './type';

/**
 * Table Context — 在 Table 组件树内部共享列配置与编辑状态
 */
const TableContext = React.createContext<TableContextValue>({
  columnWidths: {},
  onColumnWidthChange: () => {},
  visibleKeys: [],
  orderedKeys: [],
  editingCell: null,
  onStartEdit: () => {},
  onEndEdit: () => {},
  enableInlineEdit: false,
  onCellEdit: undefined,
  onColumnSearch: undefined,
});

export default TableContext;
