import { useContext, useMemo } from 'react';
import type { LocaleComponentMap } from '../locales';
import { zh_CN } from '../locales';
import { ConfigContext } from './context';
import { deepMergeLocale } from './mergeLocale';

/**
 * 获取当前组件对应的完整国际化文案。
 *
 * 具备多级深度 Fallback 机制：
 * 1. 若当前 Context 的语言包中缺失该组件或嵌套字段，自动使用默认中文包 (zh_CN) 深度补齐，避免解构运行时报错；
 * 2. 支持传入组件实例的 customLocale 进行单例局部深层覆盖。
 *
 * @param componentName 业务组件名称，如 'Modal', 'Drawer', 'Table', 'PopoverSelect'
 * @param customLocale 组件单例显式传入的局部语言配置（可选）
 */
export const useLocale = <K extends keyof LocaleComponentMap>(
  componentName: K,
  customLocale?: Partial<LocaleComponentMap[K]>,
): LocaleComponentMap[K] => {
  const { locale } = useContext(ConfigContext);

  return useMemo(() => {
    const defaultComponentLocale =
      zh_CN[componentName] || ({} as LocaleComponentMap[K]);
    const contextComponentLocale = locale?.[componentName];

    // 深度合并默认语言包、Context语言包与单例customLocale
    const mergedWithContext = contextComponentLocale
      ? deepMergeLocale(defaultComponentLocale, contextComponentLocale)
      : defaultComponentLocale;

    if (!customLocale) {
      return mergedWithContext;
    }

    return deepMergeLocale(mergedWithContext, customLocale);
  }, [locale, componentName, customLocale]);
};
