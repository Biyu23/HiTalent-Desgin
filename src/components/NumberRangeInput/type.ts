import type { InputNumberProps } from 'antd';
import type React from 'react';

/** 区间两端允许为空；调用方负责保证外部传入值的顺序和范围。 */
export type NumberRangeValue = [number | null, number | null];

/** 两端可独立设置的数字展示与编辑选项，不能覆盖组内值和区间约束。 */
export type NumberRangeInputFieldProps = Pick<
  InputNumberProps<number>,
  'precision' | 'step' | 'formatter' | 'parser' | 'prefix' | 'suffix'
>;

export interface NumberRangeInputRef {
  /** 聚焦指定一端，默认聚焦最小值。 */
  focus: (side?: 'start' | 'end') => void;
  /** 移出输入框焦点。 */
  blur: () => void;
}
export interface NumberRangeInputProps
  extends Omit<
      React.HTMLAttributes<HTMLDivElement>,
      'defaultValue' | 'onChange' | 'placeholder' | 'children'
    >,
    Pick<
      InputNumberProps<number>,
      | 'min'
      | 'max'
      | 'precision'
      | 'step'
      | 'formatter'
      | 'parser'
      | 'size'
      | 'status'
    > {
  /** 受控区间；传入 undefined 时清空两端。 */
  value?: NumberRangeValue;
  /** 非受控初始值，默认为 [null, null]。 */
  defaultValue?: NumberRangeValue;
  /** 任一端变化时返回完整区间，空端为 null。 */
  onChange?: (value: NumberRangeValue) => void;
  /** 整组禁用，或分别设置最小值、最大值端。 */
  disabled?: boolean | [boolean, boolean];
  /** 整组只读，或分别设置最小值、最大值端。 */
  readOnly?: boolean | [boolean, boolean];
  /** 两端占位文案，默认使用组件语言配置。 */
  placeholder?: [string, string];
  /** 两端之间的分隔内容，默认为 —。 */
  separator?: React.ReactNode;
  /** 最小值端配置，同名选项优先于组件公共配置。 */
  startInputProps?: NumberRangeInputFieldProps;
  /** 最大值端配置，同名选项优先于组件公共配置。 */
  endInputProps?: NumberRangeInputFieldProps;
  /** 焦点从组件外进入时触发，内部两端切换不触发。 */
  onFocus?: React.FocusEventHandler<HTMLDivElement>;
  /** 焦点离开整个组件时触发，内部两端切换不触发。 */
  onBlur?: React.FocusEventHandler<HTMLDivElement>;
  /** 自定义组件样式前缀。 */
  prefixCls?: string;
}
