import type { TableProps as AntdTableProps } from 'antd';
import type {
  TableRef as AntdTableRef,
  ColumnGroupType,
  ColumnType,
} from 'antd/es/table';
import type React from 'react';
import type { NativeProps } from '../../types';

export type ColumnId = string;

export interface ColumnStateItem {
  id: ColumnId;
  hidden?: boolean;
  width?: number;
}

export type ColumnState = readonly ColumnStateItem[];
export type ColumnStateChangeReason =
  | 'visibility'
  | 'resize'
  | 'reorder'
  | 'reset';

export interface ColumnStateChangeInfo {
  reason: ColumnStateChangeReason;
  columnId?: ColumnId;
}

export type CellPresetType =
  | 'text'
  | 'tag'
  | 'progress'
  | 'date'
  | 'number'
  | 'boolean'
  | 'empty';

export interface TagPresetProps {
  colorMap?: Readonly<Record<string, string>>;
  defaultColor?: string;
}

export interface ProgressPresetProps {
  max?: number;
  showInfo?: boolean;
  strokeColor?: string;
}

export interface DatePresetProps {
  format?: string;
}

export interface NumberPresetProps {
  decimals?: number;
  thousandsSeparator?: string;
  decimalSeparator?: string;
}

type CellPresetOptions =
  | { cellPreset?: 'text' | 'empty'; cellPresetProps?: never }
  | { cellPreset: 'tag'; cellPresetProps?: TagPresetProps }
  | { cellPreset: 'progress'; cellPresetProps?: ProgressPresetProps }
  | { cellPreset: 'date'; cellPresetProps?: DatePresetProps }
  | { cellPreset: 'number'; cellPresetProps?: NumberPresetProps }
  | { cellPreset: 'boolean'; cellPresetProps?: never };

interface EnhancedColumnOptions {
  /** 增强功能使用的稳定列标识；启用列设置、调整宽度或拖拽时建议显式提供。 */
  id?: ColumnId;
  /** 是否允许用户隐藏该列，默认 true。 */
  hideable?: boolean;
  /** 是否允许用户调整该列宽度，默认 true。 */
  resizable?: boolean;
}

export type EnhancedLeafColumnType<RecordType = Record<string, unknown>> =
  ColumnType<RecordType> & EnhancedColumnOptions & CellPresetOptions;

export type EnhancedColumnGroupType<RecordType = Record<string, unknown>> =
  Omit<ColumnGroupType<RecordType>, 'children'> & {
    children: readonly EnhancedColumnType<RecordType>[];
  };

export type EnhancedColumnType<RecordType = Record<string, unknown>> =
  | EnhancedLeafColumnType<RecordType>
  | EnhancedColumnGroupType<RecordType>;

export type DropPosition = -1 | 0 | 1;
export type DropPositionLabel = 'before' | 'inside' | 'after';

type RowDropPlacement =
  | { position: 'before'; dropPosition: -1 }
  | { position: 'inside'; dropPosition: 0 }
  | { position: 'after'; dropPosition: 1 };

interface RowDropBase<RecordType> {
  dragRecord: RecordType;
  targetRecord: RecordType;
  dragPath: readonly React.Key[];
  targetPath: readonly React.Key[];
}

export type RowDropInfo<RecordType = Record<string, unknown>> =
  RowDropBase<RecordType> & RowDropPlacement;

export type RowDragResult<RecordType = Record<string, unknown>> =
  RowDropInfo<RecordType> & {
    dragKey: React.Key;
    targetKey: React.Key;
  };

export interface RowDragConfig<RecordType = Record<string, unknown>> {
  treeMode?: boolean;
  childrenColumnName?: string;
  draggable?: boolean | ((record: RecordType) => boolean);
  /**
   * 业务放置规则。拖拽悬停期间会多次调用，应保持同步、快速且无副作用。
   * 组件会先拒绝拖到自身或自身后代等结构非法位置。
   */
  allowDrop?: (info: RowDropInfo<RecordType>) => boolean;
  handleColumn?:
    | false
    | {
        width?: number;
        title?: React.ReactNode;
        fixed?: 'left' | 'right' | boolean;
        align?: 'left' | 'center' | 'right';
      };
}

export interface TableContextValue {
  columnWidths: Readonly<Record<ColumnId, number>>;
  onColumnWidthChange: (columnId: ColumnId, width: number) => void;
  onColumnResizeEnd?: (columnId: ColumnId, width: number) => void;
}

interface TableOwnProps<RecordType> {
  columns: readonly EnhancedColumnType<RecordType>[];
  showColumnSetting?: boolean;
  columnSettingTitle?: React.ReactNode;
  columnSettingLoading?: boolean;
  enableColumnResize?: boolean;
  enableColumnDrag?: boolean;
  enableRowDrag?: boolean | RowDragConfig<RecordType>;
  onRowDragEnd?: (result: RowDragResult<RecordType>) => void;
  zebraStripe?: boolean;
  hoverHighlight?: boolean;
  toolbarRender?: (defaultToolbar: React.ReactNode) => React.ReactNode;
  toolbarExtra?: React.ReactNode;
}

type ControlledColumnStateProps = {
  columnState: ColumnState;
  defaultColumnState?: never;
  onColumnStateChange: (next: ColumnState, info: ColumnStateChangeInfo) => void;
};

type UncontrolledColumnStateProps = {
  columnState?: never;
  defaultColumnState?: ColumnState;
  onColumnStateChange?: (
    next: ColumnState,
    info: ColumnStateChangeInfo,
  ) => void;
};

export type ColumnStateProps =
  | ControlledColumnStateProps
  | UncontrolledColumnStateProps;

export type TableProps<RecordType = Record<string, unknown>> = Omit<
  AntdTableProps<RecordType>,
  'columns' | 'className' | 'style'
> &
  NativeProps &
  TableOwnProps<RecordType> &
  (ControlledColumnStateProps | UncontrolledColumnStateProps);

export type TableRef = AntdTableRef & {
  resetColumnState: () => void;
};
