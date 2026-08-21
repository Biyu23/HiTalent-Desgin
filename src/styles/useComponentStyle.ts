import type { CSSInterpolation } from '@ant-design/cssinjs';
import { useStyleRegister } from '@ant-design/cssinjs';
import { theme } from 'antd';
import type { GlobalToken } from 'antd/es/theme/interface';
import type React from 'react';
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
 * @returns { wrapSSR, hashId, token }
 */
export function useComponentStyle(
  componentName: string,
  prefixCls: string,
  styleFn: (token: GlobalToken, prefixCls: string) => CSSInterpolation,
): UseComponentStyleResult {
  const { theme: antdTheme, token, hashId } = useToken();
  const wrapSSR = useStyleRegister(
    {
      theme: antdTheme,
      token,
      hashId,
      path: [PACKAGE_NAME, componentName, prefixCls],
    },
    () => {
      const styles = styleFn(token, prefixCls);
      return Array.isArray(styles) ? styles : [styles];
    },
  );

  return {
    wrapSSR,
    hashId,
    token,
  };
}
