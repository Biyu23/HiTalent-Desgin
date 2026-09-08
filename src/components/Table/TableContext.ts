import React from 'react';
import type { TableContextValue } from './internal';

const TableContext = React.createContext<TableContextValue>({
  previewColumnWidth: () => undefined,
  commitColumnWidth: () => undefined,
  cancelColumnPreview: () => undefined,
});

export default TableContext;
