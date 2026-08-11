import { ConfigProvider as AntdConfigProvider } from 'antd';
import React, { useContext, useMemo } from 'react';
import type { HtdLocale, LocaleDirection, LocaleOverrides } from '../locales';
import { ConfigContext } from './context';
import { mergeLocale } from './mergeLocale';

export interface ConfigProviderProps {
  /** 样式类名前缀，默认继承父级 ConfigProvider，根节点默认为 'htd' */
  prefixCls?: string;
  /** 完整语言包，默认继承父级 ConfigProvider，根节点默认为 zh_CN */
  locale?: HtdLocale;
  /** 基于当前完整语言包局部覆盖组件文案 */
  localeOverrides?: LocaleOverrides;
  /** 文字方向；显式配置优先于语言包方向 */
  direction?: LocaleDirection;
  children?: React.ReactNode;
}

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
