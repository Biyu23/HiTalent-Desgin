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

/** 内部列标识随处理后的列对象传递，不改变业务 key。 */
export const INTERNAL_COLUMN_KEY: unique symbol = Symbol('table-column-key');
// React 元素的属性不会转发 Symbol 键；在单元格适配器中读取此私有字段，
// 同时保留用户的 onCell/onHeaderCell 属性。
export const INTERNAL_CELL_COLUMN = '__hiTalentTableColumn';

/** 交给 Antd 的叶子列；适配器通过私有字段关联列元数据。 */
export type InternalLeafColumn<RecordType> = TableLeafColumn<RecordType> & {
  [INTERNAL_COLUMN_KEY]?: TableColumnKey;
};

/** 由原始列定义一次性提取的能力与分组信息，不包含拖拽预览状态。 */
export interface ColumnMeta<RecordType> {
  key: TableColumnKey;
  column: TableLeafColumn<RecordType>;
  groupPath: string;
  hideable: boolean;
  resizable: boolean;
}

/** 行索引快照：路径包含自身，index 为同级下标。 */
export interface RowMeta<RecordType> {
  key: TableRowKey;
  record: RecordType;
  path: readonly TableRowKey[];
  parentKey: TableRowKey | null;
  index: number;
  childKeys: readonly TableRowKey[];
}

/** 行数据入口生成的索引；重复键被排除，缺失键通过计数反馈。 */
export interface RowRegistry<RecordType> {
  keys: readonly TableRowKey[];
  meta: ReadonlyMap<TableRowKey, RowMeta<RecordType>>;
  duplicateKeys: ReadonlySet<TableRowKey>;
  missingKeyCount: number;
}

/** 拖拽策略产生的逻辑落点，不持有 DOM 或业务记录副本。 */
export interface RowDropCandidate {
  sourceKey: TableRowKey;
  targetKey: TableRowKey;
  placement: RowDropPlacement;
}

/** 拖拽开始时冻结的视口尺寸，避免读取动画中不断变化的位置。 */
export interface ColumnLayoutRect {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

/** 业务行键读取边界；无法识别的键统一返回 null。 */
export type RowKeyGetter<RecordType> = (
  record: RecordType,
  index?: number,
) => TableRowKey | null;

/** 行拖拽编排层输入；数据归属 useRowDrag，Provider 只驱动交互。 */
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

/** 跨层共享的样式和列操作；不暴露整份 TableProps。 */
export interface TableContextValue {
  classNames?: TableClassNames;
  styles?: TableStyles;
  commitColumnWidth: (key: TableColumnKey, width: number) => void;
  cancelColumnPreview: () => void;
}
