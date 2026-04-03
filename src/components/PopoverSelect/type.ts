import { type PopoverProps, type TypographyProps } from 'antd';
import { ComponentProps, ReactNode } from 'react';

export type DefaultOptionType = {
  label: ReactNode;
  value: string | number;
  disabled?: boolean;
  [key: string]: any;
};

export type ParagraphProps = ComponentProps<TypographyProps['Paragraph']>;

export type SelectorProps = Pick<
  PopoverProps,
  | 'content'
  | 'autoAdjustOverflow'
  | 'rootClassName'
  | 'openClassName'
  | 'afterOpenChange'
> &
  Pick<ParagraphProps, 'ellipsis'> & {
    className?: string;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    disabled?: boolean;
    children?: React.ReactNode;
    allowClear?: boolean;
    hasValue?: boolean;
    onClear?: (e: React.MouseEvent) => void;
  };

export interface FieldNames {
  label?: string;
  value?: string;
  children?: string;
  disabled?: string;
}

export type RawValueType = string | number;

export type BasePopoverSelectProps<OptionType = DefaultOptionType> = {
  className?: string;
  style?: React.CSSProperties;
  fieldNames?: FieldNames;
  options?: OptionType[];
  placeholder?: ReactNode;
  /**
   * 是否显示搜索框
   * @default false
   */
  showSearch?: boolean;
  /**
   * 是否允许清除
   * @default false
   */
  allowClear?: boolean;
  /**
   * 多选模式下是否显示提交按钮
   * @default true
   */
  showConfirm?: boolean;
  /**
   * 多选模式下是否取消按钮
   * @default false
   */
  showCancelBtn?: boolean;
  /**
   * 多选模式下是否显示清空按钮
   * @default false
   */
  showClearBtn?: boolean;
  /**
   * 展示文字的分割符号
   * @default ', '
   */
  separator?: string;
  /**
   * 最多展示的标签数量，超出部分会被隐藏
   * @default 3
   */
  maxTagCount?: number;
  /**
   * 是否开启虚拟滚动
   * @default false
   */
  virtual?: boolean;
  /**
   * 虚拟滚动时，列表的高度
   */
  listHeight?: number;
  /**
   * 虚拟滚动时，列表项的高度
   */
  listItemHeight?: number;
  /**
   * 提交值类型（多选时生效）
   * @default 'string'
   */
  valueType?: 'string' | 'array';
  /**
   * 提交值为 string 时的拼接字符
   * @default ','
   */
  valueSeparator?: string;
  /**
   * 多选模式下是否显示全选按钮
   * @default false
   */
  showSelectAll?: boolean;
  /**
   * 自定义渲染下拉
   */
  dropdownRender?: (menu: React.ReactElement) => React.ReactNode;
  /**
   * 自定义渲染下拉选项
   */
  optionRender?: (option: OptionType) => ReactNode;
};

// 单选
export type SingleSelectProps<
  ValueType = RawValueType,
  OptionType = DefaultOptionType,
> = {
  mode?: 'single';
  value?: ValueType;
  defaultValue?: ValueType;
  onChange?: (value: ValueType, option?: OptionType) => void;
};

// 多选
export type MultipleSelectProps<
  ValueType = RawValueType,
  OptionType = DefaultOptionType,
> = {
  mode: 'multiple';
  value?: ValueType | ValueType[];
  defaultValue?: ValueType | ValueType[];
  onChange?: (value: ValueType | ValueType[], options?: OptionType[]) => void;
};

export type PopoverSelectProps<
  ValueType = RawValueType,
  OptionType = DefaultOptionType,
> = BasePopoverSelectProps<OptionType> &
  (
    | SingleSelectProps<ValueType, OptionType>
    | MultipleSelectProps<ValueType, OptionType>
  );
