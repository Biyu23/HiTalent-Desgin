import type React from 'react';
import type { HtdLocale, LocaleDirection, LocaleOverrides } from '../locales';

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
