import clsx from 'clsx';
import { useCallback, useContext, useMemo } from 'react';
import { ConfigContext, defaultPrefixCls } from './context';

/**
 * 获取组件 class 前缀 Hook
 * @param suffixCls 组件后缀名，如 'modal', 'drawer', 'table', 'btn'
 * @param customPrefix 显式自定义前缀
 * @returns 完整的 class 前缀字符串，例如 'htd-modal'
 */
export const usePrefixCls = (
  suffixCls?: string,
  customPrefix?: string,
): string => {
  const { getPrefixCls } = useContext(ConfigContext);
  return getPrefixCls
    ? getPrefixCls(suffixCls, customPrefix)
    : customPrefix ||
        (suffixCls ? `${defaultPrefixCls}-${suffixCls}` : defaultPrefixCls);
};

export interface UseNamespaceResult {
  /** 当前块前缀，等同于 b()，例如 'htd-modal' */
  prefixCls: string;
  /** 根前缀，例如 'htd' */
  rootPrefixCls: string;
  /** Block 生成器：b() -> 'htd-modal'；b('window') -> 'htd-modal-window' */
  b: (blockSuffix?: string) => string;
  /** Element 元素生成器：e('header') -> 'htd-modal-header' */
  e: (element: string) => string;
  /** Modifier 修饰符生成器：m('maximized') -> 'htd-modal-maximized' */
  m: (modifier: string) => string;
  /** Element-Modifier 组合生成器：em('header', 'draggable') -> 'htd-modal-header-draggable' */
  em: (element: string, modifier: string) => string;
  /** 状态修饰符：is('active', true) -> 'is-active' */
  is: (name: string, state?: boolean) => string;
  /** clsx 包装器，自动将 prefixCls 作为基准类名 */
  cls: (...args: any[]) => string;
}

/**
 * 统一命名空间与类名前缀生成 Hook
 *
 * 采用简洁一致的单连字符 `-` 连接命名风格：
 * - Block: `htd-modal`
 * - Element: `htd-modal-header`
 * - Modifier: `htd-modal-maximized`
 * - Element Modifier: `htd-modal-header-draggable`
 * - State: `is-active` / `is-resizing`
 *
 * @param suffixCls 组件后缀名，如 'modal', 'drawer', 'table'
 * @param customPrefix 显式自定义前缀
 */
export const useNamespace = (
  suffixCls?: string,
  customPrefix?: string,
): UseNamespaceResult => {
  const { prefixCls: rootPrefixCls, getPrefixCls } = useContext(ConfigContext);
  const resolvedRootPrefix = rootPrefixCls || defaultPrefixCls;

  const prefixCls = useMemo(() => {
    return getPrefixCls
      ? getPrefixCls(suffixCls, customPrefix)
      : customPrefix ||
          (suffixCls
            ? `${resolvedRootPrefix}-${suffixCls}`
            : resolvedRootPrefix);
  }, [getPrefixCls, suffixCls, customPrefix, resolvedRootPrefix]);

  const b = useCallback(
    (blockSuffix?: string) => {
      return blockSuffix ? `${prefixCls}-${blockSuffix}` : prefixCls;
    },
    [prefixCls],
  );

  const e = useCallback(
    (element: string) => (element ? `${prefixCls}-${element}` : ''),
    [prefixCls],
  );

  const m = useCallback(
    (modifier: string) => (modifier ? `${prefixCls}-${modifier}` : ''),
    [prefixCls],
  );

  const em = useCallback(
    (element: string, modifier: string) =>
      element && modifier ? `${prefixCls}-${element}-${modifier}` : '',
    [prefixCls],
  );

  const is = useCallback((name: string, state = true) => {
    return name && state ? `is-${name}` : '';
  }, []);

  const cls = useCallback(
    (...args: any[]) => clsx(prefixCls, ...args),
    [prefixCls],
  );

  return {
    prefixCls,
    rootPrefixCls: resolvedRootPrefix,
    b,
    e,
    m,
    em,
    is,
    cls,
  };
};
