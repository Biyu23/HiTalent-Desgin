import clsx from 'clsx';
import React, { ReactElement } from 'react';
import type { NativeProps } from '../types';

/**
 * 将自定义的原生属性（如 className、style、tabIndex、data-* 和 aria-*）合并到一个 React 元素中
 * @param props 包含原生属性的 props 对象
 * @param element 目标 React 元素
 * @returns 注入属性后的新 React 元素
 */
export function withNativeProps<P extends NativeProps>(
  props: P,
  element: ReactElement,
): ReactElement {
  const p: Record<string, unknown> = { ...element.props };

  if (props.className) {
    p.className = clsx(element.props.className, props.className);
  }

  if (props.style) {
    p.style = {
      ...(p.style as React.CSSProperties | undefined),
      ...props.style,
    };
  }

  if (props.tabIndex !== undefined) {
    p.tabIndex = props.tabIndex;
  }

  for (const [key, value] of Object.entries(props)) {
    if (key.startsWith('data-') || key.startsWith('aria-')) {
      p[key] = value;
    }
  }

  return React.cloneElement(element, p);
}
