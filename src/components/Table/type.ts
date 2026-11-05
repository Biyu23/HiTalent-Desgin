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

/** 列状态与列拖拽使用的唯一标识；叶子列必须显式提供字符串 key。 */
export type TableColumnKey = string;
/** 行标识与 Antd 的 data-row-key 对齐；应使用稳定业务键，避免依赖行下标。 */
export type TableRowKey = string | number;

/** 叶子列增强选项；分组仅负责组织结构，增强行为作用于叶子列。 */
interface TableColumnOptions {
  /** 唯一列标识，排序、显隐和宽度均以此关联。 */
  key: TableColumnKey;
  /** 是否允许通过列设置隐藏，默认允许；原生 hidden 仍优先。 */
  hideable?: boolean;
  /** 是否允许调整此列宽度，默认允许；还需开启表级 columnResize。 */
  resizable?: boolean;
}

/** 保留 Antd 叶子列能力，并追加列设置与列宽调整选项。 */
export type TableLeafColumn<RecordType = Record<string, unknown>> = Omit<
  ColumnType<RecordType>,
  'key'
> &
  TableColumnOptions;

/** 分组列保留嵌套结构；固定属性可由父分组传给子列。 */
export type TableColumnGroup<RecordType = Record<string, unknown>> = Omit<
  ColumnGroupType<RecordType>,
  'children'
> & {
  children: readonly TableColumn<RecordType>[];
};

/** 对外列定义，支持叶子列与嵌套分组。 */
export type TableColumn<RecordType = Record<string, unknown>> =
  | TableLeafColumn<RecordType>
  | TableColumnGroup<RecordType>;

/** 单列的用户配置；未设置 width 时跟随原始 columns.width。 */
export interface TableColumnStateItem {
  /** 对应叶子列的唯一标识。 */
  key: TableColumnKey;
  /** 默认显示；hideable=false 的列始终显示。 */
  visible?: boolean;
  /** 用户覆盖的像素宽度；省略时使用列定义中的宽度。 */
  width?: number;
}

/** 数组顺序即用户列顺序；缺失的列会按原始定义补齐。 */
export type TableColumnState = readonly TableColumnStateItem[];

/** 放在目标之前、作为最后一个子节点、放在目标之后。 */
export type RowDropPlacement = 'before' | 'inside' | 'after';

/** 拖拽开始时的节点快照；path 包含从根到当前节点的所有行键。 */
export interface RowDropTarget<RecordType> {
  /** 当前节点的业务行键。 */
  key: TableRowKey;
  /** 拖拽开始时对应的原始业务记录。 */
  record: RecordType;
  /** 从根节点到当前节点的行键路径，包含自身。 */
  path: readonly TableRowKey[];
}

/** 待确认的落点，供 canDrop 判断业务限制。 */
export interface RowDropEvent<RecordType> {
  /** 被拖动的节点。 */
  source: RowDropTarget<RecordType>;
  /** 作为放置参照的目标节点。 */
  target: RowDropTarget<RecordType>;
  /** 相对于目标的放置位置。 */
  placement: RowDropPlacement;
}

/** 完成拖拽后的通知；调用方需将 nextDataSource 写回自己的数据源。 */
export interface RowDragEndEvent<RecordType> extends RowDropEvent<RecordType> {
  /** 不修改原始数据，仅复制移动路径上的数组及父节点。 */
  nextDataSource: readonly RecordType[];
}

/** 自动插入的手柄列；默认宽度 46，固定在左侧。 */
export interface RowDragHandleOptions {
  /** 手柄列宽度，默认 46 像素。 */
  width?: number;
  /** 手柄列表头，默认读取当前语言包。 */
  title?: React.ReactNode;
  /** 手柄列的固定位置，默认 left。 */
  fixed?: 'left' | 'right' | boolean;
}

