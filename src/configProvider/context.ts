import { createContext } from 'react';
import type { HtdLocale, LocaleDirection } from '../locales';
import { zh_CN } from '../locales';

export interface ConfigContextValue {
  prefixCls: string;
  locale: HtdLocale;
  direction: LocaleDirection;
}

export const defaultConfig: ConfigContextValue = {
  prefixCls: 'htd',
  locale: zh_CN,
  direction: zh_CN.direction,
};

export const ConfigContext = createContext<ConfigContextValue>(defaultConfig);
