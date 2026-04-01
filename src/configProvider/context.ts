import { createContext } from 'react';

export interface ConfigContextProps {
  //前缀样式名
  prefixCls?: string;
}

export const defaultConfig: ConfigContextProps = {
  prefixCls: 'my-ui',
};

export const ConfigContext = createContext<ConfigContextProps>(defaultConfig);
