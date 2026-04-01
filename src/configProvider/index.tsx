import React from 'react';
import { ConfigContext, ConfigContextProps } from './context';

export interface CustomConfigProviderProps extends ConfigContextProps {
  children?: React.ReactNode;
}

export const CustomConfigProvider: React.FC<CustomConfigProviderProps> = ({
  prefixCls,
  children,
}) => {
  // 合并用户传入的配置和默认配置
  const config = {
    prefixCls: prefixCls || 'my-ui',
  };

  return (
    <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>
  );
};
