import type { TooltipProps } from 'antd';
import { Button as AntdButton, Tooltip } from 'antd';
import React, { memo, useEffect, useRef, useState } from 'react';
import { isThenable, withNativeProps } from '../../util';
import type { ButtonProps } from './type';
import { isTooltipProps } from './utils/tooltip';

const Button = React.forwardRef<
  React.ComponentRef<typeof AntdButton>,
  ButtonProps
>((props, ref) => {
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
    isUnmounted.current = false;
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
    if (autoLoading && isThenable(ret)) {
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
      ref={ref}
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
});

export default memo(Button);
