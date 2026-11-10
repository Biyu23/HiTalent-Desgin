import { useMemo } from 'react';
import type { LocaleComponentMap } from '../locales';
import { useLocaleSettings } from './context';
import { mergeComponentLocale } from './mergeLocale';

/** 显式指定的 HTD 语言包优先于宿主语言；实例文案覆盖两者。 */
export const useLocale = <K extends keyof LocaleComponentMap>(
  componentName: K,
  customLocale?: Partial<LocaleComponentMap[K]>,
): LocaleComponentMap[K] => {
  const { base, overrides } = useLocaleSettings();
  const locale = base[componentName];
  const componentOverrides = overrides?.[componentName];
  const merged = useMemo(
    () => mergeComponentLocale(locale, componentOverrides),
    [locale, componentOverrides],
  );
  return useMemo(
    () => mergeComponentLocale(merged, customLocale),
    [merged, customLocale],
  );
};
