import React, { ReactNode } from 'react';
import { FieldNames } from '../../hooks';
import { NativeProps } from '../../types';

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
   * @default 32
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
}

export interface SelectorProps extends NativeProps {
  /** 下拉内容渲染函数，传递函数引用以配合 memo 优化 */
  content: () => React.ReactNode;
  autoAdjustOverflow?: boolean;
  rootClassName?: string;
  openClassName?: string;
  afterOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  ellipsis?: boolean | { tooltip?: string };
  allowClear?: boolean;
  hasValue?: boolean;
  showArrow?: boolean;
  onClear?: (e: React.MouseEvent) => void;
}
