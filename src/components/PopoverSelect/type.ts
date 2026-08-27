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
  /** 根容器的 className */
  root?: string;
  /** 触发器按钮的 className */
  trigger?: string;
  /** 触发器内部文本容器的 className */
  triggerText?: string;
  /** 触发器右侧操作区（箭头与清除图标）的 className */
  actions?: string;
  /** 弹出气泡容器的 className */
  popup?: string;
  /** 搜索输入框区域的 className */
  search?: string;
  /** 全选复选框区域的 className */
  selectAll?: string;
  /** 选项菜单列表的 className */
  menu?: string;
  /** 单个选项节点的 className */
  item?: string;
  /** 底部操作按钮区域的 className */
  footer?: string;
  /** 无数据/无匹配空状态区域的 className */
  empty?: string;
}

/** 组件语义化行内样式配置 */
export interface PopoverSelectStyles {
  /** 根容器的行内样式 */
  root?: React.CSSProperties;
  /** 触发器按钮的行内样式 */
  trigger?: React.CSSProperties;
  /** 弹出气泡容器的行内样式 */
  popup?: React.CSSProperties;
  /** 选项菜单列表的行内样式 */
  menu?: React.CSSProperties;
}

/** 兼容旧版插槽类型别名 */
export type PopoverSelectClassNameSlot = keyof PopoverSelectClassNames;
export type PopoverSelectStyleSlot = keyof PopoverSelectStyles;
export type PopoverSelectSlot = PopoverSelectClassNameSlot;

/** PopoverSelect 基础属性 */
export interface PopoverSelectBaseProps<
  OptionType extends object = DefaultOptionType,
> extends Omit<NativeProps, 'children'> {
  /**
   * @description 自定义组件样式前缀
   */
  prefixCls?: string;
  /**
   * @description 根节点类名
   */
  rootClassName?: string;
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
  dropdownRender?: (menu: React.ReactElement) => React.ReactElement;
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
  optionRender?: (item: OptionType) => React.ReactNode;
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
  /**
   * @description 弹层展开状态（受控）
   */
  open?: boolean;
  /**
   * @description 弹层展开状态变化时的回调
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * @description 弹层显示/隐藏动画完成后的回调
   */
  afterOpenChange?: (open: boolean) => void;
  /**
   * @description 气泡框展开位置
   * @default 'bottomLeft'
   */
  placement?: TooltipPlacement;
  /**
   * @description 浮层渲染挂载的父节点
   */
  getPopupContainer?: (triggerNode: HTMLElement) => HTMLElement;
  /**
   * @description 气泡被遮挡时是否自动调整位置
   * @default true
   */
  autoAdjustOverflow?: boolean;
  /**
   * @description 关闭时是否销毁 Popover 内部节点
   * @default false
   */
  destroyTooltipOnHide?: boolean;
}

/** 单选模式属性 */
export interface PopoverSelectSingleProps<
  ValueType extends RawValueType = RawValueType,
  OptionType extends object = DefaultOptionType,
> extends PopoverSelectBaseProps<OptionType> {
  /**
   * @description 选择模式，单选
   * @default 'single'
   */
  mode?: 'single';
  valueType?: never;
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
> extends PopoverSelectBaseProps<OptionType> {
  /**
   * @description 选择模式，多选
   */
  mode: 'multiple';
  /**
   * @description 值提交类型，默认为数组格式
   * @default 'array'
   */
  valueType?: 'array';
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

/** 多选模式属性（JSON 数组字符串格式输出） */
export interface PopoverSelectMultipleStringProps<
  OptionType extends object = DefaultOptionType,
> extends PopoverSelectBaseProps<OptionType> {
  /**
   * @description 选择模式，多选
   */
  mode: 'multiple';
  /**
   * @description 值提交类型，JSON 数组字符串格式（精确保留字符串与数字类型）
   */
  valueType: 'string';
  /**
   * @description 当前选中的 JSON 数组字符串值，例如 `'["FE", 1]'`（受控）
   */
  value?: string;
  /**
   * @description 默认选中的 JSON 数组字符串值（非受控）
   */
  defaultValue?: string;
  /**
   * @description 选中值发生变化时的回调，返回 JSON 数组字符串
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
  | PopoverSelectMultipleStringProps<OptionType>;

/** PopoverSelect.Selector 独立触发器组件属性 */
export interface SelectorProps extends Omit<NativeProps, 'children'> {
  /**
   * @description 类名前缀
   */
  prefixCls?: string;
  /**
   * @description 气泡框内部承载的内容或渲染函数
   */
  content: React.ReactNode | (() => React.ReactNode);
  /**
   * @description 根节点类名
   */
  rootClassName?: string;
  /**
   * @description 语义化类名插槽
   */
  classNames?: PopoverSelectClassNames;
  /**
   * @description 语义化样式插槽
   */
  styles?: PopoverSelectStyles;
  /**
   * @description 气泡被遮挡时是否自动调整位置
   * @default true
   */
  autoAdjustOverflow?: boolean;
  /**
   * @description 弹层显示/隐藏动画完成后的回调
   */
  afterOpenChange?: (open: boolean) => void;
  /**
   * @description 触发器内部展示的文本或节点
   */
  children?: React.ReactNode;
  /**
   * @description 弹层展开状态（受控）
   */
  open?: boolean;
  /**
   * @description 弹层展开状态变化回调
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * @description 是否支持清除
   * @default true
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
   * @description 是否禁用
   * @default false
   */
  disabled?: boolean;
  /**
   * @description 点击清除图标时的回调
   */
  onClear?: (event: React.MouseEvent) => void;
  /**
   * @description 气泡框展开位置
   * @default 'bottomLeft'
   */
  placement?: TooltipPlacement;
  /**
   * @description 浮层渲染挂载父节点
   */
  getPopupContainer?: (triggerNode: HTMLElement) => HTMLElement;
  /**
   * @description 关闭时是否销毁浮层
   * @default false
   */
  destroyTooltipOnHide?: boolean;
}
