import { useMemo } from 'react';
import type { LocaleComponentMap } from '../locales';
import { useLocaleSettings } from './context';
import { deepMergeLocale } from './mergeLocale';

/** Explicit HTD locale takes precedence over the host language; instance copy overrides both. */
export const useLocale = <K extends keyof LocaleComponentMap>(
  componentName: K,
  customLocale?: Partial<LocaleComponentMap[K]>,
): LocaleComponentMap[K] => {
  const { base, overrides } = useLocaleSettings();
  const locale = base[componentName];
  const componentOverrides = overrides?.[componentName];
  const merged = useMemo(
    () => deepMergeLocale(locale, componentOverrides),
    [locale, componentOverrides],
  );
  return useMemo(
    () => deepMergeLocale(merged, customLocale),
    [merged, customLocale],
  );
};
