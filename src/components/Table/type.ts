import type { TableProps as AntdTableProps } from 'antd';
import type {
  TableRef as AntdTableRef,
  ColumnGroupType,
  ColumnType,
} from 'antd/es/table';
import type React from 'react';
import type { NativeProps } from '../../types';
import type {
  SemanticClassNames,
  SemanticStyleProps,
  SemanticStyles,
} from '../_util/semanticStyles';

export type TableColumnKey = string;
export type TableRowKey = string | number;

interface TableColumnOptions {
  key: TableColumnKey;
  hideable?: boolean;
  resizable?: boolean;
}

export type TableLeafColumn<RecordType = Record<string, unknown>> = Omit<
  ColumnType<RecordType>,
  'key'
> &
  TableColumnOptions;

export type TableColumnGroup<RecordType = Record<string, unknown>> = Omit<
  ColumnGroupType<RecordType>,
  'children'
> & {
  children: readonly TableColumn<RecordType>[];
};

export type TableColumn<RecordType = Record<string, unknown>> =
  | TableLeafColumn<RecordType>
  | TableColumnGroup<RecordType>;

export interface TableColumnStateItem {
  key: TableColumnKey;
  visible?: boolean;
  width?: number;
}

export type TableColumnState = readonly TableColumnStateItem[];

export type RowDropPlacement = 'before' | 'inside' | 'after';

export interface RowDropTarget<RecordType> {
  key: TableRowKey;
  record: RecordType;
  path: readonly TableRowKey[];
}

export interface RowDropEvent<RecordType> {
  source: RowDropTarget<RecordType>;
  target: RowDropTarget<RecordType>;
  placement: RowDropPlacement;
}

export interface RowDragEndEvent<RecordType> extends RowDropEvent<RecordType> {
  nextDataSource: readonly RecordType[];
}

export interface RowDragHandleOptions {
  width?: number;
  title?: React.ReactNode;
  fixed?: 'left' | 'right' | boolean;
}

export interface RowDragOptions<RecordType> {
  mode?: 'flat' | 'tree';
  childrenKey?: string;
  canDrag?: (record: RecordType) => boolean;
  canDrop?: (event: RowDropEvent<RecordType>) => boolean;
  /** Hover delay in milliseconds (default 600). False cancels automatic expansion. */
  autoExpandDelay?: number | false;
  handle?: false | RowDragHandleOptions;
}

export interface ColumnSettingOptions {
  title?: React.ReactNode;
  loading?: boolean;
}

export type TableSlot = 'toolbar' | 'settingPopup' | 'table';

export type TableClassNames = SemanticClassNames<TableSlot>;
export type TableStyles = SemanticStyles<TableSlot>;

export interface TableOwnProps<RecordType> {
  columns: readonly TableColumn<RecordType>[];
  columnSetting?: boolean | ColumnSettingOptions;
  columnResize?: boolean;
  columnDrag?: boolean;
  rowDrag?: boolean | RowDragOptions<RecordType>;
  columnState?: TableColumnState;
  defaultColumnState?: TableColumnState;
  onColumnStateChange?: (state: TableColumnState) => void;
  onRowDragEnd?: (event: RowDragEndEvent<RecordType>) => void;
  zebraStripe?: boolean;
  hoverHighlight?: boolean;
  toolbarRender?: (toolbar: React.ReactNode) => React.ReactNode;
  toolbarExtra?: React.ReactNode;
}

export type TableProps<RecordType = Record<string, unknown>> = Omit<
  AntdTableProps<RecordType>,
  'columns' | 'className' | 'style' | 'rootClassName' | 'classNames' | 'styles'
> &
  NativeProps &
  SemanticStyleProps<TableSlot> &
  TableOwnProps<RecordType>;

export type TableRef = AntdTableRef & {
  resetColumnState: () => void;
};
