import React, { useMemo } from 'react';
import { ConfigContext, ConfigContextProps, defaultConfig } from './context';

export interface ConfigProviderProps extends ConfigContextProps {
  children?: React.ReactNode;
}

export const ConfigProvider: React.FC<ConfigProviderProps> = ({
  prefixCls,
  locale,
  children,
}) => {
  const config = useMemo(
    () => ({
      prefixCls: prefixCls || defaultConfig.prefixCls,
      locale,
    }),
    [prefixCls, locale],
  );

  return (
    <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>
  );
};
