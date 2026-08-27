import type {
  ConfigProviderProps as AntdConfigProviderProps,
  ThemeConfig,
} from 'antd';
import { createContext, useContext } from 'react';
import type { HtdLocale, LocaleDirection } from '../locales';
import { zh_CN } from '../locales';
import { isNullOrBlank } from '../utils';

export interface ConfigContextValue {
  /** HiTalent Design 默认/全局组件前缀，默认为 'htd' */
  prefixCls: string;
  /** 底层 Ant Design 组件 class 前缀（可选） */
  antdPrefixCls?: string;
  /** 图标 class 前缀（可选） */
  iconPrefixCls?: string;
  /** 获取指定组件的完整类名前缀 */
  getPrefixCls: (suffixCls?: string, customPrefix?: string) => string;
  /** 当前语言包 */
  locale: HtdLocale;
  /** 底层 Ant Design 语言包（可选） */
  antdLocale?: AntdConfigProviderProps['locale'];
  /** 当前布局方向 */
  direction: LocaleDirection;
  /** 主题配置（可选） */
  theme?: ThemeConfig;
}

export const defaultPrefixCls = 'htd';

export const defaultConfig: ConfigContextValue = {
  prefixCls: defaultPrefixCls,
  getPrefixCls: (suffixCls?: string, customPrefix?: string): string => {
    if (!isNullOrBlank(customPrefix)) {
      return customPrefix;
    }
    return suffixCls ? `${defaultPrefixCls}-${suffixCls}` : defaultPrefixCls;
  },
  locale: zh_CN,
  direction: zh_CN.direction,
};

export const ConfigContext = createContext<ConfigContextValue>(defaultConfig);

/**
 * 获取当前全局 ConfigContext 配置
 */
export const useConfig = (): ConfigContextValue => {
  return useContext(ConfigContext);
};
