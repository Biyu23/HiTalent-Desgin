import type { FormInstance } from 'antd';
import React, { useCallback, useMemo } from 'react';
import type { SearchFormFieldItem, SearchSearchInfo } from '../type';

export interface ActiveFilterItem {
  name: string;
  label: React.ReactNode;
  content: React.ReactNode;
  tooltipText: string;
  onRemove: () => void;
}

interface UseActiveFiltersOptions<Values extends object> {
  fields: SearchFormFieldItem<Values>[];
  form: FormInstance<Values>;
  currentValues: Partial<Values>;
  initialValues?: Partial<Values>;
  searchMode?: 'submit' | 'change';
  onSearch?: (values: Values, info: SearchSearchInfo) => void;
}

/**
 * 判断值是否为空（null、undefined、空字符串、空数组）
 */
function isEmptyValue(value: unknown): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  if (Array.isArray(value) && value.length === 0) return true;
  return false;
}

/**
 * 将任意值转换为可读的展示文本
 */
function formatDefaultValue(value: unknown): string {
  if (isEmptyValue(value)) return '';
  if (typeof value === 'boolean') return value ? '是' : '否';
  if (Array.isArray(value)) {
    if (value.length <= 3) {
      return value.map(String).join(', ');
    }
    return `${value.slice(0, 3).map(String).join(', ')} 等 ${value.length} 项`;
  }
  if (typeof value === 'object') {
    // 可能是日期对象或自定义对象
    if (value instanceof Date) {
      return value.toLocaleDateString();
    }
    // 判断是否是类似 dayjs 的对象（具有 format 方法）
    if (
      value &&
      'format' in (value as Record<string, unknown>) &&
      typeof (value as { format: unknown }).format === 'function'
    ) {
      return (value as { format: (fmt?: string) => string }).format(
        'YYYY-MM-DD',
      );
    }
    return JSON.stringify(value);
  }
  return String(value);
}

export function useActiveFilters<Values extends object>({
  fields,
  form,
  currentValues,
  initialValues,
  searchMode = 'submit',
  onSearch,
}: UseActiveFiltersOptions<Values>) {
  const activeFilters = useMemo(() => {
    const result: ActiveFilterItem[] = [];

    fields.forEach((field) => {
      const value = currentValues[field.name as keyof Values];
      if (isEmptyValue(value)) return;

      // 如果提供了自定义 formatTag
      let customTag: React.ReactNode | false | null = null;
      if (field.formatTag) {
        customTag = field.formatTag(value, currentValues as Values, form);
        if (customTag === false || customTag === null) {
          return;
        }
      }

      const defaultText = formatDefaultValue(value);
      const content =
        customTag !== null && customTag !== undefined
          ? customTag
          : `${String(field.label)}: ${defaultText}`;

      const tooltipText =
        typeof content === 'string'
          ? content
          : `${String(field.label)}: ${defaultText}`;

      const handleRemove = () => {
        if (field.onClear) {
          field.onClear(form);
        } else {
          form.setFieldValue(field.name as never, undefined as never);
        }

        const nextValues = {
          ...form.getFieldsValue(),
          [field.name]: undefined,
        } as Values;

        if (searchMode === 'change') {
          onSearch?.(nextValues, { source: 'tag-remove' });
        } else {
          onSearch?.(nextValues, { source: 'tag-remove' });
        }
      };

      result.push({
        name: field.name,
        label: field.label,
        content,
        tooltipText,
        onRemove: handleRemove,
      });
    });

    return result;
  }, [currentValues, fields, form, onSearch, searchMode]);

  const clearAll = useCallback(() => {
    // 重置所有字段到初始值或清空
    if (initialValues) {
      form.setFieldsValue(initialValues as never);
    } else {
      form.resetFields();
    }
    const resetVals = form.getFieldsValue();
    onSearch?.(resetVals, { source: 'reset' });
  }, [form, initialValues, onSearch]);

  return {
    activeFilters,
    clearAll,
    hasActiveFilters: activeFilters.length > 0,
  };
}
