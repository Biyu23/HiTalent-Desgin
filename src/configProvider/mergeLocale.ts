import type { HtdLocale, LocaleOverrides } from '../locales';

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  Object.prototype.toString.call(value) === '[object Object]';

function mergeDefined(base: unknown, overrides: unknown): unknown {
  if (overrides === undefined) return base;

  if (!isPlainObject(base) || !isPlainObject(overrides)) {
    return overrides;
  }

  const merged: Record<string, unknown> = { ...base };

  Object.keys(overrides).forEach((key) => {
    merged[key] = mergeDefined(base[key], overrides[key]);
  });

  return merged;
}

/** 在完整语言包上应用局部文案覆盖，不修改传入对象。 */
export function mergeLocale(
  locale: HtdLocale,
  overrides?: LocaleOverrides,
): HtdLocale {
  if (!overrides) return locale;

  return mergeDefined(locale, overrides) as HtdLocale;
}
