import React from 'react';
import { ConfigContext, ConfigContextProps } from './context';

export interface CustomConfigProviderProps extends ConfigContextProps {
  children?: React.ReactNode;
}

export const CustomConfigProvider: React.FC<CustomConfigProviderProps> = ({
  prefixCls,
  locale,
  children,
}) => {
  // 合并用户传入的配置和默认配置
  const config = {
    prefixCls: prefixCls || 'my-ui',
    locale,
  };

  return (
    <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>
  );
};
