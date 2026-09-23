import type React from 'react';
import { useMemo } from 'react';
import type { SearchFieldGroup, SearchFormFieldItem } from '../type';
import { groupFields } from '../utils';

/** 菜单与抽屉共用同一套快捷字段及分组规则。 */
export function useSearchFormGroups<Values extends object>(
  fields: SearchFormFieldItem<Values>[],
  groups: SearchFieldGroup[] | undefined,
  fallbackTitle: React.ReactNode,
) {
  return useMemo(
    () => ({
      quickFields: fields.filter((field) => field.quick),
      sections: groupFields(
        fields.filter((field) => !field.quick),
        groups,
        fallbackTitle,
      ),
    }),
    [fields, groups, fallbackTitle],
  );
}
