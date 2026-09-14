import type {
  ConfigProviderProps as AntdConfigProviderProps,
  ThemeConfig,
} from 'antd';
import type React from 'react';
import type { HtdLocale, LocaleDirection, LocaleOverrides } from '../locales';

export interface ConfigProviderProps
  extends Omit<AntdConfigProviderProps, 'prefixCls' | 'locale' | 'direction'> {
  /** HiTalent Design 组件样式类名前缀，默认继承父级 ConfigProvider，根节点默认为 'htd' */
  prefixCls?: string;
  /** 底层 Ant Design 组件 class 前缀，透传给 AntdConfigProvider */
  antdPrefixCls?: string;
  /** 图标 class 前缀，透传给 AntdConfigProvider */
  iconPrefixCls?: string;
  /** 完整语言包；继承父级显式语言，否则跟随 Antd 英文语言，其他情况回退 zh_CN */
  locale?: HtdLocale;
  /** 底层 Ant Design 语言包，透传给 AntdConfigProvider */
  antdLocale?: AntdConfigProviderProps['locale'];
  /** 基于当前完整语言包局部覆盖组件文案 */
  localeOverrides?: LocaleOverrides;
  /** 文字方向；优先于本层显式语言包方向，未指定则继承 Antd 方向 */
  direction?: LocaleDirection;
  /** Ant Design 5 主题配置，直接透传，由 Antd 处理主题继承 */
  theme?: ThemeConfig;
  children?: React.ReactNode;
}
