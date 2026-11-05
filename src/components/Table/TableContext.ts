import React from 'react';
import type { TableContextValue } from './internal';

/** 工具栏与表头共享的最小接口；拖拽状态由各自的 Context 隔离。 */
const TableContext = React.createContext<TableContextValue>({
  commitColumnWidth: () => undefined,
  cancelColumnPreview: () => undefined,
});

export default TableContext;
