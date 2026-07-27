import type { ColumnType } from 'antd/es/table';
import React from 'react';
import type { NativeProps } from '../../types';

export type CellPresetType =
  | 'text'
  | 'tag'
  | 'progress'
  | 'date'
  | 'number'
  | 'boolean'
  | 'empty';

export interface EnhancedColumnType<RecordType = Record<string, unknown>>
  extends ColumnType<RecordType> {
  hideable?: boolean;
  hidden?: boolean;
  resizable?: boolean;
  defaultWidth?: number;
  minWidth?: number;
  cellPreset?: CellPresetType;
  cellPresetProps?: Record<string, unknown>;
  searchable?: boolean;
  searchPlaceholder?: string;
}

export type DropPosition = -1 | 0 | 1;
export type DropPositionLabel = 'before' | 'after' | 'inside';

export interface RowDragConfig<RecordType = Record<string, unknown>> {
  treeMode?: boolean;
  childrenColumnName?: string;
  draggable?: boolean | ((record: RecordType) => boolean);
  allowDrop?: (options: {
    dragRecord: RecordType;
    targetRecord: RecordType;
    dragPath: React.Key[];
    targetPath: React.Key[];
    dropPosition: DropPosition;
  }) => boolean;
  handleColumn?:
    | false
    | {
        width?: number;
        title?: React.ReactNode;
        fixed?: 'left' | 'right' | boolean;
        align?: 'left' | 'center' | 'right';
      };
}

export interface RowDragResult<RecordType = Record<string, unknown>> {
  dragKey: React.Key;
  targetKey: React.Key;
  position: DropPositionLabel;
  dragRecord: RecordType;
  targetRecord: RecordType;
  dragPath: React.Key[];
  targetPath: React.Key[];
  dropPosition: DropPosition;
}

export interface TableContextValue {
  columnWidths: Record<string, number>;
  onColumnWidthChange: (columnKey: string, width: number) => void;
  onColumnResizeEnd?: (columnKey: string, width: number) => void;
  onColumnSearch?: (columnKey: string, searchText: string) => void;
}

export interface TableProps<RecordType = Record<string, unknown>>
  extends Omit<
      import('antd').TableProps<RecordType>,
      'columns' | 'components' | 'className' | 'style'
    >,
    NativeProps {
  // 完美支持外部传入 const array
  columns: readonly EnhancedColumnType<RecordType>[];
  showColumnSetting?: boolean;
  columnSettingTitle?: React.ReactNode;
  columnSettingLoading?: boolean;
  enableColumnResize?: boolean;
  enableColumnDrag?: boolean;
  onColumnsChange?: (columns: EnhancedColumnType<RecordType>[]) => void;
  enableRowDrag?: boolean | RowDragConfig<RecordType>;
  onRowDragEnd?: (result: RowDragResult<RecordType>) => void;
  onColumnSearch?: (columnKey: string, searchText: string) => void;
  zebraStripe?: boolean;
  hoverHighlight?: boolean;
  toolbarRender?: (defaultToolbar: React.ReactNode) => React.ReactNode;
  toolbarExtra?: React.ReactNode;
}

export interface TableRef {
  resetAll: () => void;
}
