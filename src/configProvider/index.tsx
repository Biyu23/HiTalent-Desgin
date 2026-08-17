import { ConfigProvider as AntdConfigProvider } from 'antd';
import React, { useCallback, useContext, useMemo } from 'react';
import { ConfigContext, defaultPrefixCls } from './context';
import { mergeLocale } from './mergeLocale';
import type { ConfigProviderProps } from './type';

export { ConfigContext, defaultPrefixCls } from './context';
export type { ConfigContextValue } from './context';
export type { ConfigProviderProps } from './type';
export { useLocale } from './useLocale';
export { useNamespace, usePrefixCls } from './usePrefixCls';
export type { UseNamespaceResult } from './usePrefixCls';

export const ConfigProvider: React.FC<ConfigProviderProps> = ({
  prefixCls,
  antdPrefixCls,
  iconPrefixCls,
  locale,
  localeOverrides,
  direction,
  children,
}) => {
  const parentConfig = useContext(ConfigContext);
  const mergedPrefixCls =
    prefixCls ?? parentConfig.prefixCls ?? defaultPrefixCls;
  const mergedAntdPrefixCls = antdPrefixCls ?? parentConfig.antdPrefixCls;
  const mergedIconPrefixCls = iconPrefixCls ?? parentConfig.iconPrefixCls;

  const getPrefixCls = useCallback(
    (suffixCls?: string, customPrefix?: string) => {
      if (customPrefix) return customPrefix;
      return suffixCls ? `${mergedPrefixCls}-${suffixCls}` : mergedPrefixCls;
    },
    [mergedPrefixCls],
  );

  const baseLocale = locale ?? parentConfig.locale;
  const resolvedDirection =
    direction ?? locale?.direction ?? parentConfig.direction;

  const mergedLocale = useMemo(
    () => ({
      ...mergeLocale(baseLocale, localeOverrides),
      direction: resolvedDirection,
    }),
    [baseLocale, localeOverrides, resolvedDirection],
  );

  const config = useMemo(
    () => ({
      prefixCls: mergedPrefixCls,
      antdPrefixCls: mergedAntdPrefixCls,
      iconPrefixCls: mergedIconPrefixCls,
      getPrefixCls,
      locale: mergedLocale,
      direction: resolvedDirection,
    }),
    [
      mergedPrefixCls,
      mergedAntdPrefixCls,
      mergedIconPrefixCls,
      getPrefixCls,
      mergedLocale,
      resolvedDirection,
    ],
  );

  return (
    <AntdConfigProvider
      prefixCls={mergedAntdPrefixCls}
      iconPrefixCls={mergedIconPrefixCls}
      direction={resolvedDirection}
    >
      <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>
    </AntdConfigProvider>
  );
};
