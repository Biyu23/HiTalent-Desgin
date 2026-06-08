import React, { AriaAttributes } from 'react';

/**
 * 原生属性接口
 *
 * 设计意图：
 * - 统一所有组件的基础 DOM 属性（className、style、tabIndex、data-*、aria-*），
 *   避免每个组件重复定义，同时保证类型一致性和可扩展性。
 * - 交叉继承 React 官方的 AriaAttributes 以获得最精确的 aria-* 类型支持。
 * - data-* 的值放宽为 `string | number | boolean | undefined`，
 *   兼容 React 实际允许的 data 属性值范围。
 */
export type NativeProps<S extends string = never> = {
  className?: string;
  style?: React.CSSProperties & Partial<Record<S, string>>;
  tabIndex?: number;
  [key: `data-${string}`]: string | number | boolean | undefined;
} & AriaAttributes;
