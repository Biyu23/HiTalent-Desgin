import { ConfigProvider as AntdConfigProvider } from 'antd';
import React, { useContext, useMemo } from 'react';
import { ConfigContext } from './context';
import { mergeLocale } from './mergeLocale';
import type { ConfigProviderProps } from './type';

export type { ConfigProviderProps } from './type';

export const ConfigProvider: React.FC<ConfigProviderProps> = ({
  prefixCls,
  locale,
  localeOverrides,
  direction,
  children,
}) => {
  const parentConfig = useContext(ConfigContext);
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
      prefixCls: prefixCls ?? parentConfig.prefixCls,
      locale: mergedLocale,
      direction: resolvedDirection,
    }),
    [prefixCls, parentConfig.prefixCls, mergedLocale, resolvedDirection],
  );

  return (
    <AntdConfigProvider direction={resolvedDirection}>
      <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>
    </AntdConfigProvider>
  );
};
