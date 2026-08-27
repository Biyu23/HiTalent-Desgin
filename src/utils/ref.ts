import type React from 'react';

/**
 * 安全地向 React Ref 赋值（支持函数式 ref 和 MutableRefObject）
 * @param ref 目标 ref（函数或 ref 对象）
 * @param value 要赋予的目标值
 */
export function setRef<T>(
  ref: React.Ref<T> | undefined,
  value: T | null,
): void {
  if (typeof ref === 'function') {
    ref(value);
  } else if (ref && typeof ref === 'object' && 'current' in ref) {
    (ref as React.MutableRefObject<T | null>).current = value;
  }
}
