import { useMemo } from 'react';
import type { FieldNames } from '../../../hooks';

/**
 * 选项映射 + 搜索过滤
 *
 * 将后端返回的原始选项数据映射为组件内部统一格式（label/value/disabled），
 * 并根据搜索关键词过滤出 displayOptions。
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
    return optionsProp.map((item: OptionType) => {
      const mappedItem: Record<string, any> = { ...item };
      Object.entries(fieldNames).forEach(([standardKey, customKey]) => {
        if (customKey && typeof customKey === 'string') {
          const fieldValue = getFieldValue(
            item,
            standardKey as keyof FieldNames,
          );
          if (fieldValue !== undefined) {
            mappedItem[standardKey] = fieldValue;
          }
        }
      });
      return mappedItem as MappedOption;
    });
  }, [optionsProp, fieldNames, getFieldValue]);

  const displayOptions = useMemo(() => {
    if (!searchValue) return options;
    return options.filter((item: MappedOption) => {
      const labelStr = String(item.label || '').toLowerCase();
      return labelStr.includes(searchValue.toLowerCase());
    });
  }, [options, searchValue]);

  const hasOptions = options.length > 0;
  const hasDisplayOptions = displayOptions.length > 0;

  return { options, displayOptions, hasOptions, hasDisplayOptions };
}
