import { createContext } from 'react';
import { zh_CN } from '../locales';

export interface ConfigContextProps {
  //前缀样式名
  prefixCls?: string;
  //语言包
  locale?: Record<string, any>;
}

export const defaultConfig: ConfigContextProps = {
  prefixCls: 'my-ui',
  locale: zh_CN,
};

export const ConfigContext = createContext<ConfigContextProps>(defaultConfig);