/** 行拖拽配置，默认仅调整顶层行的顺序。 */
export interface RowDragOptions<RecordType> {
  /** flat 仅移动顶层行；tree 允许跨父节点移动整个子树。 */
  mode?: 'flat' | 'tree';
  /** 子节点字段，优先于 expandable.childrenColumnName 与顶层同名选项。 */
  childrenKey?: string;
  /** 返回 false 时禁止拖动该行。 */
  canDrag?: (record: RecordType) => boolean;
  /** 在结构约束通过后判断业务落点，松手时会再次读取最新回调。 */
  canDrop?: (event: RowDropEvent<RecordType>) => boolean;
  /** 悬停延迟，单位为毫秒，默认 600；设为 false 时关闭自动展开。 */
  autoExpandDelay?: number | false;
  /** false 表示整行拖拽，否则显示独立手柄列。 */
  handle?: false | RowDragHandleOptions;
}

/** 列设置弹层的标题与加载状态。 */
export interface ColumnSettingOptions {
  /** 弹层标题，默认读取当前语言包。 */
  title?: React.ReactNode;
  /** 显示加载状态，同时作用于保存按钮。 */
  loading?: boolean;
}

/** 工具栏、列设置弹层和内层表格的语义样式插槽。 */
export type TableSlot = 'toolbar' | 'settingPopup' | 'table';

/** 按插槽设置类名，外层容器类名使用 className。 */
export type TableClassNames = SemanticClassNames<TableSlot>;
/** 按插槽设置样式，外层容器样式使用 style。 */
export type TableStyles = SemanticStyles<TableSlot>;

/** Table 自有能力，其余属性直接沿用 Antd Table。 */
export interface TableOwnProps<RecordType> {
  /** 列定义；每个叶子列的 key 在整张表中必须唯一。 */
  columns: readonly TableColumn<RecordType>[];
  /** 是否显示列设置入口，默认 true。 */
  columnSetting?: boolean | ColumnSettingOptions;
  /** 是否允许调整列宽，默认 true；启用时使用固定表格布局。 */
  columnResize?: boolean;
  /** 是否允许同分组内的非固定列拖拽排序，默认 false。 */
  columnDrag?: boolean;
  /** 是否启用行拖拽，默认 false；true 使用默认平铺模式。 */
  rowDrag?: boolean | RowDragOptions<RecordType>;
  /** 受控列状态；值为 undefined 时使用内部状态。 */
  columnState?: TableColumnState;
  /** 非受控初始状态，同时作为 resetColumnState 的恢复目标。 */
  defaultColumnState?: TableColumnState;
  /** 显隐、列宽、顺序或重置产生实际变化时通知；拖拽预览不触发。 */
  onColumnStateChange?: (state: TableColumnState) => void;
  /** 有效移动完成后触发；组件不会替调用方持久化数据顺序。 */
  onRowDragEnd?: (event: RowDragEndEvent<RecordType>) => void;
  /** 是否显示斑马纹，默认 true。 */
  zebraStripe?: boolean;
  /** 是否显示悬浮高亮，默认 true；同时尊重原生 rowHoverable=false。 */
  hoverHighlight?: boolean;
  /** 接收默认工具栏，可替换、包裹或返回 null 隐藏工具栏。 */
  toolbarRender?: (toolbar: React.ReactNode) => React.ReactNode;
  /** 默认工具栏左侧内容。 */
  toolbarExtra?: React.ReactNode;
}

/** 兼容 Antd 属性，替换列定义并增加语义样式与增强功能。 */
export type TableProps<RecordType = Record<string, unknown>> = Omit<
  AntdTableProps<RecordType>,
  'columns' | 'className' | 'style' | 'rootClassName' | 'classNames' | 'styles'
> &
  NativeProps &
  SemanticStyleProps<TableSlot> &
  TableOwnProps<RecordType>;

/** 保留 Antd 的 DOM 引用和滚动方法，追加列状态重置。 */
export type TableRef = AntdTableRef & {
  /** 恢复当前 defaultColumnState；受控模式仅通知，最终由父组件采纳。 */
  resetColumnState: () => void;
};
