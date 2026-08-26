import type {
  ConfigProviderProps as AntdConfigProviderProps,
  ThemeConfig,
} from 'antd';
import type React from 'react';
import type { HtdLocale, LocaleDirection, LocaleOverrides } from '../locales';

export interface ConfigProviderProps
  extends Omit<
    AntdConfigProviderProps,
    | 'prefixCls'
    | 'iconPrefixCls'
    | 'locale'
    | 'direction'
    | 'theme'
    | 'children'
  > {
  /** HiTalent Design 组件样式类名前缀，默认继承父级 ConfigProvider，根节点默认为 'htd' */
  prefixCls?: string;
  /** 底层 Ant Design 组件 class 前缀，透传给 AntdConfigProvider */
  antdPrefixCls?: string;
  /** 图标 class 前缀，透传给 AntdConfigProvider */
  iconPrefixCls?: string;
  /** HiTalent Design 完整语言包，默认继承父级 ConfigProvider，根节点默认为 zh_CN */
  locale?: HtdLocale;
  /** 底层 Ant Design 语言包，透传给 AntdConfigProvider */
  antdLocale?: AntdConfigProviderProps['locale'];
  /** 基于当前完整语言包局部覆盖组件文案 */
  localeOverrides?: LocaleOverrides;
  /** 文字方向；显式配置优先于语言包方向 */
  direction?: LocaleDirection;
  /** Ant Design 5 动态主题配置，自动与父级主题深度合并并透传给 AntdConfigProvider */
  theme?: ThemeConfig;
  children?: React.ReactNode;
}
