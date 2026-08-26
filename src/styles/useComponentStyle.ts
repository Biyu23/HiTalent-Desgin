import type { CSSInterpolation } from '@ant-design/cssinjs';
import { useStyleRegister } from '@ant-design/cssinjs';
import { theme } from 'antd';
import type { GlobalToken } from 'antd/es/theme/interface';
import type React from 'react';
import { useAntdPrefixCls } from '../configProvider/usePrefixCls';
import { PACKAGE_NAME } from './constant';

const { useToken } = theme;

export interface UseComponentStyleResult {
  wrapSSR: (node: React.ReactElement) => React.ReactElement;
  hashId: string;
  token: GlobalToken;
}

/**
 * 统一的业务组件 CSS-in-JS 样式注册 Hook
 *
 * @param componentName 组件标识，例如 'Drawer', 'Modal', 'Table'
 * @param prefixCls 类名前缀，例如 'htd-drawer'
 * @param styleFn 样式生成函数
 * @param customAntdPrefixCls 显式自定义 Ant Design 组件 class 前缀（可选，优先从 ConfigContext 和 Antd 原生 Context 自动读取）
 * @returns { wrapSSR, hashId, token }
 */
export function useComponentStyle(
  componentName: string,
  prefixCls: string,
  styleFn: (
    token: GlobalToken,
    prefixCls: string,
    antdPrefixCls: string,
  ) => CSSInterpolation,
  customAntdPrefixCls?: string,
): UseComponentStyleResult {
  const resolvedAntdPrefixCls = useAntdPrefixCls(customAntdPrefixCls);
  const { theme: antdTheme, token, hashId } = useToken();
  const path = [PACKAGE_NAME, componentName, prefixCls, resolvedAntdPrefixCls];

  const wrapSSR = useStyleRegister(
    {
      theme: antdTheme,
      token,
      hashId,
      path,
    },
    () => {
      const styles = styleFn(token, prefixCls, resolvedAntdPrefixCls);
      return Array.isArray(styles) ? styles : [styles];
    },
  );

  return {
    wrapSSR,
    hashId,
    token,
  };
}
