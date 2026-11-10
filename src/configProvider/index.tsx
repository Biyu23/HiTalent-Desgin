import { ConfigProvider as AntdConfigProvider } from 'antd';
import React, { useContext, useMemo } from 'react';
import {
  ConfigContext,
  createGetPrefixCls,
  defaultPrefixCls,
  LocaleSettingsContext,
  useConfig,
} from './context';
import { mergeLocale } from './mergeLocale';
import type { ConfigProviderProps } from './type';

export { ConfigContext, defaultPrefixCls, useConfig } from './context';
export type { ConfigContextValue, ConfigProviderProps } from './type';
export { useLocale } from './useLocale';
export { useAntdPrefixCls, usePrefixCls } from './usePrefixCls';

// 在内部 AntdConfigProvider 生效后生成 HiTalent 配置快照。
const ConfigContextBridge: React.FC<{ prefixCls?: string }> = ({
  prefixCls,
  children,
}) => {
  const inherited = useConfig();
  const mergedPrefixCls = prefixCls ?? inherited.prefixCls;
  const getPrefixCls = useMemo(
    () => createGetPrefixCls(mergedPrefixCls),
    [mergedPrefixCls],
  );
  const config = useMemo(
    () => ({
      ...inherited,
      prefixCls: mergedPrefixCls,
      getPrefixCls,
    }),
    [inherited, mergedPrefixCls, getPrefixCls],
  );
  return (
    <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>
  );
};

const InternalConfigProvider: React.FC<ConfigProviderProps> = ({
  prefixCls,
  antdPrefixCls,
  locale,
  antdLocale,
  localeOverrides,
  direction,
  children,
  ...antdProps
}) => {
  const parentLocale = useContext(LocaleSettingsContext);
  const localeSettings = useMemo(() => {
    if (!locale && !localeOverrides) return parentLocale;
    return {
      locale: locale ?? parentLocale.locale,
      // 新的完整语言包替换父级文案；否则继承父级覆盖配置。
      overrides: locale
        ? localeOverrides
        : mergeLocale(parentLocale.overrides ?? {}, localeOverrides),
    };
  }, [locale, localeOverrides, parentLocale]);

  return (
    <AntdConfigProvider
      {...antdProps}
      prefixCls={antdPrefixCls}
      direction={direction ?? locale?.direction}
      locale={antdLocale}
    >
      <LocaleSettingsContext.Provider value={localeSettings}>
        <ConfigContextBridge prefixCls={prefixCls}>
          {children}
        </ConfigContextBridge>
      </LocaleSettingsContext.Provider>
    </AntdConfigProvider>
  );
};

export const ConfigProvider = Object.assign(InternalConfigProvider, {
  useConfig,
  ConfigContext,
  defaultPrefixCls,
});

export type ConfigProviderType = typeof ConfigProvider;
