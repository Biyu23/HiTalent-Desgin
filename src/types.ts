import React, { AriaAttributes } from 'react';
// 定义 NativeProps 接口
// 1. 交叉继承 React 官方的 AriaAttributes 以获得最精确的 aria-* 类型支持
// 2. 将 data-* 的值放宽为 any，兼容其他 UI 库可能透传的 boolean 或 number 类型
export type NativeProps<S extends string = never> = {
  className?: string;
  style?: React.CSSProperties & Partial<Record<S, string>>;
  tabIndex?: number;
  [key: `data-${string}`]: any;
} & AriaAttributes;
