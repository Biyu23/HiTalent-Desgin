import type { FormRule } from 'antd';
import type { ColumnType } from 'antd/es/table';
import React from 'react';
import type { NativeProps } from '../../types';

// ==================== Cell 预设类型 ====================

export type CellPresetType =
  | 'text'
  | 'tag'
  | 'progress'
  | 'date'
  | 'number'
  | 'boolean'
  | 'empty';

// ==================== 预设配置接口 ====================

export interface TagPresetProps {
  /** 值 → 颜色映射 */
  colorMap?: Record<string, string>;
  /** 默认颜色 */
  defaultColor?: string;
}

export interface ProgressPresetProps {
  /** 最大值 */
  max?: number;
  /** 是否显示百分比文字 */
  showInfo?: boolean;
  /** 进度条颜色 */
  strokeColor?: string;
}

export interface DatePresetProps {
  /** dayjs format 格式化字符串 */
  format?: string;
}

export interface NumberPresetProps {
  /** 小数位数 */
  decimals?: number;
  /** 千分位分隔符 */
  thousandsSeparator?: string;
  /** 小数分隔符 */
  decimalSeparator?: string;
}

// ==================== 行内编辑 ====================

export interface EditComponentProps<RecordType = any> {
  value: any;
  record: RecordType;
  onChange: (value: any) => void;
  onBlur: () => void;
}

// ==================== 列定义 ====================

export interface EnhancedColumnType<RecordType = any>
  extends ColumnType<RecordType> {
  // ---- 显隐 ----
  /** 是否允许隐藏，默认 true */
  hideable?: boolean;
  /** 默认是否隐藏 */
  hidden?: boolean;

  // ---- 列宽 ----
  /** 是否允许调整列宽，默认 true */
  resizable?: boolean;
  /** 默认列宽 (px) */
  defaultWidth?: number;
  /** 最小列宽，默认 80 */
  minWidth?: number;

  // ---- 搜索 ----
  /** 是否显示搜索图标 */
  searchable?: boolean;
  /** 搜索占位文本 */
  searchPlaceholder?: string;

  // ---- Cell 预设 ----
  /** 预设渲染类型 */
  cellPreset?: CellPresetType;
  /** 预设参数 */
  cellPresetProps?: Record<string, any>;

  // ---- 行内编辑 ----
  /** 该列是否可编辑 */
  editable?: boolean;
  /** 自定义编辑组件 */
  editComponent?: React.ComponentType<EditComponentProps<RecordType>>;
  /** antd Form 校验规则 */
  editRules?: FormRule[];
}

// ==================== 行拖拽 ====================

export interface RowDragResult {
  /** 被拖拽行的 key */
  dragKey: React.Key;
  /** 目标行的 key */
  targetKey: React.Key;
  /** 放置位置 */
  position: 'before' | 'after' | 'inside';
}

// ==================== 列配置内部状态 ====================

export interface ColumnConfig {
  key: string;
  visible: boolean;
  width?: number;
  order: number;
}

// ==================== TableContext ====================

export interface TableContextValue {
  /** 列宽映射 */
  columnWidths: Record<string, number>;
  /** 设置单个列宽 */
  onColumnWidthChange: (columnKey: string, width: number) => void;
  /** 可见列 keys */
  visibleKeys: string[];
  /** 列排序 keys */
  orderedKeys: string[];
  /** 当前编辑的 cell 信息 */
  editingCell: { recordKey: React.Key; columnKey: string } | null;
  /** 开始编辑 cell */
  onStartEdit: (recordKey: React.Key, columnKey: string) => void;
  /** 结束编辑 cell */
  onEndEdit: () => void;
  /** 是否启用行内编辑 */
  enableInlineEdit: boolean;
  /** Cell 编辑回调 */
  onCellEdit?: (record: any, field: string, value: any) => Promise<void> | void;
  /** 列搜索回调 */
  onColumnSearch?: (columnKey: string, searchText: string) => void;
}

// ==================== Table Props ====================

export interface TableProps<RecordType = any>
  extends Omit<
      import('antd').TableProps<RecordType>,
      'columns' | 'components' | 'className' | 'style'
    >,
    NativeProps {
  columns: EnhancedColumnType<RecordType>[];

  // ---- 列设置 ----
  /** 是否显示列设置按钮，默认 true */
  showColumnSetting?: boolean;
  /** 列设置标题 */
  columnSettingTitle?: React.ReactNode;
  /** 默认可见列 keys（非受控） */
  defaultVisibleKeys?: string[];
  /** 可见列 keys（受控） */
  visibleKeys?: string[];
  /** 可见列变更回调 */
  onVisibleKeysChange?: (visibleKeys: string[]) => void;

  // ---- 列宽 ----
  /** 是否启用列宽调整，默认 true */
  enableColumnResize?: boolean;
  /** 默认列宽映射（非受控） */
  defaultColumnWidths?: Record<string, number>;
  /** 列宽映射（受控） */
  columnWidths?: Record<string, number>;
  /** 列宽变更回调，外部可保存到后端 */
  onColumnWidthChange?: (widths: Record<string, number>) => void;

  // ---- 列拖拽 ----
  /** 是否启用列拖拽排序，默认 false */
  enableColumnDrag?: boolean;
  /** 默认列顺序（非受控） */
  defaultOrderedKeys?: string[];
  /** 列顺序（受控） */
  orderedKeys?: string[];
  /** 列顺序变更回调 */
  onColumnOrderChange?: (columnKeys: string[]) => void;

  // ---- 行拖拽 ----
  /** 是否启用行拖拽移动，默认 false */
  enableRowDrag?: boolean;
  /** 行拖拽结束回调 */
  onRowDragEnd?: (result: RowDragResult) => void;

  // ---- 行内编辑 ----
  /** 是否启用行内编辑，默认 false */
  enableInlineEdit?: boolean;
  /** Cell 编辑回调，返回 Promise 支持异步保存 */
  onCellEdit?: (
    record: RecordType,
    field: string,
    value: any,
  ) => Promise<void> | void;

  // ---- 搜索 ----
  /** 列搜索回调 */
  onColumnSearch?: (columnKey: string, searchText: string) => void;

  // ---- 样式 ----
  /** 斑马纹，默认 true */
  zebraStripe?: boolean;
  /** 行悬停高亮，默认 true */
  hoverHighlight?: boolean;

  // ---- 操作栏 ----
  /** 自定义操作栏渲染，defaultToolbar 为默认的操作栏内容 */
  toolbarRender?: (defaultToolbar: React.ReactNode) => React.ReactNode;
  /** 工具栏额外内容（渲染在列设置按钮左侧） */
  toolbarExtra?: React.ReactNode;
}

// ==================== Table Ref ====================

export interface TableRef {
  /** 获取当前可见列 keys */
  getVisibleColumns: () => string[];
  /** 设置可见列 keys */
  setVisibleColumns: (keys: string[]) => void;
  /** 获取当前列宽映射 */
  getColumnWidths: () => Record<string, number>;
  /** 设置列宽映射 */
  setColumnWidths: (widths: Record<string, number>) => void;
  /** 重置所有配置到默认值 */
  resetAll: () => void;
}
