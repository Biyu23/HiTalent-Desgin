import type {
  ConfigProviderProps as AntdConfigProviderProps,
  ThemeConfig,
} from 'antd';
import { ConfigProvider as AntdConfigProvider } from 'antd';
import { createContext, useContext, useMemo } from 'react';
import type { HtdLocale, LocaleDirection, LocaleOverrides } from '../locales';
import { en_US, zh_CN } from '../locales';
import { isNullOrBlank } from '../utils';
import { mergeLocale } from './mergeLocale';

export interface ConfigContextValue {
  /** HiTalent Design 默认/全局组件前缀，默认为 'htd' */
  prefixCls: string;
  /** 底层 Ant Design 组件 class 前缀（可选） */
  antdPrefixCls?: string;
  /** 图标 class 前缀（可选） */
  iconPrefixCls?: string;
  /** 获取指定组件的完整类名前缀 */
  getPrefixCls: (suffixCls?: string, customPrefix?: string) => string;
  /** 当前语言包 */
  locale: HtdLocale;
  /** 底层 Ant Design 语言包（可选） */
  antdLocale?: AntdConfigProviderProps['locale'];
  /** 当前布局方向 */
  direction: LocaleDirection;
  /** 主题配置（可选） */
  theme?: ThemeConfig;
}

export const defaultPrefixCls = 'htd';

// Track internal snapshots by identity so object spreads remain public overrides.
const resolvedLocales = new WeakMap<ConfigContextValue, HtdLocale>();

export const markResolvedConfig = (
  config: ConfigContextValue,
): ConfigContextValue => {
  resolvedLocales.set(config, config.locale);
  return config;
};

export const getExplicitLocale = (
  config: ConfigContextValue,
): HtdLocale | undefined =>
  config.locale !== resolvedLocales.get(config) ? config.locale : undefined;

export const createGetPrefixCls =
  (prefixCls: string) =>
  (suffixCls?: string, customPrefix?: string): string => {
    if (!isNullOrBlank(customPrefix)) return customPrefix;
    return suffixCls ? `${prefixCls}-${suffixCls}` : prefixCls;
  };

// Keep explicit locale settings separate from host-derived defaults.
export const LocaleSettingsContext = createContext<{
  locale?: HtdLocale;
  overrides?: LocaleOverrides;
  /** Public context already incorporated by the nearest HTD provider. */
  sourceConfig?: ConfigContextValue;
}>({});

export const defaultConfig = markResolvedConfig({
  prefixCls: defaultPrefixCls,
  getPrefixCls: createGetPrefixCls(defaultPrefixCls),
  locale: zh_CN,
  direction: zh_CN.direction,
});

export const ConfigContext = createContext<ConfigContextValue>(defaultConfig);

export const useLocaleSettings = () => {
  const config = useContext(ConfigContext);
  const { locale, overrides, sourceConfig } = useContext(LocaleSettingsContext);
  const antd = useContext(AntdConfigProvider.ConfigContext);
  const base =
    (config !== sourceConfig ? getExplicitLocale(config) : undefined) ??
    locale ??
    (antd.locale?.locale?.toLowerCase().startsWith('en') ? en_US : zh_CN);
  const direction = antd.direction ?? base.direction;
  return { base, overrides, direction };
};

export const useResolvedLocale = (): HtdLocale => {
  const { base, overrides, direction } = useLocaleSettings();
  return useMemo(() => {
    const merged = mergeLocale(base, overrides);
    return merged.direction === direction ? merged : { ...merged, direction };
  }, [base, overrides, direction]);
};

/** 获取当前全局 ConfigContext 配置。 */
export const useConfig = (): ConfigContextValue => {
  const config = useContext(ConfigContext);
  const antd = useContext(AntdConfigProvider.ConfigContext);
  const locale = useResolvedLocale();
  return useMemo(
    () =>
      markResolvedConfig({
        ...config,
        antdPrefixCls: antd.getPrefixCls(),
        iconPrefixCls: antd.iconPrefixCls,
        antdLocale: antd.locale,
        theme: antd.theme,
        direction: locale.direction,
        locale,
      }),
    [config, antd, locale],
  );
};
