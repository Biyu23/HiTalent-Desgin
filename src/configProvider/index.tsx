import { ConfigProvider as AntdConfigProvider } from 'antd';
import React, { useCallback, useContext, useMemo } from 'react';
import { isNullOrBlank } from '../util';
import type { ConfigContextValue } from './context';
import { ConfigContext, defaultPrefixCls, useConfig } from './context';
import { mergeLocale } from './mergeLocale';
import { mergeTheme } from './mergeTheme';
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

const InternalConfigProvider: React.FC<ConfigProviderProps> = ({
  prefixCls,
  antdPrefixCls,
  iconPrefixCls,
  locale,
  antdLocale,
  localeOverrides,
  direction,
  theme,
  children,
  ...restAntdProps
}) => {
  const parentConfig = useContext(ConfigContext);
  const mergedPrefixCls =
    prefixCls ?? parentConfig.prefixCls ?? defaultPrefixCls;
  const mergedAntdPrefixCls = antdPrefixCls ?? parentConfig.antdPrefixCls;
  const mergedIconPrefixCls = iconPrefixCls ?? parentConfig.iconPrefixCls;
  const mergedTheme = useMemo(
    () => mergeTheme(parentConfig.theme, theme),
    [parentConfig.theme, theme],
  );
  const mergedAntdLocale = antdLocale ?? parentConfig.antdLocale;

  const getPrefixCls = useCallback(
    (suffixCls?: string, customPrefix?: string): string => {
      if (!isNullOrBlank(customPrefix)) {
        return customPrefix;
      }
      return suffixCls ? `${mergedPrefixCls}-${suffixCls}` : mergedPrefixCls;
    },
    [mergedPrefixCls],
  );

  const baseLocale = locale ?? parentConfig.locale;
  const resolvedDirection =
    direction ?? locale?.direction ?? parentConfig.direction;

  const mergedLocale = useMemo(() => {
    const merged = mergeLocale(baseLocale, localeOverrides);
    if (merged.direction === resolvedDirection) {
      return merged;
    }
    return {
      ...merged,
      direction: resolvedDirection,
    };
  }, [baseLocale, localeOverrides, resolvedDirection]);

  const config: ConfigContextValue = useMemo(
    () => ({
      prefixCls: mergedPrefixCls,
      antdPrefixCls: mergedAntdPrefixCls,
      iconPrefixCls: mergedIconPrefixCls,
      getPrefixCls,
      locale: mergedLocale,
      antdLocale: mergedAntdLocale,
      direction: resolvedDirection,
      theme: mergedTheme,
    }),
    [
      mergedPrefixCls,
      mergedAntdPrefixCls,
      mergedIconPrefixCls,
      getPrefixCls,
      mergedLocale,
      mergedAntdLocale,
      resolvedDirection,
      mergedTheme,
    ],
  );

  return (
    <AntdConfigProvider
      {...restAntdProps}
      prefixCls={mergedAntdPrefixCls}
      iconPrefixCls={mergedIconPrefixCls}
      direction={resolvedDirection}
      theme={mergedTheme}
      locale={mergedAntdLocale}
    >
      <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>
    </AntdConfigProvider>
  );
};

export const ConfigProvider = InternalConfigProvider as ConfigProviderType;
ConfigProvider.useConfig = useConfig;
ConfigProvider.ConfigContext = ConfigContext;
ConfigProvider.defaultPrefixCls = defaultPrefixCls;
