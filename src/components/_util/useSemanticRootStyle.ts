import type { CSSInterpolation } from '@ant-design/cssinjs';
import { useStyleRegister } from '@ant-design/cssinjs';
import { theme } from 'antd';
import { useRef } from 'react';
import type { CSSPropertiesWithVars } from '../../types';

let rootStyleSequence = 0;

export function useSemanticRootStyle(
  component: string,
  prefixCls: string,
  style?: CSSPropertiesWithVars,
) {
  const { theme: currentTheme, token, hashId } = theme.useToken();
  const idRef = useRef<number>();
  if (idRef.current === undefined) idRef.current = ++rootStyleSequence;
  const className = `${prefixCls}-semantic-root-${idRef.current}`;
  const styleKey = style ? JSON.stringify(style) : 'empty';
  const wrapSSR = useStyleRegister(
    {
      theme: currentTheme,
      token,
      hashId,
      path: [
        '@hi-talent/design',
        component,
        'semantic-root',
        className,
        styleKey,
      ],
    },
    () =>
      style
        ? ({ [`.${className}`]: style } as CSSInterpolation)
        : ([] as CSSInterpolation),
  );
  return { className: style ? className : undefined, wrapSSR };
}
