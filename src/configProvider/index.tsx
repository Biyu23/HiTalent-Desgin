import { ConfigProvider as AntdConfigProvider } from 'antd';
import React, { useContext, useMemo } from 'react';
import {
  ConfigContext,
  createGetPrefixCls,
  defaultPrefixCls,
  getExplicitLocale,
  LocaleSettingsContext,
  markResolvedConfig,
  useConfig,
} from './context';
import { deepMergeLocale } from './mergeLocale';
import type { ConfigProviderProps } from './type';

export { ConfigContext, defaultPrefixCls, useConfig } from './context';
export type { ConfigContextValue } from './context';
export type { ConfigProviderProps } from './type';
export { useLocale } from './useLocale';
export { useAntdPrefixCls, usePrefixCls } from './usePrefixCls';

export interface ConfigProviderType extends React.FC<ConfigProviderProps> {
  useConfig: typeof useConfig;
  ConfigContext: typeof ConfigContext;
  defaultPrefixCls: typeof defaultPrefixCls;
}

// 在 AntdConfigProvider 下读取原生配置，不再合并或重复应用。
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
    () =>
      markResolvedConfig({
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
  const parentConfig = useContext(ConfigContext);
  const inheritedLocale =
    getExplicitLocale(parentConfig) ?? parentLocale.locale;
  const localeSettings = useMemo(
    () => ({
      locale: locale ?? inheritedLocale,
      sourceConfig: parentConfig,
      // 新的完整语言包替换父级文案；否则继承父级覆盖配置。
      overrides: locale
        ? localeOverrides
        : deepMergeLocale(parentLocale.overrides, localeOverrides),
    }),
    [
      locale,
      localeOverrides,
      inheritedLocale,
      parentLocale.overrides,
      parentConfig,
    ],
  );

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

export const ConfigProvider = InternalConfigProvider as ConfigProviderType;
ConfigProvider.useConfig = useConfig;
ConfigProvider.ConfigContext = ConfigContext;
ConfigProvider.defaultPrefixCls = defaultPrefixCls;
