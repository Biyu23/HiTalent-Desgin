import type { ElementType, ReactNode, RefObject } from 'react';
import type {
  RowDragEndEvent,
  RowDropEvent,
  RowDropPlacement,
  TableClassNames,
  TableColumnKey,
  TableLeafColumn,
  TableRowKey,
  TableStyles,
} from './type';

export const INTERNAL_COLUMN_KEY: unique symbol = Symbol('table-column-key');
// React element props do not forward symbol keys. Consume this private field
// in the cell adapters while preserving user onCell/onHeaderCell properties.
export const INTERNAL_CELL_COLUMN = '__hiTalentTableColumn';

export type InternalLeafColumn<RecordType> = TableLeafColumn<RecordType> & {
  [INTERNAL_COLUMN_KEY]?: TableColumnKey;
};

export interface ColumnMeta<RecordType> {
  key: TableColumnKey;
  column: TableLeafColumn<RecordType>;
  groupPath: string;
  hideable: boolean;
  resizable: boolean;
}

export interface RowMeta<RecordType> {
  key: TableRowKey;
  record: RecordType;
  path: readonly TableRowKey[];
  parentKey: TableRowKey | null;
  index: number;
  childKeys: readonly TableRowKey[];
}

export interface RowRegistry<RecordType> {
  keys: readonly TableRowKey[];
  meta: ReadonlyMap<TableRowKey, RowMeta<RecordType>>;
  duplicateKeys: ReadonlySet<TableRowKey>;
  missingKeyCount: number;
}

export interface RowDropCandidate {
  sourceKey: TableRowKey;
  targetKey: TableRowKey;
  placement: RowDropPlacement;
}

export interface ColumnLayoutRect {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

export type RowKeyGetter<RecordType> = (
  record: RecordType,
  index?: number,
) => TableRowKey | null;

export interface RowDragProviderProps<RecordType> {
  children: ReactNode;
  rootRef: RefObject<HTMLElement>;
  enabled: boolean;
  dataSource: readonly RecordType[];
  registry: RowRegistry<RecordType>;
  getKey: RowKeyGetter<RecordType>;
  childrenKey: string;
  treeMode: boolean;
  renderKeys: readonly TableRowKey[];
  expandedKeys: ReadonlySet<TableRowKey>;
  canDrag?: (record: RecordType) => boolean;
  canDrop?: (event: RowDropEvent<RecordType>) => boolean;
  autoExpandDelay: number | false;
  handleEnabled: boolean;
  rowComponent?: ElementType;
  onPreview: (dataSource: readonly RecordType[] | null) => void;
  onAutoExpand: (key: TableRowKey, record: RecordType) => void;
  onCommit?: (event: RowDragEndEvent<RecordType>) => void;
}

export interface TableContextValue {
  classNames?: TableClassNames;
  styles?: TableStyles;
  previewColumnWidth: (key: TableColumnKey, width: number) => void;
  commitColumnWidth: (key: TableColumnKey, width: number) => void;
  cancelColumnPreview: () => void;
}
