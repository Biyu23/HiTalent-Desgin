import React from 'react';
import type { TableContextValue } from './type';

/**
 * Table Context — 在 Table 组件树内部共享列配置状态
 */
const TableContext = React.createContext<TableContextValue>({
  columnWidths: {},
  onColumnWidthChange: () => {},
  onColumnResizeEnd: undefined,
});

export default TableContext;
