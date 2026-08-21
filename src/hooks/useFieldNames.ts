import { useCallback, useMemo } from 'react';
export interface FieldNames {
  label?: string;
  value?: string;
  children?: string;
  disabled?: string;
}

export type MergedFieldNames = Required<FieldNames>;

const defaultFieldNames: MergedFieldNames = {
  label: 'label',
  value: 'value',
  children: 'children',
  disabled: 'disabled',
};

/**
 * 专门处理 fieldNames 映射的自定义 Hook
 * * @param customFieldNames 外部传入的自定义字段名
 * @returns 包含合并后的字段对象和一个安全获取数据的辅助函数
 */
export function useFieldNames(customFieldNames?: FieldNames) {
  const fieldNames = useMemo<MergedFieldNames>(() => {
    return {
      ...defaultFieldNames,
      ...(customFieldNames || {}),
    };
  }, [customFieldNames]);

  const getFieldValue = useCallback(
    <T extends object>(item: T, field: keyof FieldNames) => {
      const targetKey = fieldNames[field];
      return (item as Record<string, unknown>)[targetKey];
    },
    [fieldNames],
  );

  return {
    fieldNames,
    getFieldValue,
  };
}
