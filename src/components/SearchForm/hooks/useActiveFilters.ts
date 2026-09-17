import type { FormInstance } from 'antd';
import React, { useMemo } from 'react';
import type { SearchFormFieldItem } from '../type';
import { formatFilterValue, isEmptyValue } from '../utils';

export interface ActiveFilterItem {
  name: string;
  content: React.ReactNode;
  tooltipText?: string;
  onRemove: () => void;
}

interface UseActiveFiltersOptions<Values extends object> {
  fields: SearchFormFieldItem<Values>[];
  form: FormInstance<Values>;
  currentValues: Values;
  onRemove: (field: SearchFormFieldItem<Values>, index?: number) => void;
}

export function useActiveFilters<Values extends object>({
  fields,
  form,
  currentValues,
  onRemove,
}: UseActiveFiltersOptions<Values>) {
  return useMemo(
    () =>
      fields.flatMap((field) => {
        const value = currentValues[field.name as keyof Values];
        if (isEmptyValue(value)) return [];
        const content = field.formatTag
          ? field.formatTag(value, currentValues, form)
          : React.createElement(
              React.Fragment,
              null,
              field.label,
              ': ',
              formatFilterValue(value),
            );
        if (content === null || content === undefined || content === false)
          return [];
        return [
          {
            name: field.name,
            content,
            tooltipText: typeof content === 'string' ? content : undefined,
            onRemove: () => onRemove(field),
          },
        ];
      }),
    [fields, form, currentValues, onRemove],
  );
}
