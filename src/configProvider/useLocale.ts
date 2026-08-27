import { ConfigProvider as AntdConfigProvider } from 'antd';
import { useContext, useMemo } from 'react';
import type { LocaleComponentMap } from '../locales';
import { en_US, zh_CN } from '../locales';
import { ConfigContext } from './context';
import { deepMergeLocale } from './mergeLocale';

/**
 * 获取当前组件对应的完整国际化文案。
 *
 * 具备多级深度 Fallback 与宿主感知机制：
 * 1. 优先读取本库 ConfigContext 的 locale；
 * 2. 若未配置，自动读取宿主 Antd ConfigContext 的 locale 标识（如检测到以 'en' 开头自动感知切换为 en_US 语言包）；
 * 3. 若均未命中，默认以 zh_CN 兜底，避免运行时报错；
 * 4. 支持传入组件实例的 customLocale 进行单例局部深层覆盖。
 *
 * @param componentName 业务组件名称，如 'Modal', 'Drawer', 'Table', 'PopoverSelect'
 * @param customLocale 组件单例显式传入的局部语言配置（可选）
 */
export const useLocale = <K extends keyof LocaleComponentMap>(
  componentName: K,
  customLocale?: Partial<LocaleComponentMap[K]>,
): LocaleComponentMap[K] => {
  const { locale } = useContext(ConfigContext);
  const antdGlobalConfig = useContext(AntdConfigProvider.ConfigContext);

  return useMemo(() => {
    // 智能感知宿主 antd 语言环境
    const antdLocaleCode = antdGlobalConfig?.locale?.locale?.toLowerCase();
    const isHostEnglish = Boolean(antdLocaleCode?.startsWith('en'));

    const baseLocaleMap = isHostEnglish ? en_US : zh_CN;
    const defaultComponentLocale =
      baseLocaleMap[componentName] || ({} as LocaleComponentMap[K]);
    const contextComponentLocale = locale?.[componentName];

    // 深度合并默认语言包、Context 语言包与单例 customLocale
    const mergedWithContext = contextComponentLocale
      ? deepMergeLocale(defaultComponentLocale, contextComponentLocale)
      : defaultComponentLocale;

    if (!customLocale) {
      return mergedWithContext;
    }

    return deepMergeLocale(mergedWithContext, customLocale);
  }, [locale, antdGlobalConfig?.locale?.locale, componentName, customLocale]);
};
