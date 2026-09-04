import React, { useMemo } from 'react';
import type {
  MappedOption,
  PopoverSelectFieldNames,
  RawValueType,
} from '../type';
import { getNodeText, readField } from '../utils';

/**
 * 规范化选项数据 Hook：
 * 1. 字段映射：根据 fieldNames（label / value / disabled）将外部 OptionType 映射为统一的 MappedOption。
 * 2. 快速查找：建立原始值索引及字符串值索引，支持选项查找与字符串值类型恢复。
 * 3. 搜索过滤：根据 searchValue 对选项文本或值进行不区分大小写的过滤。
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
    const labelKey = fieldNames?.label ?? 'label';
    const valueKey = fieldNames?.value ?? 'value';
    const disabledKey = fieldNames?.disabled ?? 'disabled';

    return source.map((option) => ({
      label: readField(option, labelKey) as React.ReactNode,
      value: readField(option, valueKey) as ValueType,
      disabled: Boolean(readField(option, disabledKey)),
      source: option,
    }));
  }, [fieldNames?.disabled, fieldNames?.label, fieldNames?.value, source]);

  const optionMap = useMemo(
    () =>
      new Map<ValueType, MappedOption<ValueType, OptionType>>(
        options.map((option) => [option.value, option]),
      ),
    [options],
  );

  const stringValueMap = useMemo(() => {
    const map = new Map<string, ValueType>();
    options.forEach((option) => {
      const key = String(option.value);
      if (!map.has(key)) map.set(key, option.value);
    });
    return map;
  }, [options]);

  const displayOptions = useMemo(() => {
    const query = searchValue.trim().toLocaleLowerCase();
    if (!query) return options;
    return options.filter(
      (option) =>
        getNodeText(option.label).toLocaleLowerCase().includes(query) ||
        String(option.value).toLocaleLowerCase().includes(query),
    );
  }, [options, searchValue]);

  return { options, optionMap, stringValueMap, displayOptions };
}
