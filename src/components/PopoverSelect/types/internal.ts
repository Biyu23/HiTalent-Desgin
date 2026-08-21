import type React from 'react';
import type { RawValueType } from '../publicTypes';

export interface MappedOption<
  ValueType extends RawValueType,
  OptionType extends object,
> {
  label: React.ReactNode;
  value: ValueType;
  disabled: boolean;
  source: OptionType;
}
