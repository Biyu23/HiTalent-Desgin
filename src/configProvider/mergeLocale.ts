import type { HtdLocale, LocaleOverrides } from '../locales';
import { isNullOrBlank, isPlainObject } from '../utils';

/**
 * 递归深度合并语言包对象，保留所有默认兜底字段
 */
export function deepMergeLocale<T>(base: T, overrides?: unknown): T {
  if (isNullOrBlank(overrides)) return base;

  if (!isPlainObject(base) || !isPlainObject(overrides)) {
    return (overrides !== undefined ? overrides : base) as T;
  }

  const merged: Record<string, unknown> = { ...base };

  Object.keys(overrides).forEach((key) => {
    const overrideVal = (overrides as Record<string, unknown>)[key];
    if (!isNullOrBlank(overrideVal)) {
      merged[key] = deepMergeLocale(merged[key], overrideVal);
    }
  });

  return merged as T;
}

/** 在完整语言包上应用局部文案覆盖，不修改传入对象。 */
export function mergeLocale(
  locale: HtdLocale,
  overrides?: LocaleOverrides,
): HtdLocale {
  if (isNullOrBlank(overrides)) return locale;

  return deepMergeLocale(locale, overrides);
}
