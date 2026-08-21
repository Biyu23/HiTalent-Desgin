import React, { createContext, useContext, useMemo } from 'react';
import { ConfigContext } from '../../configProvider';

export interface ComponentNamespace {
  rootPrefixCls: string;
  prefixCls: string;
  antdPrefixCls: string;
  hashId: string;
  element: (name: string) => string;
  modifier: (name: string) => string;
  elementModifier: (element: string, modifier: string) => string;
}

const NamespaceContext = createContext<ComponentNamespace | null>(null);

export interface ComponentNamespaceProviderProps {
  value: ComponentNamespace;
  children?: React.ReactNode;
}

export const ComponentNamespaceProvider: React.FC<
  ComponentNamespaceProviderProps
> = ({ value, children }) => (
  <NamespaceContext.Provider value={value}>
    {children}
  </NamespaceContext.Provider>
);

export function useResolvedComponentNamespace(
  component: string,
  customPrefixCls: string | undefined,
  hashId: string,
): ComponentNamespace {
  const config = useContext(ConfigContext);
  const prefixCls = config.getPrefixCls(component, customPrefixCls);
  const antdPrefixCls = config.antdPrefixCls || 'ant';

  return useMemo(
    () => ({
      rootPrefixCls: config.prefixCls,
      prefixCls,
      antdPrefixCls,
      hashId,
      element: (name: string) => `${prefixCls}-${name}`,
      modifier: (name: string) => `${prefixCls}-${name}`,
      elementModifier: (element: string, modifier: string) =>
        `${prefixCls}-${element}-${modifier}`,
    }),
    [antdPrefixCls, config.prefixCls, hashId, prefixCls],
  );
}

export function useComponentNamespace(): ComponentNamespace {
  const namespace = useContext(NamespaceContext);
  if (!namespace) {
    throw new Error(
      'Component internals must be rendered inside ComponentNamespaceProvider.',
    );
  }
  return namespace;
}
