import { createContext } from 'react';
import type { LocaleProp } from '../locales';
import { zh_CN } from '../locales';

export interface ConfigContextProps {
  /** 样式类名前缀，默认 'htd' */
  prefixCls?: string;
  /** 语言包：支持传入 locale 字符串（'zh-CN' | 'en-US'）或自定义 DeepPartial 语言包对象 */
  locale?: LocaleProp;
}

export const defaultConfig: ConfigContextProps = {
  prefixCls: 'htd',
  locale: zh_CN,
};

export const ConfigContext = createContext<ConfigContextProps>(defaultConfig);
