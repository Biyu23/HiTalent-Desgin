import type { CSSInterpolation } from '@ant-design/cssinjs';
import { useStyleRegister } from '@ant-design/cssinjs';
import { theme } from 'antd';
import { useRef } from 'react';
import type { CSSPropertiesWithVars } from '../../types';

let rootStyleSequence = 0;

function hashStyleKey(value: string) {
  let hash = 5381;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 33) ^ value.charCodeAt(index);
  }
  return (hash >>> 0).toString(36);
}

export function useSemanticRootStyle(
  component: string,
  prefixCls: string,
  style?: CSSPropertiesWithVars,
) {
  const { theme: currentTheme, token, hashId } = theme.useToken();
  const idRef = useRef<number>();
  if (idRef.current === undefined) idRef.current = ++rootStyleSequence;
  const styleKey = style ? JSON.stringify(style) : 'empty';
  const className = `${prefixCls}-semantic-root-${idRef.current}-${hashStyleKey(
    styleKey,
  )}`;
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
