import React, { useMemo } from 'react';
import type {
  MappedOption,
  PopoverSelectFieldNames,
  RawValueType,
} from '../type';
import { getNodeText } from '../utils';

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
  // 字段映射和索引在同一次遍历中完成，搜索时复用结果。
  const { options, optionMap, stringValueMap } = useMemo(() => {
    const labelKey = fieldNames?.label ?? 'label';
    const valueKey = fieldNames?.value ?? 'value';
    const disabledKey = fieldNames?.disabled ?? 'disabled';
    const optionMap = new Map<ValueType, MappedOption<ValueType, OptionType>>();
    const stringValueMap = new Map<string, ValueType>();
    const options = source.map((source) => {
      const fields = source as Record<PropertyKey, unknown>;
      const option = {
        label: fields[labelKey] as React.ReactNode,
        value: fields[valueKey] as ValueType,
        disabled: Boolean(fields[disabledKey]),
        source,
      };
      optionMap.set(option.value, option);
      const key = String(option.value);
      // 字符串模式无法区分 1 和 '1'，沿用首个匹配项。
      if (!stringValueMap.has(key)) stringValueMap.set(key, option.value);
      return option;
    });
    return { options, optionMap, stringValueMap };
  }, [fieldNames?.disabled, fieldNames?.label, fieldNames?.value, source]);

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
