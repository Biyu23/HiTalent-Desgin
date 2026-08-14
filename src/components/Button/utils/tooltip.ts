import type { TooltipProps } from 'antd';
import React from 'react';

/** 区分 Tooltip 配置对象和作为提示文案的 ReactNode。 */
export function isTooltipProps(
  value: unknown,
): value is Omit<TooltipProps, 'children'> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    !React.isValidElement(value)
  );
}
