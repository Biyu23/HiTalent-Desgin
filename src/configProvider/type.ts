import type { ConfigProviderProps as AntdConfigProviderProps } from 'antd';
import type { HtdLocale, LocaleDirection, LocaleOverrides } from '../locales';

export interface ConfigContextValue {
  /** HiTalent Design 组件 class 前缀，默认为 'htd' */
  prefixCls: string;
  /** 底层 Ant Design 组件 class 前缀 */
  antdPrefixCls?: string;
  /** 图标 class 前缀 */
  iconPrefixCls?: string;
  /** 获取指定组件的完整类名前缀 */
  getPrefixCls: (suffixCls?: string, customPrefix?: string) => string;
  /** 合并局部文案后的完整语言包 */
  locale: HtdLocale;
  /** 底层 Ant Design 语言包 */
  antdLocale?: AntdConfigProviderProps['locale'];
  /** 当前布局方向 */
  direction: LocaleDirection;
  /** 由 Ant Design 处理继承的主题配置 */
  theme?: AntdConfigProviderProps['theme'];
}

export interface ConfigProviderProps
  extends Omit<AntdConfigProviderProps, 'locale'> {
  /** HiTalent Design 组件样式类名前缀，默认继承父级 ConfigProvider，根节点默认为 'htd' */
  prefixCls?: string;
  /** 底层 Ant Design 组件 class 前缀，透传给 AntdConfigProvider */
  antdPrefixCls?: string;
  /** 完整语言包；继承父级显式语言，否则跟随 Antd 英文语言，其他情况回退 zh_CN */
  locale?: HtdLocale;
  /** 底层 Ant Design 语言包，透传给 AntdConfigProvider */
  antdLocale?: AntdConfigProviderProps['locale'];
  /** 基于当前完整语言包局部覆盖组件文案 */
  localeOverrides?: LocaleOverrides;
}
