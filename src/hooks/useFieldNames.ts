import { useCallback, useMemo } from 'react';
// 1. 定义支持的字段类型 (可以根据你的实际需求增删)
export interface FieldNames {
  label?: string;
  value?: string;
  children?: string;
  disabled?: string;
}

// 2. 内部使用的完整字段类型 (确保所有字段都有默认值)
export type MergedFieldNames = Required<FieldNames>;

// 3. 默认字段配置
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
    <T extends Record<string, any>>(item: T, field: keyof FieldNames) => {
      const targetKey = fieldNames[field];
      return item[targetKey];
    },
    [fieldNames],
  );

  return {
    fieldNames,
    getFieldValue,
  };
}
