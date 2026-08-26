import type { ClassValue } from 'clsx';
import clsx from 'clsx';
import React, { createContext, useContext, useMemo } from 'react';
import { useConfig } from '../../configProvider';
import {
  useAntdPrefixCls,
  usePrefixCls,
} from '../../configProvider/usePrefixCls';

export interface ComponentNamespace {
  rootPrefixCls: string;
  prefixCls: string;
  antdPrefixCls: string;
  hashId: string;
  b: (blockSuffix?: string) => string;
  e: (element: string) => string;
  m: (modifier: string) => string;
  em: (element: string, modifier: string) => string;
  is: (name: string, state?: boolean) => string;
  cls: (...args: ClassValue[]) => string;
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
  const config = useConfig();
  const prefixCls = usePrefixCls(component, customPrefixCls);
  const antdPrefixCls = useAntdPrefixCls();

  return useMemo(() => {
    return {
      rootPrefixCls: config.prefixCls,
      prefixCls,
      antdPrefixCls,
      hashId,
      b: (blockSuffix?: string) =>
        blockSuffix ? `${prefixCls}-${blockSuffix}` : prefixCls,
      e: (element: string) => (element ? `${prefixCls}-${element}` : ''),
      m: (modifier: string) => (modifier ? `${prefixCls}-${modifier}` : ''),
      em: (element: string, modifier: string) =>
        element && modifier ? `${prefixCls}-${element}-${modifier}` : '',
      is: (name: string, state = true) => (name && state ? `is-${name}` : ''),
      cls: (...args: ClassValue[]) => clsx(prefixCls, ...args),
    };
  }, [antdPrefixCls, config.prefixCls, hashId, prefixCls]);
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
