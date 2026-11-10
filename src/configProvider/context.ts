import { ConfigProvider as AntdConfigProvider } from 'antd';
import { createContext, useContext, useMemo } from 'react';
import type { HtdLocale, LocaleOverrides } from '../locales';
import { en_US, zh_CN } from '../locales';
import { isNullOrBlank } from '../utils';
import { mergeLocale } from './mergeLocale';
import type { ConfigContextValue } from './type';

export type { ConfigContextValue } from './type';

export const defaultPrefixCls = 'htd';

export const createGetPrefixCls =
  (prefixCls: string) =>
  (suffixCls?: string, customPrefix?: string): string => {
    if (!isNullOrBlank(customPrefix)) return customPrefix;
    return suffixCls ? `${prefixCls}-${suffixCls}` : prefixCls;
  };

// 将显式语言设置与从宿主获取的默认值分开保存。
export const LocaleSettingsContext = createContext<{
  locale?: HtdLocale;
  overrides?: LocaleOverrides;
}>({});

const defaultConfig: ConfigContextValue = {
  prefixCls: defaultPrefixCls,
  getPrefixCls: createGetPrefixCls(defaultPrefixCls),
  locale: zh_CN,
  direction: zh_CN.direction,
};

export const ConfigContext = createContext<ConfigContextValue>(defaultConfig);

export const useLocaleSettings = () => {
  const { locale, overrides } = useContext(LocaleSettingsContext);
  const antd = useContext(AntdConfigProvider.ConfigContext);
  const base =
    locale ??
    (antd.locale?.locale?.toLowerCase().startsWith('en') ? en_US : zh_CN);
  return { base, overrides, antd };
};

/** 读取 HiTalent 配置，并同步最近的 Ant Design 配置。 */
export const useConfig = (): ConfigContextValue => {
  const config = useContext(ConfigContext);
  const { base, overrides, antd } = useLocaleSettings();
  const direction = antd.direction ?? base.direction;
  const locale = useMemo(() => {
    const merged = mergeLocale(base, overrides);
    return merged.direction === direction ? merged : { ...merged, direction };
  }, [base, overrides, direction]);
  return useMemo(
    () => ({
      ...config,
      antdPrefixCls: antd.getPrefixCls(),
      iconPrefixCls: antd.iconPrefixCls,
      antdLocale: antd.locale,
      theme: antd.theme,
      direction,
      locale,
    }),
    [config, antd, direction, locale],
  );
};
