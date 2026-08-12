import type { TooltipProps } from 'antd';
import { Button as AntdButton, Tooltip } from 'antd';
import React, { memo, useEffect, useRef, useState } from 'react';
import { withNativeProps } from '../../util';
import { ButtonProps } from './type';

/**
 * 类型守卫：判断 tooltip 值是否为 TooltipProps 配置对象，
 * 以区分「传配置对象」与「传 ReactNode 作为提示文案」两种用法。
 */
function isTooltipProps(
  value: unknown,
): value is Omit<TooltipProps, 'children'> {
  return (
    typeof value === 'object' && value !== null && !React.isValidElement(value)
  );
}

const Button: React.FC<ButtonProps> = (props) => {
  const {
    autoLoading = true,
    throttle = 0,
    onClick,
    children,
    disabled,
    tooltip,
    loading: propsLoading,
    ...restProps
  } = props;

  // const prefixCls = usePrefixCls('btn');
  // const buttonLocale = useLocale('Button');
  const [innerLoading, setInnerLoading] = useState(false);
  const isUnmounted = useRef(false);
  const isThrottling = useRef(false);
  const throttleTimerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    return () => {
      isUnmounted.current = true;
      // 清理未完成的节流定时器，避免卸载后副作用
      if (throttleTimerRef.current) {
        clearTimeout(throttleTimerRef.current);
      }
    };
  }, []);

  const combinedLoading = propsLoading || innerLoading;
  const needTooltip = !!tooltip;

  let tooltipTitle: React.ReactNode = undefined;
  let tooltipProps: Omit<TooltipProps, 'children' | 'title'> = {};

  if (needTooltip && isTooltipProps(tooltip)) {
    const { title, ...rest } = tooltip;
    tooltipTitle = title;
    tooltipProps = rest;
  } else if (needTooltip) {
    tooltipTitle = tooltip;
  }

  const executeClick = async (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    if (!onClick) return;
    const ret = onClick(e);
    if (autoLoading && ret && typeof ret.then === 'function') {
      setInnerLoading(true);
      try {
        await ret;
      } finally {
        if (!isUnmounted.current) {
          setInnerLoading(false);
        }
      }
    }
  };

  const handleClick = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    if (combinedLoading) return;
    if (throttle > 0) {
      if (isThrottling.current) return;
      isThrottling.current = true;
      throttleTimerRef.current = setTimeout(() => {
        isThrottling.current = false;
      }, throttle);
    }

    executeClick(e);
  };

  const buttonElement = (
    <AntdButton
      {...restProps}
      disabled={disabled}
      loading={combinedLoading}
      onClick={handleClick}
    >
      {children}
    </AntdButton>
  );

  return withNativeProps(
    props,
    needTooltip ? (
      <Tooltip title={tooltipTitle} {...tooltipProps}>
        {buttonElement}
      </Tooltip>
    ) : (
      buttonElement
    ),
  );
};

export default memo(Button);
