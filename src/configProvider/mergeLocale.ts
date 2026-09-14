import type { HtdLocale, LocaleOverrides } from '../locales';
import { isNullOrBlank, isPlainObject } from '../utils';

/**
 * 递归深度合并语言包对象，保留所有默认兜底字段
 */
export function deepMergeLocale<T>(base: T, overrides?: unknown): T {
  if (isNullOrBlank(overrides) || Object.is(base, overrides)) return base;

  if (!isPlainObject(base) || !isPlainObject(overrides)) {
    return overrides as T;
  }

  let merged = base;

  Object.keys(overrides).forEach((key) => {
    const overrideVal = (overrides as Record<string, unknown>)[key];
    const value = deepMergeLocale(base[key], overrideVal);
    if (!Object.is(value, base[key])) {
      // Copy only changed branches, keeping untouched component locales stable.
      if (merged === base) merged = { ...base };
      Object.defineProperty(merged, key, {
        value,
        enumerable: true,
        configurable: true,
        writable: true,
      });
    }
  });

  return merged as T;
}

/** 在完整语言包上应用局部文案覆盖，不修改传入对象。 */
export function mergeLocale(
  locale: HtdLocale,
  overrides?: LocaleOverrides,
): HtdLocale {
  return deepMergeLocale(locale, overrides);
}
