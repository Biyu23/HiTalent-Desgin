import type { InputNumberProps } from 'antd';
import type React from 'react';

export type NumberRangeValue = [number | null, number | null];
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
  disabled?: boolean | [boolean, boolean];
  readOnly?: boolean | [boolean, boolean];
  placeholder?: [string, string];
  separator?: React.ReactNode;
  prefixCls?: string;
}
