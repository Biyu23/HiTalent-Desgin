import type React from 'react';

export type CSSVariableName = `--${string}`;

export type CSSPropertiesWithVars = React.CSSProperties &
  Partial<Record<CSSVariableName, string | number | undefined>>;

/**
 * 原生属性接口
 *
 * 设计意图：
 * - 统一所有组件的基础 DOM 属性（className、style、tabIndex、data-*），
 *   避免每个组件重复定义，同时保证类型一致性和可扩展性。
 * - data-* 的值放宽为 `string | number | boolean | undefined`，
 *   兼容 React 实际允许的 data 属性值范围。
 */
export type NativeProps = {
  className?: string;
  style?: CSSPropertiesWithVars;
  tabIndex?: number;
  [key: `data-${string}`]: string | number | boolean | undefined;
};
