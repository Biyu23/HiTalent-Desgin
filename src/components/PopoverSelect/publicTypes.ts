import type { TooltipPlacement } from 'antd/es/tooltip';
import type React from 'react';
import type { NativeProps } from '../../types';
import type {
  SemanticClassNames,
  SemanticStyleProps,
  SemanticStyles,
} from '../_util/semanticStyles';

export type RawValueType = string | number;

export interface DefaultOptionType {
  label: React.ReactNode;
  value: RawValueType;
  disabled?: boolean;
}

export interface PopoverSelectFieldNames<OptionType extends object> {
  label?: keyof OptionType;
  value?: keyof OptionType;
  disabled?: keyof OptionType;
}

export type PopoverSelectSlot =
  | 'root'
  | 'trigger'
  | 'triggerText'
  | 'actions'
  | 'popup'
  | 'search'
  | 'selectAll'
  | 'menu'
  | 'item'
  | 'footer'
  | 'empty';

export type PopoverSelectClassNames = SemanticClassNames<PopoverSelectSlot>;
export type PopoverSelectStyles = SemanticStyles<PopoverSelectSlot>;

interface PopoverSelectBaseProps<OptionType extends object>
  extends Omit<NativeProps, 'children'>,
    SemanticStyleProps<PopoverSelectSlot> {
  prefixCls?: string;
  options?: readonly OptionType[];
  placeholder?: React.ReactNode;
  showSearch?: boolean;
  allowClear?: boolean;
  fieldNames?: PopoverSelectFieldNames<OptionType>;
  dropdownRender?: (menu: React.ReactElement) => React.ReactElement;
  showConfirm?: boolean;
  showCancelBtn?: boolean;
  showClearBtn?: boolean;
  optionRender?: (item: OptionType) => React.ReactNode;
  separator?: string;
  maxTagCount?: number;
  virtual?: boolean;
  listHeight?: number;
  listItemHeight?: number;
  showSelectAll?: boolean;
  showArrow?: boolean;
  disabled?: boolean;
  ellipsis?: boolean | { tooltip?: string };
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  afterOpenChange?: (open: boolean) => void;
  placement?: TooltipPlacement;
  getPopupContainer?: (triggerNode: HTMLElement) => HTMLElement;
  autoAdjustOverflow?: boolean;
  destroyTooltipOnHide?: boolean;
}

export interface PopoverSelectSingleProps<
  ValueType extends RawValueType = RawValueType,
  OptionType extends object = DefaultOptionType,
> extends PopoverSelectBaseProps<OptionType> {
  mode?: 'single';
  valueType?: never;
  value?: ValueType;
  defaultValue?: ValueType;
  onChange?: (value: ValueType | undefined, options: OptionType[]) => void;
}

export interface PopoverSelectMultipleArrayProps<
  ValueType extends RawValueType = RawValueType,
  OptionType extends object = DefaultOptionType,
> extends PopoverSelectBaseProps<OptionType> {
  mode: 'multiple';
  valueType: 'array';
  value?: ValueType[];
  defaultValue?: ValueType[];
  onChange?: (value: ValueType[], options: OptionType[]) => void;
}

export interface PopoverSelectMultipleStringProps<
  OptionType extends object = DefaultOptionType,
> extends PopoverSelectBaseProps<OptionType> {
  mode: 'multiple';
  valueType: 'string';
  /** JSON array string; preserves string and number option value types. */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string, options: OptionType[]) => void;
}

export type PopoverSelectProps<
  ValueType extends RawValueType = RawValueType,
  OptionType extends object = DefaultOptionType,
> =
  | PopoverSelectSingleProps<ValueType, OptionType>
  | PopoverSelectMultipleArrayProps<ValueType, OptionType>
  | PopoverSelectMultipleStringProps<OptionType>;

export interface SelectorProps
  extends Omit<NativeProps, 'children'>,
    SemanticStyleProps<PopoverSelectSlot> {
  content: React.ReactNode | (() => React.ReactNode);
  autoAdjustOverflow?: boolean;
  afterOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  allowClear?: boolean;
  hasValue?: boolean;
  showArrow?: boolean;
  disabled?: boolean;
  onClear?: (event: React.MouseEvent) => void;
  placement?: TooltipPlacement;
  getPopupContainer?: (triggerNode: HTMLElement) => HTMLElement;
  destroyTooltipOnHide?: boolean;
}
