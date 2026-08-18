import React, { useMemo } from 'react';
import type { FieldNames } from '../../../hooks';

/**
 * 选项映射 + 搜索过滤
 *
 * 将后端返回的原始选项数据映射为组件内部统一格式（label/value/disabled），
 * 并根据搜索关键词过滤出 displayOptions（支持 label、ReactNode 文本与 value 多维检索）。
 */
export function useOptions<
  OptionType extends Record<string, any>,
  MappedOption extends Record<string, any>,
>(
  optionsProp: OptionType[],
  fieldNames: Required<FieldNames>,
  getFieldValue: (item: any, field: any) => any,
  searchValue: string,
) {
  const options = useMemo(() => {
    const rawOptions = optionsProp || [];
    const isStandardFieldNames =
      fieldNames.label === 'label' &&
      fieldNames.value === 'value' &&
      fieldNames.disabled === 'disabled';

    if (isStandardFieldNames) {
      return rawOptions as unknown as MappedOption[];
    }

    return rawOptions.map((item: OptionType) => {
      const mappedItem: Record<string, any> = { ...item };
      const label = getFieldValue(item, 'label');
      const value = getFieldValue(item, 'value');
      const disabled = getFieldValue(item, 'disabled');
      if (label !== undefined) mappedItem.label = label;
      if (value !== undefined) mappedItem.value = value;
      if (disabled !== undefined) mappedItem.disabled = disabled;
      return mappedItem as MappedOption;
    });
  }, [optionsProp, fieldNames, getFieldValue]);

  const optionMap = useMemo(() => {
    const map = new Map<MappedOption['value'], MappedOption>();
    options.forEach((opt: MappedOption) => {
      map.set(opt.value, opt);
    });
    return map;
  }, [options]);

  const displayOptions = useMemo(() => {
    const trimmedSearch = searchValue.trim().toLowerCase();
    if (!trimmedSearch) return options;

    return options.filter((item: MappedOption) => {
      let labelText = '';
      if (typeof item.label === 'string' || typeof item.label === 'number') {
        labelText = String(item.label);
      } else if (
        React.isValidElement(item.label) &&
        typeof (item.label.props as any)?.children === 'string'
      ) {
        labelText = (item.label.props as any).children;
      }
      const valueText = item.value !== undefined ? String(item.value) : '';
      return (
        labelText.toLowerCase().includes(trimmedSearch) ||
        valueText.toLowerCase().includes(trimmedSearch)
      );
    });
  }, [options, searchValue]);

  const hasOptions = options.length > 0;
  const hasDisplayOptions = displayOptions.length > 0;

  return { options, optionMap, displayOptions, hasOptions, hasDisplayOptions };
}
