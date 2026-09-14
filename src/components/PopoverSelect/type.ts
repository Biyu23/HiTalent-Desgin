import type { TooltipPlacement } from 'antd/es/tooltip';
import type React from 'react';
import type { NativeProps } from '../../types';

/** 基础原始值类型，支持字符串与数字 */
export type RawValueType = string | number;

/** 默认选项结构 */
export interface DefaultOptionType {
  /** 选项展示的文本或节点 */
  label: React.ReactNode;
  /** 选项对应的唯一值 */
  value: RawValueType;
  /** 是否禁用该选项 */
  disabled?: boolean;
  /** 其他自定义属性 */
  [key: string]: unknown;
}

/** 映射选项内部结构 */
export interface MappedOption<
  ValueType extends RawValueType = RawValueType,
  OptionType extends object = DefaultOptionType,
> {
  label: React.ReactNode;
  value: ValueType;
  disabled: boolean;
  source: OptionType;
}

/** 自定义字段名映射 */
export interface PopoverSelectFieldNames<
  OptionType extends object = DefaultOptionType,
> {
  /** 指定 label 在原始数据中的属性名，默认 'label' */
  label?: keyof OptionType;
  /** 指定 value 在原始数据中的属性名，默认 'value' */
  value?: keyof OptionType;
  /** 指定 disabled 在原始数据中的属性名，默认 'disabled' */
  disabled?: keyof OptionType;
}

/** 组件语义化类名配置 */
export interface PopoverSelectClassNames {
  /** 触发器按钮的 className */
  trigger?: string;
  /** 弹出气泡容器的 className */
  popup?: string;
  /** 选项菜单列表的 className */
  menu?: string;
  /** 底部操作按钮区域的 className */
  footer?: string;
}

/** 组件语义化行内样式配置 */
export interface PopoverSelectStyles {
  /** 触发器按钮的行内样式 */
  trigger?: React.CSSProperties;
  /** 弹出气泡容器的行内样式 */
  popup?: React.CSSProperties;
  /** 选项菜单列表的行内样式 */
  menu?: React.CSSProperties;
  /** 底部操作区的行内样式 */
  footer?: React.CSSProperties;
}

/** 自定义菜单/底部操作区使用的选择上下文；所有操作遵循确认模式。 */
export interface PopoverSelectRenderContext<
  ValueType extends RawValueType = RawValueType,
  OptionType extends object = DefaultOptionType,
> {
  options: readonly MappedOption<ValueType, OptionType>[];
  displayOptions: readonly MappedOption<ValueType, OptionType>[];
  selectedValues: readonly ValueType[];
  searchValue: string;
  mode: 'single' | 'multiple';
  confirmRequired: boolean;
  toggleValue(value: ValueType): void;
  selectAll(checked: boolean): void;
  clear(): void;
  confirm(): void;
  cancel(): void;
}

export interface PopoverSelectOptionRenderInfo<
  ValueType extends RawValueType = RawValueType,
> {
  value: ValueType;
  selected: boolean;
  disabled: boolean;
}

/** PopoverSelect 与独立 Selector 共享的弹层配置。 */
export interface SelectorPopupProps {
  /** 受控展开状态 */
  open?: boolean;
  /** 非受控模式的初始展开状态，默认 false */
  defaultOpen?: boolean;
  /** 展开状态变化时的回调 */
  onOpenChange?: (open: boolean) => void;
  /** 显示/隐藏动画完成后的回调 */
  afterOpenChange?: (open: boolean) => void;
  /** 弹层位置，默认 bottomLeft */
  placement?: TooltipPlacement;
  /** 弹层挂载容器 */
  getPopupContainer?: (triggerNode: HTMLElement) => HTMLElement;
  /** 被遮挡时自动调整位置，默认 true */
  autoAdjustOverflow?: boolean;
  /** 关闭时销毁弹层，默认 false */
  destroyTooltipOnHide?: boolean;
}

export interface SelectorRenderContext {
  open: boolean;
  close: () => void;
}

/** PopoverSelect 基础属性 */
export interface PopoverSelectBaseProps<
  OptionType extends object = DefaultOptionType,
  ValueType extends RawValueType = RawValueType,
