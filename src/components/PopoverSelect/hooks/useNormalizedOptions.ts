import React, { useMemo } from 'react';
import type {
  MappedOption,
  PopoverSelectFieldNames,
  RawValueType,
} from '../type';
import { getNodeText, readField } from '../utils';

/**
 * 规范化选项数据，处理字段名映射、去重与搜索过滤
 */
export function useNormalizedOptions<
  ValueType extends RawValueType,
  OptionType extends object,
>(
  source: readonly OptionType[],
  fieldNames: PopoverSelectFieldNames<OptionType> | undefined,
  searchValue: string,
) {
  const options = useMemo(() => {
    const result: Array<MappedOption<ValueType, OptionType>> = [];
    const values = new Set<RawValueType>();
    const labelKey = fieldNames?.label ?? 'label';
    const valueKey = fieldNames?.value ?? 'value';
    const disabledKey = fieldNames?.disabled ?? 'disabled';

    source.forEach((option, index) => {
      const value = readField(option, valueKey);
      if (typeof value !== 'string' && typeof value !== 'number') {
        if (process.env.NODE_ENV !== 'production') {
          console.error(
            `PopoverSelect ignored option at index ${index}: value must be a string or number.`,
          );
        }
        return;
      }
      if (values.has(value)) {
        if (process.env.NODE_ENV !== 'production') {
          console.error(
            `PopoverSelect ignored duplicate option value "${String(value)}".`,
          );
        }
        return;
      }
      values.add(value);
      result.push({
        label: readField(option, labelKey) as React.ReactNode,
        value: value as ValueType,
        disabled: Boolean(readField(option, disabledKey)),
        source: option,
      });
    });
    return result;
  }, [fieldNames?.disabled, fieldNames?.label, fieldNames?.value, source]);

  const optionMap = useMemo(
    () => new Map(options.map((option) => [option.value, option])),
    [options],
  );

  const displayOptions = useMemo(() => {
    const query = searchValue.trim().toLocaleLowerCase();
    if (!query) return options;
    return options.filter(
      (option) =>
        getNodeText(option.label).toLocaleLowerCase().includes(query) ||
        String(option.value).toLocaleLowerCase().includes(query),
    );
  }, [options, searchValue]);

  return { options, optionMap, displayOptions };
}
