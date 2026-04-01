import clsx from 'clsx';
import React, { AriaAttributes, ReactElement } from 'react';

// 定义 NativeProps 接口
// 1. 交叉继承 React 官方的 AriaAttributes 以获得最精确的 aria-* 类型支持
// 2. 将 data-* 的值放宽为 any，兼容其他 UI 库可能透传的 boolean 或 number 类型
export type NativeProps<S extends string = never> = {
  className?: string;
  style?: React.CSSProperties & Partial<Record<S, string>>;
  tabIndex?: number;
  [key: `data-${string}`]: any;
} & AriaAttributes;
/**
 * 将自定义的原生属性（如 className、style、tabIndex、data-* 和 aria-*）合并到一个 React 元素中
 * * @param props 包含原生属性的 props 对象
 * @param element 目标 React 元素
 * @returns 注入属性后的新 React 元素
 */
export function withNativeProps<P extends NativeProps>(
  props: P,
  element: ReactElement,
): ReactElement {
  const p: Record<string, any> = { ...element.props };

  // 1. 合并 className
  if (props.className) {
    p.className = clsx(element.props.className, props.className);
  }

  // 2. 合并 style
  if (props.style) {
    p.style = {
      ...p.style,
      ...props.style,
    };
  }

  // 3. 覆盖 tabIndex
  if (props.tabIndex !== undefined) {
    p.tabIndex = props.tabIndex;
  }

  // 4. 提取并合并 data-* 和 aria-* 属性
  for (const [key, value] of Object.entries(props)) {
    if (key.startsWith('data-') || key.startsWith('aria-')) {
      p[key] = value;
    }
  }

  return React.cloneElement(element, p);
}