> extends Omit<NativeProps, 'children'>,
    SelectorPopupProps {
  /**
   * @description 自定义组件样式前缀
   */
  prefixCls?: string;
  /**
   * @description 语义化类名插槽
   */
  classNames?: PopoverSelectClassNames;
  /**
   * @description 语义化样式插槽
   */
  styles?: PopoverSelectStyles;
  /**
   * @description 数据选项列表
   * @default []
   */
  options?: readonly OptionType[];
  /**
   * @description 是否允许通过手柄拖拽排列候选项；搜索时暂停排序
   * @default false
   */
  sortable?: boolean;
  /**
   * @description 拖拽完成后返回排序后的全部原始选项，请更新 options 回传；立即触发，不受选择确认/取消影响
   */
  onSortChange?: (options: OptionType[]) => void;
  /**
   * @description 未选择时的占位文本
   */
  placeholder?: React.ReactNode;
  /**
   * @description 是否支持搜索过滤
   * @default false
   */
  showSearch?: boolean;
  /**
   * @description 是否支持一键清空
   * @default false
   */
  allowClear?: boolean;
  /**
   * @description 自定义数据源字段名映射
   */
  fieldNames?: PopoverSelectFieldNames<OptionType>;
  /**
   * @description 自定义下拉菜单面板渲染
   */
  dropdownRender?: (
    menu: React.ReactElement,
    context: PopoverSelectRenderContext<ValueType, OptionType>,
  ) => React.ReactElement;
  /** 自定义底部操作区；返回 null 可隐藏默认操作。 */
  footerRender?: (
    footer: React.ReactNode,
    context: PopoverSelectRenderContext<ValueType, OptionType>,
  ) => React.ReactNode;
  /** 自定义触发器中的已提交值展示，不影响弹层草稿。 */
  labelRender?: (
    label: React.ReactNode,
    info: { values: readonly ValueType[]; options: readonly OptionType[] },
  ) => React.ReactNode;
  /**
   * @description 多选模式下是否显示确认按钮。开启时选择操作进入草稿状态，点击确认后生效
   * @default mode === 'multiple'
   */
  showConfirm?: boolean;
  /**
   * @description 是否显示取消按钮，点击后关闭弹窗并放弃未确认的改动
   * @default false
   */
  showCancelBtn?: boolean;
  /**
   * @description 是否显示清空按钮，点击后清空当前已选/草稿值
   * @default false
   */
  showClearBtn?: boolean;
  /**
   * @description 自定义单个选项的渲染逻辑
   */
  optionRender?: (
    item: OptionType,
    info: PopoverSelectOptionRenderInfo<ValueType>,
  ) => React.ReactNode;
  /**
   * @description 多选时选中项展示的分隔符
   * @default ', '
   */
  separator?: string;
  /**
   * @description 多选时最多展示的标签数量，超出部分自动显示为 (+N)
   */
  maxTagCount?: number;
  /**
   * @description 是否启用虚拟滚动（长列表性能优化）
   * @default true
   */
  virtual?: boolean;
  /**
   * @description 选项列表的最大高度，单位 px
   * @default 150
   */
  listHeight?: number;
  /**
   * @description 虚拟列表中单个选项的测量高度，单位 px
   * @default 34
   */
  listItemHeight?: number;
  /**
   * @description 多选模式下是否显示全选复选框（与当前搜索过滤结果联动）
   * @default false
   */
  showSelectAll?: boolean;
  /**
   * @description 是否显示右侧展开箭头
   * @default true
   */
  showArrow?: boolean;
  /**
   * @description 是否禁用组件
   * @default false
   */
  disabled?: boolean;
  /**
   * @description 是否开启文本超出截断与 Tooltip 提示，可自定义 Tooltip 内容
   * @default true
   */
  ellipsis?: boolean | { tooltip?: string };
}

/** 单选模式属性 */
export interface PopoverSelectSingleProps<
  ValueType extends RawValueType = RawValueType,
  OptionType extends object = DefaultOptionType,
> extends PopoverSelectBaseProps<OptionType, ValueType> {
  /**
   * @description 选择模式，单选
   * @default 'single'
   */
  mode?: 'single';
  valueType?: never;
  valueSeparator?: never;
  /**
   * @description 当前选中的值（受控）
   */
  value?: ValueType;
  /**
   * @description 默认选中的值（非受控）
   */
  defaultValue?: ValueType;
  /**
   * @description 选中值发生变化时的回调
   */
  onChange?: (value: ValueType | undefined, options: OptionType[]) => void;
}

/** 多选模式属性（数组格式输出） */
export interface PopoverSelectMultipleArrayProps<
  ValueType extends RawValueType = RawValueType,
  OptionType extends object = DefaultOptionType,
