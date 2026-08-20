import type { TooltipPlacement } from 'antd/es/tooltip';
import React, { ReactNode } from 'react';
import type { FieldNames } from '../../hooks/useFieldNames';
import type { NativeProps } from '../../types';

export type { FieldNames };

export type RawValueType = string | number;

export interface DefaultOptionType {
  label: ReactNode;
  value: string | number;
  disabled?: boolean;
  [key: string]: any;
}

export interface PopoverSelectProps<
  ValueType extends RawValueType = RawValueType,
  OptionType extends Record<string, any> = DefaultOptionType,
> extends NativeProps {
  /**
   * @description 样式类名前缀
   */
  prefixCls?: string;
  /**
   * @description 数据配置选项
   * @default []
   */
  options?: OptionType[];
  /**
   * @description 选择框默认提示文字
   */
  placeholder?: ReactNode;
  /**
   * @description 是否显示搜索框
   * @default false
   */
  showSearch?: boolean;
  /**
   * @description 是否允许清除
   * @default false
   */
  allowClear?: boolean;
  /**
   * @description 单选 / 多选模式
   * @default 'single'
   */
  mode?: 'single' | 'multiple';
  /**
   * @description 当前选中值（受控）
   */
  value?: ValueType | ValueType[];
  /**
   * @description 默认选中值（非受控）
   */
  defaultValue?: ValueType | ValueType[];
  /**
   * @description 选中值变更回调
   */
  onChange?: (value: ValueType | ValueType[], options?: OptionType[]) => void;
  /**
   * @description 自定义字段映射，适配后端非标准数据结构
   */
  fieldNames?: FieldNames;
  /**
   * @description 自定义下拉面板渲染
   */
  dropdownRender?: (menu: React.ReactElement) => React.ReactElement;
  /**
   * @description 多选模式下是否显示确认提交按钮
   * @default true
   */
  showConfirm?: boolean;
  /**
   * @description 是否显示取消按钮
   * @default false
   */
  showCancelBtn?: boolean;
  /**
   * @description 是否显示清空按钮
   * @default false
   */
  showClearBtn?: boolean;
  /**
   * @description 自定义选项渲染
   */
  optionRender?: (item: OptionType) => React.ReactNode;
  /**
   * @description 多选模式下多个值的分隔符
   * @default ', '
   */
  separator?: string;
  /**
   * @description 多选模式下最多显示的标签数，超出部分以 +N 省略显示
   */
  maxTagCount?: number;
  /**
   * @description 是否开启虚拟滚动
   * @default true
   */
  virtual?: boolean;
  /**
   * @description 下拉列表最大高度（px）
   * @default 150
   */
  listHeight?: number;
  /**
   * @description 虚拟滚动每项高度（px）
   * @default 34
   */
  listItemHeight?: number;
  /**
   * @description 值的提交格式：string 为拼接字符串，array 为数组
   * @default 'string'
   */
  valueType?: 'string' | 'array';
  /**
   * @description valueType 为 string 时的分隔符
   * @default ','
   */
  valueSeparator?: string;
  /**
   * @description 多选模式下是否显示全选按钮
   * @default false
   */
  showSelectAll?: boolean;
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
   * @description 是否支持文本截断省略及 Tooltip 提示
   * @default true
   */
  ellipsis?: boolean | { tooltip?: string };
  /**
   * @description 下拉弹窗展开状态（受控）
   */
  open?: boolean;
  /**
   * @description 下拉弹窗展开状态变化回调
   */
  onOpenChange?: (open: boolean) => void;
  /**
   * @description 下拉弹窗展开/关闭动画结束后的回调
   */
  afterOpenChange?: (open: boolean) => void;
  /**
   * @description 气泡框位置
   * @default 'bottomLeft'
   */
  placement?: TooltipPlacement;
  /**
   * @description 浮层渲染父节点
   */
  getPopupContainer?: (triggerNode: HTMLElement) => HTMLElement;
  /**
   * @description 气泡被遮挡时是否自动调整位置
   * @default true
   */
  autoAdjustOverflow?: boolean;
  /**
   * @description 关闭后是否销毁 Popover
   * @default false
   */
  destroyTooltipOnHide?: boolean;
  /**
   * @description 弹出浮层根节点类名
   */
  rootClassName?: string;
}

export interface SelectorProps extends NativeProps {
  /** 样式类名前缀 */
  prefixCls?: string;
  /** 下拉内容渲染函数或节点 */
  content: React.ReactNode | (() => React.ReactNode);
  /** 气泡被遮挡时是否自动调整位置 */
  autoAdjustOverflow?: boolean;
  /** 弹出浮层根节点类名 */
  rootClassName?: string;
  /** 下拉弹窗展开/关闭动画结束后的回调 */
  afterOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  allowClear?: boolean;
  hasValue?: boolean;
  showArrow?: boolean;
  disabled?: boolean;
  onClear?: (e: React.MouseEvent) => void;
  placement?: TooltipPlacement;
  getPopupContainer?: (triggerNode: HTMLElement) => HTMLElement;
  destroyTooltipOnHide?: boolean;
}
