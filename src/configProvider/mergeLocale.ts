import type { LocaleOverrides } from '../locales';
import { isNullOrBlank } from '../utils';

/** 按字段覆盖组件文案，空白值继续继承原文案。 */
export function mergeComponentLocale<T extends object>(
  base: T,
  overrides?: Partial<T>,
): T {
  if (!overrides) return base;

  let merged = base;
  for (const key of Object.keys(overrides) as (keyof T)[]) {
    const value: T[keyof T] | undefined = overrides[key];
    if (isNullOrBlank(value) || value === base[key]) {
      continue;
    }
    if (merged === base) merged = { ...base };
    merged[key] = value;
  }
  return merged;
}

/** 语言包只合并到组件字段层，保留未变化组件的引用。 */
export function mergeLocale<T extends LocaleOverrides>(
  base: T,
  overrides?: LocaleOverrides,
): T {
  if (!overrides) return base;

  let merged = base;
  for (const key of Object.keys(overrides) as (keyof LocaleOverrides)[]) {
    const componentOverrides = overrides[key];
    if (!componentOverrides) continue;
    const componentLocale = base[key] ?? {};
    const locale = mergeComponentLocale(componentLocale, componentOverrides);
    if (locale === componentLocale) continue;
    if (merged === base) merged = { ...base };
    Object.assign(merged, { [key]: locale });
  }
  return merged;
}