> extends PopoverSelectBaseProps<OptionType, ValueType> {
  /**
   * @description 选择模式，多选
   */
  mode: 'multiple';
  /**
   * @description 值提交类型，默认为数组格式
   * @default 'array'
   */
  valueType?: 'array';
  valueSeparator?: never;
  /**
   * @description 当前选中的值数组（受控）
   */
  value?: ValueType[];
  /**
   * @description 默认选中的值数组（非受控）
   */
  defaultValue?: ValueType[];
  /**
   * @description 选中值发生变化时的回调
   */
  onChange?: (value: ValueType[], options: OptionType[]) => void;
}

/** 多选模式属性（分隔符字符串格式输出） */
export interface PopoverSelectMultipleStringProps<
  OptionType extends object = DefaultOptionType,
  ValueType extends RawValueType = RawValueType,
> extends PopoverSelectBaseProps<OptionType, ValueType> {
  /**
   * @description 选择模式，多选
   */
  mode: 'multiple';
  /**
   * @description 值提交类型，分隔符字符串格式
   */
  valueType: 'string';
  /**
   * @description 字符串值的分隔符
   * @default ','
   */
  valueSeparator?: string;
  /**
   * @description 当前选中的分隔符字符串值，例如 `'FE,1'`（受控）
   */
  value?: string;
  /**
   * @description 默认选中的分隔符字符串值（非受控）
   */
  defaultValue?: string;
  /**
   * @description 选中值发生变化时的回调，返回分隔符字符串
   */
  onChange?: (value: string, options: OptionType[]) => void;
}

/** PopoverSelect 统一属性联合类型 */
export type PopoverSelectProps<
  ValueType extends RawValueType = RawValueType,
  OptionType extends object = DefaultOptionType,
> =
  | PopoverSelectSingleProps<ValueType, OptionType>
  | PopoverSelectMultipleArrayProps<ValueType, OptionType>
  | PopoverSelectMultipleStringProps<OptionType, ValueType>;

/** PopoverSelect 组件 Ref 属性类型 */
export type PopoverSelectRefProps = { ref?: React.Ref<HTMLDivElement> };

/** PopoverSelect 组件类型定义（支持泛型重载与子组件静态属性） */
export interface PopoverSelectComponent {
  <
    ValueType extends RawValueType = RawValueType,
    OptionType extends object = DefaultOptionType,
  >(
    props: PopoverSelectSingleProps<ValueType, OptionType> &
      PopoverSelectRefProps,
  ): React.ReactElement | null;
  <
    ValueType extends RawValueType = RawValueType,
    OptionType extends object = DefaultOptionType,
  >(
    props: PopoverSelectMultipleArrayProps<ValueType, OptionType> &
      PopoverSelectRefProps,
  ): React.ReactElement | null;
  <
    OptionType extends object = DefaultOptionType,
    ValueType extends RawValueType = RawValueType,
  >(
    props: PopoverSelectMultipleStringProps<OptionType, ValueType> &
      PopoverSelectRefProps,
  ): React.ReactElement | null;
  displayName?: string;
  Selector: typeof import('./components/PopoverSelector').Selector;
}

/** PopoverSelect.Selector 独立触发器组件属性 */
export interface SelectorProps
  extends Omit<NativeProps, 'children'>,
    SelectorPopupProps {
  /**
   * @description 类名前缀
   */
  prefixCls?: string;
  /**
   * @description 气泡框内部承载的内容或渲染函数
   */
  content:
    | React.ReactNode
    | ((context: SelectorRenderContext) => React.ReactNode);
  /**
   * @description 语义化类名插槽
   */
  classNames?: PopoverSelectClassNames;
  /**
   * @description 语义化样式插槽
   */
  styles?: PopoverSelectStyles;
  /**
   * @description 触发器内部展示的文本或节点
   */
  children?: React.ReactNode;
  /**
   * @description 是否支持清除
   * @default false
   */
  allowClear?: boolean;
  /**
   * @description 是否存在有效选中值（用于高亮及显示清除图标）
   */
  hasValue?: boolean;
  /**
   * @description 是否显示下拉箭头
   * @default true
   */
  showArrow?: boolean;
  /**
   * @description 是否截断超出触发器宽度的文本
   * @default true
   */
  ellipsis?: boolean;
  /**
   * @description 是否禁用
   * @default false
   */
  disabled?: boolean;
  /**
   * @description 点击清除图标时的回调
   */
  onClear?: (event: React.MouseEvent) => void;
}
