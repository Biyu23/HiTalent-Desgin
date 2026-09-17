import type React from 'react';
import type { SearchFieldGroup, SearchFormFieldItem } from './type';

export function isEmptyValue(value: unknown): boolean {
  return (
    value === null ||
    value === undefined ||
    (typeof value === 'string' && value.trim() === '') ||
    (Array.isArray(value) && value.length === 0)
  );
}

export function formatFilterValue(value: unknown): string {
  if (isEmptyValue(value)) return '';
  if (Array.isArray(value)) return value.map(formatFilterValue).join(', ');
  if (value instanceof Date) return value.toLocaleDateString();
  if (typeof value === 'object' && value !== null) {
    if ('format' in value && typeof value.format === 'function')
      return value.format('YYYY-MM-DD');
    return JSON.stringify(value);
  }
  return String(value);
}

/** 保留声明顺序，将未匹配字段放入独立分组，避免与业务分组键冲突。 */
export function groupFields<Values extends object>(
  fields: SearchFormFieldItem<Values>[],
  groups: SearchFieldGroup[] | undefined,
  fallbackTitle: React.ReactNode,
) {
  const result = (groups || []).map((group) => ({
    ...group,
    key: `group:${group.key}`,
    fields: [] as SearchFormFieldItem<Values>[],
  }));
  const byKey = new Map(
    (groups || []).map((group, index) => [group.key, result[index]]),
  );
  const ungrouped: SearchFormFieldItem<Values>[] = [];
  for (const field of fields) {
    const group =
      field.group === undefined ? undefined : byKey.get(field.group);
    (group ? group.fields : ungrouped).push(field);
  }
  if (ungrouped.length)
    result.push({ key: 'ungrouped', title: fallbackTitle, fields: ungrouped });
  return result.filter((group) => group.fields.length > 0);
}
