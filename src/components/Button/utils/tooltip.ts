import type { TooltipProps } from 'antd';
import type React from 'react';
import { isValidElement } from 'react';
import { isNullOrBlank } from '../../../util';

/** 区分 Tooltip 配置对象和作为提示文案的 ReactNode。 */
export function isTooltipProps(
  value: unknown,
): value is Omit<TooltipProps, 'children'> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    !isValidElement(value)
  );
}

export interface ParsedTooltipConfig {
  needTooltip: boolean;
  tooltipTitle: React.ReactNode;
  tooltipProps: Omit<TooltipProps, 'children' | 'title'>;
}

/** 解析并标准化 Tooltip 配置，结合 isNullOrBlank 处理空白值与边界情况 */
export function parseTooltipConfig(
  tooltip: React.ReactNode | Omit<TooltipProps, 'children'> | undefined,
): ParsedTooltipConfig {
  if (isNullOrBlank(tooltip, true) || tooltip === false) {
    return {
      needTooltip: false,
      tooltipTitle: undefined,
      tooltipProps: {},
    };
  }

  let tooltipTitle: React.ReactNode = undefined;
  let tooltipProps: Omit<TooltipProps, 'children' | 'title'> = {};

  if (isTooltipProps(tooltip)) {
    const { title, ...rest } = tooltip;
    tooltipTitle = title;
    tooltipProps = rest;
  } else {
    tooltipTitle = tooltip;
  }

  const needTooltip = !isNullOrBlank(tooltipTitle) && tooltipTitle !== false;

  return {
    needTooltip,
    tooltipTitle,
    tooltipProps,
  };
}
